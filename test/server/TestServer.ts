import * as express from "express";
import { Server } from "http";
import * as mongoose from "mongoose";
import { connectDB } from "./db";
let morgan = require("morgan");
let bodyParser = require("body-parser");

export default class TestServer {
  app: express.Express;
  port: string | number;
  server: Server;
  db: mongoose.Connection;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      //use morgan to log at command line
      this.app.use(morgan("combined")); //'combined' outputs the Apache style LOGs
    }

    //parse application/json and look for raw text
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.text());
    this.app.use(bodyParser.json({ type: "application/json" }));

    this.app.get("/", (req, res) =>
      res.json({ message: "Welcome to our build-rest-toolkit!" })
    );
  }

  start = async () => {
    this.server = this.app.listen(this.port);
    this.db = await connectDB();
    console.log("Listening on port " + this.port);
  };

  close = async () => {
    if (this.server) {
      await this.server.close();
    }
    if (this.db) {
      await this.db.close();
    }
  };
}
