process.env.NODE_ENV = "test";
import * as chai from "chai";
import { Request } from "express";
import QueryFilterParser from "./QueryFilterParser";
let should = chai.should();

const config = [
  "field_1",
  { field: "field_2" },
  {
    field: {
      modelField: "model_field_3",
      queryField: "query_field_3",
    },
  },
  {
    field: "field_4",
    search: true,
  },
  {
    field: {
      modelField: "model_field_5",
      queryField: "query_field_5",
    },
    search: true,
  },
];

let filterParser = new QueryFilterParser(config);

//Our parent block
describe("QueryFilterParser", () => {
  before: () => {};

  it("default", async () => {
    const req = ({ query: {} } as unknown) as Request;
    const result = await filterParser.parse(req);
    result.should.be.deep.equal({});
  });

  it("field string", async () => {
    const req = ({ query: { field_1: "field_1_value" } } as unknown) as Request;
    const result = await filterParser.parse(req);
    result.should.be.deep.equal({ field_1: "field_1_value" });
  });

  it("field string 2", async () => {
    const req = ({
      query: { field_2: "field_2_value" },
    } as unknown) as Request;

    const result = await filterParser.parse(req);
    result.should.be.deep.equal({ field_2: "field_2_value" });
  });

  it("model field and query field", async () => {
    const req = ({
      query: { query_field_3: "field_3_value" },
    } as unknown) as Request;
    const result = await filterParser.parse(req);
    result.should.be.deep.equal({ model_field_3: "field_3_value" });
  });

  it("search field", async () => {
    const req = ({
      query: { field_4: "field_4_value" },
    } as unknown) as Request;

    const result = await filterParser.parse(req);
    result.should.be.deep.equal({
      field_4: { $regex: "field_4_value", $options: "i" },
    });
  });

  it("model field and query field search", async () => {
    const req = ({
      query: { query_field_5: "field_5_value" },
    } as unknown) as Request;
    const result = await filterParser.parse(req);
    result.should.be.deep.equal({
      model_field_5: { $regex: "field_5_value", $options: "i" },
    });
  });

  it("combine", async () => {
    const req = ({
      query: {
        field_1: "field_1_value",
        field_2: "field_2_value",
        query_field_3: "field_3_value",
        field_4: "field_4_value",
        query_field_5: "field_5_value",
      },
    } as unknown) as Request;
    const result = await filterParser.parse(req);
    result.should.be.deep.equal({
      field_1: "field_1_value",
      field_2: "field_2_value",
      model_field_3: "field_3_value",
      field_4: { $regex: "field_4_value", $options: "i" },
      model_field_5: { $regex: "field_5_value", $options: "i" },
    });
  });
});
