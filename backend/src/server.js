import express from "express";
import { ENV } from "./lib/env.js";

const app = express();

console.log("Environment PORT:", ENV.PORT);
console.log("Environment DB_URL:", ENV.DB_URL);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

const port = process.env.PORT || 5000;

app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
