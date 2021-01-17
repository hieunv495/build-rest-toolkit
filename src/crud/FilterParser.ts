import { Request } from "express";

type Item =
  | string
  | {
      field: string | { queryField: string; modelField: string };
      search?: boolean;
      default?: any;
    }
  | ((req: Request) => any | Promise<any>);

export type FilterParserConfig = Item[];

export type FilterField =
  | {
      field: {
        queryField: string;
        modelField: string;
      };
      search: boolean;
      default?: any;
    }
  | ((req: Request) => any | Promise<any>);

export default class FilterParser {
  fields: FilterField[];

  constructor(config: FilterParserConfig) {
    this.fields = config.map((field) => {
      if (typeof field === "string") {
        return <FilterField>{
          field: {
            queryField: field,
            modelField: field,
          },
          search: false,
        };
      } else if (typeof field === "function") {
        return field;
      } else if (typeof field.field === "string") {
        return <FilterField>{
          field: {
            queryField: field.field,
            modelField: field.field,
          },
          search: !!field.search,
        };
      } else if (typeof field.field === "object") {
        return <FilterField>{
          field: {
            queryField: field.field.queryField,
            modelField: field.field.modelField,
          },
          search: !!field.search,
        };
      } else {
        throw new Error("Invalid config");
      }
    });
  }

  parse = async (req: Request) => {
    let filter: { [key: string]: any } = {};
    for (let field of this.fields) {
      if (typeof field === "function") {
        // Function
        filter = { ...filter, ...(await field(req)) };
      } else {
        // By query field and model field
        const val = req.query[field.field.queryField] || field.default;
        if (val === undefined) continue;
        if (field.search) {
          filter[field.field.modelField] = {
            $regex: req.query[field.field.queryField],
            $options: "i",
          };
        } else {
          filter[field.field.modelField] = req.query[field.field.queryField];
        }
      }
    }
    return filter;
  };
}
