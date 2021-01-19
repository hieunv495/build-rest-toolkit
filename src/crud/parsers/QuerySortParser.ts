import { Request } from "express";

export type QuerySortParserConfig =
  | string[]
  | {
      queryField?: string;
      fields: string[];
    };

export default class QuerySortParser {
  DEFAULT_QUERY_FIELD = "sort";
  queryField: string;
  fields: string[];
  constructor(config: QuerySortParserConfig) {
    if (config instanceof Array) {
      this.queryField = this.DEFAULT_QUERY_FIELD;
      this.fields = config;
    } else {
      this.queryField = config.queryField || this.DEFAULT_QUERY_FIELD;
      this.fields = config.fields;
    }
  }

  parse = (req: Request): any => {
    const data = req.query[this.queryField] as string;
    if (!data) return undefined;

    // '   1, 2, 3 ' => ['1', '2', '3']
    let tokens = data
      .split(",")
      .filter((item) => item)
      .map((item) => item.split(" "))
      .reduce((a, b) => {
        a.push(...b);
        return a;
      }, [])
      .filter((item) => item);

    // Filter only token is contained in this.fields
    tokens = tokens.filter((token) => {
      let originToken = token;
      if (token.startsWith("-") || token.startsWith("+")) {
        originToken = token.slice(1);
      }
      return this.fields.includes(originToken);
    });

    return tokens.join(" ");
  };
}
