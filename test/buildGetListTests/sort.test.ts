//During the test the env variable is set to test
process.env.NODE_ENV = "test";

//Require the dev-dependencies
import * as chai from "chai";
import "chai-http";
import { buildGetList } from "../../src/index";
import Post from "../../server/models/post.model";
import TestServer from "../../server/TestServer";

let should = chai.should();

chai.use(require("chai-http"));

const testServer = new TestServer();

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const getPostList = buildGetList({
  model: Post,
  defaultSort: "number",
  querySort: { fields: ["title", "views", "createdAt"] },
});

testServer.app.get("/posts", getPostList);

//Our parent block
describe("Test build get list with sort", () => {
  before(async () => {
    await testServer.start();

    await Post.deleteMany({});
    for (let i = 0; i < 100; i++) {
      await Post.create({
        number: i,
        views: i,
        title: "Post " + i,
        description: "Description " + i,
        deleted: i < 50 ? false : true,
      });
    }
  });
  after(async () => {
    await testServer.close();
    console.log("closed");
  });

  it("empty sort should return default sort", (done) => {
    const expectedItems = Array(100)
      .fill(null)
      .map((_, i) => i)
      .sort((a, b) => a - b);

    chai
      .request(testServer.server)
      .get("/posts")
      .end((err, res) => {
        res.should.have.status(200);
        const body = res.body;
        body.should.be.a("object");
        body.total.should.be.eql(expectedItems.length);
        body.items.should.be.a("array");
        body.items.length.should.be.eql(expectedItems.length);
        body.items.map((item: any) => item.number).should.be.eql(expectedItems);
        done();
      });
  });

  it("empty sort should return default sort", (done) => {
    const expectedItems = Array(100)
      .fill(null)
      .map((_, i) => i)
      .sort((a, b) => a - b);

    chai
      .request(testServer.server)
      .get("/posts")
      .end((err, res) => {
        res.should.have.status(200);
        const body = res.body;
        body.should.be.a("object");
        body.total.should.be.eql(expectedItems.length);
        body.items.should.be.a("array");
        body.items.length.should.be.eql(expectedItems.length);
        body.items.map((item: any) => item.number).should.be.eql(expectedItems);
        done();
      });
  });

  it("sort views should return sorted items", (done) => {
    const expectedItems = Array(100)
      .fill(null)
      .map((_, i) => i)
      .sort((a, b) => b - a);

    chai
      .request(testServer.server)
      .get("/posts?sort=-views")
      .end((err, res) => {
        res.should.have.status(200);
        const body = res.body;
        body.should.be.a("object");
        body.total.should.be.eql(expectedItems.length);
        body.items.should.be.a("array");
        body.items.length.should.be.eql(expectedItems.length);
        body.items.map((item: any) => item.number).should.be.eql(expectedItems);
        done();
      });
  });

  it("combine sort with space separate should return sorted items", (done) => {
    const expectedItems = Array(100)
      .fill(null)
      .map((_, i) => i)
      .sort((a, b) => b - a);

    chai
      .request(testServer.server)
      .get("/posts?sort=-views createdAt")
      .end((err, res) => {
        res.should.have.status(200);
        const body = res.body;
        body.should.be.a("object");
        body.total.should.be.eql(expectedItems.length);
        body.items.should.be.a("array");
        body.items.length.should.be.eql(expectedItems.length);
        body.items.map((item: any) => item.number).should.be.eql(expectedItems);
        done();
      });
  });

  it("combine sort with ',' separate should return sorted items", (done) => {
    const expectedItems = Array(100)
      .fill(null)
      .map((_, i) => i)
      .sort((a, b) => b - a);

    chai
      .request(testServer.server)
      .get("/posts?sort=-views ,createdAt")
      .end((err, res) => {
        res.should.have.status(200);
        const body = res.body;
        body.should.be.a("object");
        body.total.should.be.eql(expectedItems.length);
        body.items.should.be.a("array");
        body.items.length.should.be.eql(expectedItems.length);
        body.items.map((item: any) => item.number).should.be.eql(expectedItems);
        done();
      });
  });
});
