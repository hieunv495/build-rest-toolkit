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
  pagination: {
    defaultLimit: 5,
  },
});

testServer.app.get("/posts", getPostList);

//Our parent block
describe("Build get list", () => {
  before(async () => {
    await testServer.start();
  });
  after(async () => {
    await testServer.close();
    console.log("closed");
  });
  beforeEach(async () => {
    //Before each test we empty the database in your case
    await Post.deleteMany({});
    for (let i = 0; i < 100; i++) {
      await Post.create({
        number: i,
        title: "Post " + i,
        description: "Description " + i,
      });
    }
  });

  /*
   * Test the /GET route
   */
  describe("Offset and page", () => {
    it("default", (done) => {
      chai
        .request(testServer.server)
        .get("/posts")
        .end((err, res) => {
          // console.log(res.body);
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([0, 1, 2, 3, 4]);
          done();
        });
    });

    it("Offset 0", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=0")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([0, 1, 2, 3, 4]);
          done();
        });
    });

    it("Offset 1", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=1")
        .end((err, res) => {
          // console.log(res.body);
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([1, 2, 3, 4, 5]);
          done();
        });
    });

    it("Offset 2", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=2")
        .end((err, res) => {
          // console.log(res.body);
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([2, 3, 4, 5, 6]);
          done();
        });
    });

    it("Offset -1 should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=-1")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("Offset 1000 should be empty", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=1000")
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(0);
          done();
        });
    });

    it("Offset invalid should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=invalid_offset")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("Page 0 should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?page=0")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("Page 1", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?page=1")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([0, 1, 2, 3, 4]);
          done();
        });
    });

    it("Page 2", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?page=2")
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([5, 6, 7, 8, 9]);
          done();
        });
    });

    it("Page 1000 should return empty", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?page=1000")
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(0);

          done();
        });
    });

    it("Page invalid should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?page=invalid_string")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("it should return offset 1 and limit 10", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=1&limit=10")
        .end((err, res) => {
          // console.log(res.body);
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(10);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          done();
        });
    });

    it("it should return 10 items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=10")
        .end((err, res) => {
          // console.log(res.body);
          const body = res.body;
          res.should.have.status(200);
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(10);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
          done();
        });
    });
  });

  describe("Limit", () => {
    it("default should return 5 items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(5);
          body.items
            .map((item: any) => item.number)
            .should.be.eql([0, 1, 2, 3, 4]);
          done();
        });
    });

    it("limit 0 should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=0")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("limit -1 should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=-1")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("limit 1 should return 1 item", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=1")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(1);
          body.items.map((item: any) => item.number).should.be.eql([0]);
          done();
        });
    });

    it("limit 2 should return 2 items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=2")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(2);
          body.items.map((item: any) => item.number).should.be.eql([0, 1]);
          done();
        });
    });
    it("limit 1000 should return 100 items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=1000")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(100);
          body.items
            .map((item: any) => item.number)
            .should.be.eql(
              Array(100)
                .fill(null)
                .map((_, i) => i)
            );
          done();
        });
    });

    it("limit invalid should return status 412", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?limit=invalid_limit")
        .end((err, res) => {
          res.should.have.status(412);
          done();
        });
    });

    it("combine limit and offset should return items", (done) => {
      chai
        .request(testServer.server)
        .get("/posts?offset=1&limit=10")
        .end((err, res) => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.total.should.be.eql(100);
          body.items.should.be.a("array");
          body.items.length.should.be.eql(10);
          body.items
            .map((item: any) => item.number)
            .should.be.eql(
              Array(10)
                .fill(null)
                .map((_, i) => i + 1)
            );
          done();
        });
    });
  });
});
