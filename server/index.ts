import * as express from "express";
import { Server } from "http";
import * as mongoose from "mongoose";
import { connectDB } from "./db";
import "./models/post.model";
import postRouter from "./routers/post.router";
let morgan = require("morgan");
let bodyParser = require("body-parser");

let app = express();

let port = process.env.PORT || 3000;
// let pet = require("./routes/pet");

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  //use morgan to log at command line
  app.use(morgan("combined")); //'combined' outputs the Apache style LOGs
}

//parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) =>
  res.json({ message: "Welcome to our build-rest-toolkit!" })
);

// app.get("/posts", (req, res) => res.json([1, 2, 3, 4, 5]));

app.use("/posts", postRouter);

let server: Server, db: mongoose.Connection;

const connect = async () => {
  server = app.listen(port);
  db = await connectDB();
  console.log("Listening on port " + port);
  return { server, db, app };
};

const close = async () => {
  await server.close();
  await db.close();
};

export { connect, close }; // for testing
