process.env.NODE_ENV = "test";
import * as chai from "chai";
import { expect } from "chai";
import { Request } from "express";
import QuerySortParser from "./QuerySortParser";
let should = chai.should();

let sortParser = new QuerySortParser(["number", "createdAt"]);

//Our parent block
describe("QuerySortParser", () => {
  before: () => {};

  it("empty", async () => {
    const req = ({ query: {} } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal(undefined);
  });

  it("default should return value", async () => {
    const req = ({ query: { sort: "number" } } as unknown) as Request;
    const result = await sortParser.parse(req);
    result.should.be.equal("number");
  });

  it("desc should return desc value", async () => {
    const req = ({ query: { sort: "-number" } } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal("-number");
  });

  it("asc should return asc value", async () => {
    const req = ({ query: { sort: "+number" } } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal("+number");
  });

  it("not contains should return declared field only", async () => {
    const req = ({
      query: { sort: "number number-other" },
    } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal("number");
  });

  it("combine should return value", async () => {
    const req = ({
      query: { sort: "number number-other -createdAt" },
    } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal("number -createdAt");
  });

  it("combine with separator ',' should return value", async () => {
    const req = ({
      query: { sort: "number , number-other ,-createdAt" },
    } as unknown) as Request;
    const result = await sortParser.parse(req);
    expect(result).equal("number -createdAt");
  });

  it("with custom query field should return value", async () => {
    let sortParser2 = new QuerySortParser({
      queryField: "custom-sort",
      fields: ["number", "createdAt"],
    });

    const req = ({
      query: { "custom-sort": "number , number-other ,-createdAt" },
    } as unknown) as Request;
    const result = await sortParser2.parse(req);
    expect(result).equal("number -createdAt");
  });
});
