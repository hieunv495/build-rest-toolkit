import { Request } from "express";

export type PaginationParserConfig = {
  getLimit?: (req: Request) => number | Promise<number>;
  getOffset?: (req: Request) => number | Promise<number>;
  defaultLimit?: number;
  defaultOffset?: number;
};

const buildGetLimit = () => (req: Request): number => {
  if (req.query["limit"]) {
    const limit = parseInt(req.query["limit"] as string);
    let errorMessage: string;
    if (Number.isNaN(limit)) {
      errorMessage = "Limit invalid. Limit should be a number.";
    } else if (limit < 1) {
      errorMessage = "Limit invalid. Limit should greater than or equal to 1.";
    }

    if (errorMessage) {
      const error = new Error(errorMessage);
      (error as any).status = 412;
      throw error;
    }

    return limit;
  }
};

const buildGetOffset = ({
  getLimit,
  defaultLimit,
}: {
  getLimit: PaginationParserConfig["getLimit"];
  defaultLimit: number;
}) => async (req: Request): Promise<number> => {
  if (req.query["offset"]) {
    const offset = parseInt(req.query["offset"] as string);

    let errorMessage: string;
    if (Number.isNaN(offset)) {
      errorMessage = "Invalid offset. Offset should be a number.";
    } else if (offset < 0) {
      errorMessage =
        "Invalid offset. Offset should be greater than or equal to 0. ";
    }
    if (errorMessage) {
      const error = new Error(errorMessage);
      (error as any).status = 412;
      throw error;
    }
    return offset;
  } else if (req.query["page"]) {
    const page = parseInt(req.query["page"] as string);

    let errorMessage: string;
    if (Number.isNaN(page)) {
      errorMessage = "Invalid page.Page should be a number.";
    } else if (page < 1) {
      errorMessage = "Invalid page. Page should be greater than or equal to 1.";
    }
    if (errorMessage) {
      const error = new Error(errorMessage);
      (error as any).status = 412;
      throw error;
    }

    const limit = (await getLimit(req)) || defaultLimit;
    const offset = (page - 1) * limit;
    return offset;
  }
};

export default class QueryPaginationParser {
  DEFAULT_LIMIT = 10;
  DEFAULT_OFFSET = 0;
  config: PaginationParserConfig;

  defaultLimit: number;
  defaultOffset: number;

  getLimit: (req: Request) => number | Promise<number>;
  getOffset: (req: Request) => number | Promise<number>;

  constructor(config?: PaginationParserConfig) {
    if (!config) {
      this.defaultLimit = this.DEFAULT_LIMIT;
      this.defaultOffset = this.DEFAULT_OFFSET;
      this.getLimit = buildGetLimit();
      this.getOffset = buildGetOffset({
        getLimit: this.getLimit,
        defaultLimit: this.defaultLimit,
      });
    } else if (typeof config === "object") {
      this.defaultLimit = config.defaultLimit || this.DEFAULT_LIMIT;
      this.defaultOffset = config.defaultOffset || this.DEFAULT_OFFSET;
      this.getLimit = config.getLimit || buildGetLimit();
      this.getOffset =
        config.getOffset ||
        buildGetOffset({
          getLimit: this.getLimit,
          defaultLimit: this.defaultLimit,
        });
    } else {
      throw new Error("Invalid pagination config");
    }
  }

  parse = async (req: Request): Promise<{ offset: number; limit: number }> => {
    const [limit, offset] = await Promise.all([
      this.getLimit(req),
      this.getOffset(req),
    ]);
    return {
      limit: limit || this.defaultLimit,
      offset: offset || this.defaultOffset,
    };
  };
}
