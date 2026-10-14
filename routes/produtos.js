
const express = require("express");

const router = express.Router();

let produtos = [];
let idproduto = 1;


router.get("/produtos", (req, res) => {
    res.json(produtos);
});


router.post("/produtos", (req, res) => {
    const {
        nome,
        descricao,
        preco,
        quantidade_estoque
    } = req.body;

    if (
        !nome ||
        !descricao ||
        preco === undefined ||
        preco === null ||
        quantidade_estoque === undefined ||
        quantidade_estoque === null
    ) {
        return res.status(400).json({
            error: "Alguma propriedade obrigatória não foi informada"
        });
    }

    if (
        !Number.isFinite(Number(preco)) ||
        Number(preco) < 0 ||
        !Number.isInteger(Number(quantidade_estoque)) ||
        Number(quantidade_estoque) < 0
    ) {
        return res.status(400).json({
            error: "Preço ou quantidade em estoque inválidos"
        });
    }

    const produto = {
        id: idproduto++,
        nome,
        descricao,
        preco: Number(preco),
        quantidade_estoque: Number(quantidade_estoque)
    };

    produtos.push(produto);

    return res.status(201).json(produto);
});

module.exports = router;
