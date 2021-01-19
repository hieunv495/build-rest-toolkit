process.env.NODE_ENV = "test";
import * as chai from "chai";
import { expect } from "chai";
import { Request } from "express";
import QueryPaginationParser from "./QueryPaginationParser";
let should = chai.should();

//Our parent block
describe("QueryPaginationParser", () => {
  it("default", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: {} } as unknown) as Request;

    const result = await paginationParser.parse(req);
    result.offset.should.be.a("number");
    result.limit.should.be.a("number");
  });

  it("combine limit and offset should return value", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({
      query: { offset: "1", limit: "100" },
    } as unknown) as Request;

    const result = await paginationParser.parse(req);
    result.offset.should.be.equal(1);
    result.limit.should.be.equal(100);
  });

  it("offset should return value", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { offset: "1" } } as unknown) as Request;

    const result = await paginationParser.parse(req);
    result.offset.should.be.equal(1);
  });

  it("offset === -1 should throw error", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { offset: "-1" } } as unknown) as Request;

    try {
      const result = await paginationParser.parse(req);
      throw new Error();
    } catch (error) {
      error.status.should.be.equal(412);
    }
  });

  it("offset not a number should throw error", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { offset: "invalid" } } as unknown) as Request;

    try {
      const result = await paginationParser.parse(req);
      throw new Error();
    } catch (error) {
      error.status.should.be.equal(412);
    }
  });

  it("limit should return value", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { limit: "2" } } as unknown) as Request;

    const result = await paginationParser.parse(req);
    result.limit.should.be.equal(2);
  });

  it("limit == 0 should throw error", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { limit: "0" } } as unknown) as Request;

    try {
      const result = await paginationParser.parse(req);
      throw new Error();
    } catch (error) {
      error.status.should.be.equal(412);
    }
  });

  it("limit == -1 should throw error", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { limit: "-1" } } as unknown) as Request;

    try {
      const result = await paginationParser.parse(req);
      throw new Error();
    } catch (error) {
      error.status.should.be.equal(412);
    }
  });
  it("limit not a number should throw error", async () => {
    const paginationParser = new QueryPaginationParser();
    const req = ({ query: { limit: "not-a-number" } } as unknown) as Request;

    try {
      const result = await paginationParser.parse(req);
      throw new Error();
    } catch (error) {
      error.status.should.be.equal(412);
    }
  });
});
