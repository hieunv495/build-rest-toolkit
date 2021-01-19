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
  defaultFilter: {
    deleted: false,
  },
  queryFilter: ["title", { field: "description", search: true }],
});

testServer.app.get("/posts", getPostList);

//Our parent block
describe("Test filter", () => {
  before(async () => {
    await testServer.start();

    await Post.deleteMany({});
    for (let i = 0; i < 100; i++) {
      await Post.create({
        number: i,
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

  describe("Filter", () => {
    it("default filter should return items", (done) => {
      const expectedItems = Array(50)
        .fill(null)
        .map((_, i) => i);

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
          body.items
            .map((item: any) => item.number)
            .should.be.eql(expectedItems);
          done();
        });
    });

    it("normal filter should return items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?title=Post 1")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(1);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(1);
          body.items.map((item: any) => item.number).should.be.eql([1]);
          done();
        });
    });

    it("normal filter should return empty", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?title=abcdxyz")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(0);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(0);
          done();
        });
    });

    it("search filter should return items", (done) => {
      const searchText = "1";
      const expectedItems = Array(50)
        .fill(null)
        .map((_, i) => i + "")
        .filter((item) => item.includes(searchText))
        .map((item) => parseInt(item));

      chai
        .request(testServer.server)
        .get(`/posts?description=${searchText}`)
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(expectedItems.length);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(expectedItems.length);
          body.items
            .map((item: any) => item.number)
            .should.be.eql(expectedItems);
          done();
        });
    });

    it("search filter should return empty", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?description=abcdxyz")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(0);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(0);
          done();
        });
    });
  });
});
