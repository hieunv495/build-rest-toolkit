import { Request, Response } from "express";
import * as mongoose from "mongoose";
import QueryFilterParser, {
  FilterParserConfig,
} from "./parsers/QueryFilterParser";
import QueryPaginationParser, {
  PaginationParserConfig,
} from "./parsers/QueryPaginationParser";
import QueryPopulateParser, {
  QueryPopulateParserConfig,
} from "./parsers/QueryPopulateParser";
import QuerySortParser, {
  QuerySortParserConfig,
} from "./parsers/QuerySortParser";

const buildGetList = ({
  model,
  defaultFilter,
  queryFilter,
  defaultSort,
  querySort,
  pagination,
  defaultPopulate,
  queryPopulate,
  getItemsQueryChain,
}: {
  model: string | mongoose.Model<mongoose.Document<any>>;
  defaultFilter?: { [key: string]: any };
  queryFilter?: FilterParserConfig;
  defaultSort?: any;
  querySort?: QuerySortParserConfig;
  pagination?: PaginationParserConfig;
  defaultPopulate?: any;
  queryPopulate?: QueryPopulateParserConfig;
  getItemsQueryChain?: (
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

  let querySortParser: QuerySortParser;
  if (querySort) {
    querySortParser = new QuerySortParser(querySort);
  }

  let queryPopulateParser: QueryPopulateParser;
  if (queryPopulate) {
    queryPopulateParser = new QueryPopulateParser(queryPopulate);
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

      // Query chain
      if (getItemsQueryChain) {
        getItems = getItemsQueryChain(getItems);
      }

      // Pagination
      if (pagination) {
        const { limit, offset } = await queryPaginationParser.parse(req);
        getItems = getItems.skip(offset).limit(limit);
      }

      // Sort
      if (querySort) {
        const parsedSortData = querySortParser.parse(req);
        if (parsedSortData) {
          getItems = getItems.sort(parsedSortData);
        } else if (defaultSort) {
          getItems = getItems.sort(defaultSort);
        }
      } else if (defaultSort) {
        getItems = getItems.sort(defaultSort);
      }

      // Default Populate
      if (defaultPopulate) {
        if (typeof defaultPopulate === "function") {
          defaultPopulate = await defaultPopulate(req);
        }
        getItems = getItems.populate(defaultPopulate);
      }

      // Query Populate
      if (queryPopulate) {
        const parsedPopulateData = queryPopulateParser.parse(req);
        if (parsedPopulateData) {
          getItems = getItems.populate(parsedPopulateData);
        }
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
