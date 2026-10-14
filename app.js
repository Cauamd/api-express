const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const produtosRoutes = require("./routes/produtos");

app.use(produtosRoutes);

module.exports = app;
