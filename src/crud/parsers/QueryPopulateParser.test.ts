process.env.NODE_ENV = "test";
import * as chai from "chai";
import { expect } from "chai";
import { Request } from "express";
import QueryPopulateParser from "./QueryPopulateParser";
let should = chai.should();

let populateParser = new QueryPopulateParser(["category1", "category2"]);

//Our parent block
describe("QueryPopulateParser", () => {
  before: () => {};

  it("empty", async () => {
    const req = ({ query: {} } as unknown) as Request;
    const result = await populateParser.parse(req);
    expect(result).equal(undefined);
  });

  it("default should return value", async () => {
    const req = ({ query: { populate: "category1" } } as unknown) as Request;
    const result = await populateParser.parse(req);
    result.should.be.equal("category1");
  });

  it("not contains should return declared field only", async () => {
    const req = ({
      query: { populate: "category1 category-other" },
    } as unknown) as Request;
    const result = await populateParser.parse(req);
    expect(result).equal("category1");
  });

  it("combine should return value", async () => {
    const req = ({
      query: { populate: "category1 category-other category2" },
    } as unknown) as Request;
    const result = await populateParser.parse(req);
    expect(result).equal("category1 category2");
  });

  it("combine with separator ',' should return value", async () => {
    const req = ({
      query: { populate: "category1 , category-other ,category2" },
    } as unknown) as Request;
    const result = await populateParser.parse(req);
    expect(result).equal("category1 category2");
  });

  it("with custom query field should return value", async () => {
    let populateParser2 = new QueryPopulateParser({
      queryField: "custom-populate",
      fields: ["category1", "category2"],
    });

    const req = ({
      query: { "custom-populate": "category1 , category-other ,category2" },
    } as unknown) as Request;
    const result = await populateParser2.parse(req);
    expect(result).equal("category1 category2");
  });
});
