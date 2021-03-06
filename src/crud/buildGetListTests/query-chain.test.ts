//During the test the env variable is set to test
process.env.NODE_ENV = "test";

//Require the dev-dependencies
import * as chai from "chai";
import "chai-http";
import { buildGetList } from "../../index";
import Post from "../../../server/models/post.model";
import Category from "../../../server/models/category.model";
import TestServer from "../../../server/TestServer";

let should = chai.should();

chai.use(require("chai-http"));

const testServer = new TestServer();

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const getPostList = buildGetList({
  model: Post,
  getItemsQueryChain: (getItems) => getItems.populate("category1"),
});

testServer.app.get("/posts", getPostList);

const posts: any[] = [];
const categories: any[] = [];

//Our parent block
describe("Test build get list with query chain", () => {
  before(async () => {
    await testServer.start();

    await Category.deleteMany({});
    for (let i = 0; i < 3; i++) {
      const item = await Category.create({
        title: "Category " + i,
        description: "Description " + i,
        category1: categories[0],
        category2: categories[1],
        category3: categories[3],
      });
      categories.push(item);
    }

    await Post.deleteMany({});
    for (let i = 0; i < 10; i++) {
      const item = await Post.create({
        number: i,
        views: i,
        title: "Post " + i,
        description: "Description " + i,
        deleted: i < 50 ? false : true,
      });
      posts.push(item);
    }
  });
  after(async () => {
    await testServer.close();
    console.log("closed");
  });

  it("default query chain", async () => {
    let expectedItems = await Post.find({}).populate("category1");
    expectedItems = JSON.parse(JSON.stringify(expectedItems));

    const res = await chai.request(testServer.server).get("/posts");

    console.log(res.body);

    res.should.have.status(200);
    const body = res.body;
    body.should.be.a("object");
    body.total.should.be.eql(expectedItems.length);
    body.items.should.be.a("array");
    body.items.length.should.be.eql(expectedItems.length);
    body.items.should.be.eql(expectedItems);
  });
});
