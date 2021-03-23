if (process.env.Node_ENV !== "production") {
  require("dotenv").config();
}

const oneCall_API_Key = process.env.oneCall_API_Key;
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/weather", (req, res) => {});

app.listen(5500, () => {
  console.log("server started");
});
