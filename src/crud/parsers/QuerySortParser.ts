import { Request } from "express";

export type QuerySortParserConfig = {
  queryField?: string;
  fields: string[];
};

export default class QuerySortParser {
  queryField: string;
  fields: string[];
  constructor(config: QuerySortParserConfig) {
    this.queryField = config.queryField;
    this.fields = config.fields;
  }

  parse = (req: Request): any => {
    const data = req.query[this.queryField] as string;

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
