let express = require("express");
let app = express();
let morgan = require("morgan");
let bodyParser = require("body-parser");
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

app.get("/", (req, res) => res.json({ message: "Welcome to our buildres!" }));

app.get("/posts", (req, res) => res.json([1, 2, 3, 4, 5]));

app.listen(port);
console.log("Listening on port " + port);

export default app; // for testing
