import Schema from "validate";

const validateSchema = (schema: Schema, data: object) => {
  const errors = schema.validate(data);
  if (errors && errors.length > 0) {
    throw new Error(errors.map((error: any) => error.message).join(" "));
  }
};

export default validateSchema;
