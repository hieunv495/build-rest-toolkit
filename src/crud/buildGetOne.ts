import * as mongoose from "mongoose";

const buildGetOne = ({
  model,
}: {
  model: string | mongoose.Model<mongoose.Document<any>>;
}) => {};

export default buildGetOne;
