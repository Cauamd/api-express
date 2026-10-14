const express = require("express");
const app = express();

app.use(express.json());

const produtosRoutes = require("./routes/produtos");

app.use(produtosRoutes);

module.exports = app;