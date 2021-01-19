//During the test the env variable is set to test
process.env.NODE_ENV = "test";

//Require the dev-dependencies
import * as chai from "chai";
import "chai-http";
import { connect, close } from "../server";

import * as mongoose from "mongoose";
import { Server } from "http";
const Post = mongoose.model("Post");

let should = chai.should();

chai.use(require("chai-http"));

let server: Server;

//Our parent block
describe("Pets", () => {
  before(async () => {
    const result = await connect();
    server = result.server;
  });
  after(async () => {
    await close();
    console.log("closed");
  });
  beforeEach(async () => {
    //Before each test we empty the database in your case
    await Post.deleteMany({});
    for (let i = 0; i < 10; i++) {
      await Post.create({
        title: "Post " + i,
        description: "any " + i,
      });
    }
  });

  /*
   * Test the /GET route
   */
  describe("/GET pets", () => {
    it("it should GET all the pets", (done) => {
      chai
        .request(server)
        .get("/posts")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(10); // fixme :)
          done();
        });
    });
  });
});
