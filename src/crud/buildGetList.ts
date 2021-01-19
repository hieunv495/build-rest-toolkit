import { Request, Response } from "express";
import * as mongoose from "mongoose";
import FilterParser, { FilterParserConfig } from "./FilterParser";
import PaginationParser, { PaginationParserConfig } from "./PaginationParser";

const buildGetList = ({
  model,
  queryFilter,
  defaultFilter,
  sort,
  pagination,
  populate,
  queryChain,
}: {
  model: string | mongoose.Model<mongoose.Document<any>>;
  queryFilter?: FilterParserConfig;
  defaultFilter?: { [key: string]: any };
  sort?: any;
  pagination?: PaginationParserConfig;
  populate?: any;
  queryChain?: (
    query: mongoose.Query<mongoose.Document<any>[], mongoose.Document<any>>
  ) => mongoose.Query<mongoose.Document<any>[], mongoose.Document<any>>;
}) => {
  const finalModel: mongoose.Model<mongoose.Document<any>> =
    typeof model === "string" ? mongoose.model(model) : model;

  let paginationParser: PaginationParser;
  if (pagination) {
    paginationParser = new PaginationParser(pagination);
  }
  let queryFilterParser: FilterParser;
  if (queryFilter) {
    queryFilterParser = new FilterParser(queryFilter);
  }

  return async (req: Request, res: Response) => {
    try {
      let finalFilter: { [key: string]: any } = defaultFilter || {};

      // Filter
      if (queryFilter) {
        const parsedFilter = await queryFilterParser.parse(req);
        finalFilter = { ...finalFilter, ...(await parsedFilter) };
      }

      // Main Query
      let getItems = finalModel.find(finalFilter);

      // Pagination
      if (pagination) {
        const { limit, offset } = await paginationParser.parse(req);
        getItems = getItems.skip(offset).limit(limit);
      }

      // Sort
      if (sort) {
        if (typeof sort === "function") {
          sort = await sort(req);
        }
        getItems = getItems.sort(sort);
      }

      // Populate
      if (populate) {
        if (typeof populate === "function") {
          populate = await populate(req);
        }
        getItems = getItems.populate(populate);
      }

      // Query chain
      if (queryChain && typeof queryChain === "function") {
        getItems = queryChain(getItems);
      }

      // Count items
      const getTotal = finalModel.count(finalFilter);

      // Await all
      const [items, total] = await Promise.all([getItems, getTotal]);

      return res.json({ items, total });
    } catch (error) {
      // console.error(error);
      res.status(error.status || 512).json({ message: error.message });
    }
  };
};

export default buildGetList;
