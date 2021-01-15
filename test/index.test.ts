//During the test the env variable is set to test
process.env.NODE_ENV = "test";

//Require the dev-dependencies
import * as chai from "chai";
import "chai-http";
import server from "./server";

let should = chai.should();

chai.use(require("chai-http"));

//Our parent block
describe("Pets", () => {
  beforeEach((done) => {
    //Before each test we empty the database in your case
    done();
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
          res.body.length.should.be.eql(5); // fixme :)
          done();
        });
    });
  });
});
