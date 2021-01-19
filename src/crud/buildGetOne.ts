import * as mongoose from "mongoose";
import { QueryPopulateParserConfig } from "./parsers/QueryPopulateParser";

const buildGetOne = ({
  model,
  paramField = "id",
}: {
  model: string | mongoose.Model<mongoose.Document<any>>;
  paramField?: string;
  defaultPopulate?: any;
  queryPopulate?: QueryPopulateParserConfig;
}) => {};

export default buildGetOne;
