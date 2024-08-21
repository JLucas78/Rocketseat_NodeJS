import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import customers from "../db.js";

const routes = Router();

// Rota para criar uma conta
routes.post("/account", (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return res.status(400).json({ error: "Customer already exists!" });
    }

    customers.push({
        id: uuidv4(),
        name,
        cpf,
        statement: []
    });

    return res.status(201).send("Usuário criado com sucesso!");
});

// Rota para listar todos os usuários
routes.get("/users", (req, res) => {
    return res.json(customers);
});

// Rota para obter o extrato de um cliente
routes.get("/statement/", (req, res) => {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(404).json({ error: "Customer not found!" });
    }

    return res.json(customer.statement);
});

export default routes;
