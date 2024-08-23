import { Router } from "express";
import {
  createAccount,
  getBalance,
  getCustomers,
  deposit,
  withdraw,
  getStatement,
  getStatementForDate,
  updateAccount,
  getCustomerForId,
  deleteAccount
} from "../controllers/controller.js";

const routes = Router();

// Rota para criar uma conta
routes.post("/account", createAccount);

// Rota para listar todos os usuários
routes.get("/users", getCustomers);

// Rota para obter o extrato de um cliente
routes.get("/statement", getStatement); 

// Rota para obter o extrato de um cliente
routes.get("/statement/date", getStatementForDate); 

// Rota para fazer um depósito
routes.post("/deposit", deposit);

// Rota para fazer um saque
routes.post("/withdraw", withdraw);

// Rota para obter o saldo de um cliente
routes.get("/balance", getBalance); 

// Rota para atualizar os dados de um cliente
routes.put("/account/:id", updateAccount);

// Rota para obter os dados de um cliente especificado
routes.get("/account/:id", getCustomerForId);

// Rota para deletar uma conta
routes.delete("/account/:id" , deleteAccount);
 

export default routes;
