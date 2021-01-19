import { Request } from "express";

export type QueryPopulateParserConfig =
  | string[]
  | {
      queryField?: string;
      fields: string[];
    };

export default class QueryPopulateParser {
  DEFAULT_QUERY_FIELD = "populate";
  queryField: string;
  fields: string[];
  constructor(config: QueryPopulateParserConfig) {
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
      return this.fields.includes(token);
    });

    return tokens.join(" ");
  };
}
