import { Request, Response } from "express";
import * as mongoose from "mongoose";
import QueryFilterParser, {
  FilterParserConfig,
} from "./parsers/QueryFilterParser";
import QueryPaginationParser, {
  PaginationParserConfig,
} from "./parsers/QueryPaginationParser";

const buildGetList = ({
  model,
  defaultFilter,
  queryFilter,
  sort,
  pagination,
  populate,
  queryChain,
}: {
  model: string | mongoose.Model<mongoose.Document<any>>;
  defaultFilter?: { [key: string]: any };
  queryFilter?: FilterParserConfig;
  sort?: any;
  pagination?: PaginationParserConfig;
  populate?: any;
  queryChain?: (
    query: mongoose.Query<mongoose.Document<any>[], mongoose.Document<any>>
  ) => mongoose.Query<mongoose.Document<any>[], mongoose.Document<any>>;
}) => {
  const finalModel: mongoose.Model<mongoose.Document<any>> =
    typeof model === "string" ? mongoose.model(model) : model;

  let queryPaginationParser: QueryPaginationParser;
  if (pagination) {
    if (pagination === true) {
      queryPaginationParser = new QueryPaginationParser();
    } else {
      queryPaginationParser = new QueryPaginationParser(pagination);
    }
  }
  let queryFilterParser: QueryFilterParser;
  if (queryFilter) {
    queryFilterParser = new QueryFilterParser(queryFilter);
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
        const { limit, offset } = await queryPaginationParser.parse(req);
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
