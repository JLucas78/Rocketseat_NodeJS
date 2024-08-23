import { v4 as uuidv4 } from "uuid";
import customers from "../db.js";
import {
  validateRequiredFields,
  ensureCustomerDoesNotExist,
  ensureAccountExists,
  ensureBalance
} from "../middleware.js";

// Função para criar uma conta
export function createAccount(req, res) {
  validateRequiredFields(req, res, () => {
    ensureCustomerDoesNotExist(req, res, () => {
      const { cpf, name } = req.body;

      const newCustomer = {
        id: uuidv4(),
        name,
        cpf,
        statement: []
      };

      customers.push(newCustomer);

      return res.status(201).json({
        message: "User created successfully!",
        customer: newCustomer
      });
    });
  });
}

// Função para listar todos os usuários
export function getCustomers(req, res) {
  if (customers.length === 0) {
    return res.status(404).json({ error: "No customers found!" });
  }
  return res.json(customers);
}

// Função para obter os dados de um cliente por ID
export function getCustomerForId(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { customer } = req;
      const { id } = req.params;
      return res.json({ message: "Customer found!", customer: customer });
     
    });
  });
}

// Função para obter o extrato de um cliente
export function getStatement(req, res) { 
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { customer } = req;
      return res.json(customer.statement);
    });
  });
}

// Função para obter o extrato de um cliente pela data
export function getStatementForDate(req, res) { 
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { customer } = req;
      const { date } = req.query;

      // Verifica se a data está no formato brasileiro (DD/MM/YYYY)
      const [day, month, year] = date.split("/");

      // Converte a data para o formato americano (MM/DD/YYYY)
      const dateFormatted = new Date(`${year}-${month}-${day}T00:00:00`);

      // Filtra o extrato com base na data
      const statement = customer.statement.filter((statement) => 
        statement.created_at.toDateString() === dateFormatted.toDateString()
      );

      if (statement.length === 0) {
        return res.status(404).json({ error: "No statement found!" });
      }

      return res.json({ statement });
    });
  });
}


// Função para fazer um depósito
export function deposit(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { description, amount } = req.body;

      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount!" });
      }

      const { customer } = req;

      const statementOperation = {
        description,
        amount: `R$ ${amount.toFixed(2)}`,
        created_at: new Date(),
        type: "credit"
      };

      customer.statement.push(statementOperation);

      return res.status(201).json({
        message: "Deposit made successfully!",
        statement: statementOperation
      });
    });
  });
}

// Função para fazer um saque
export function withdraw(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      ensureBalance(req, res, () => {
        const { description, amount } = req.body;
        const { customer } = req;

        const statementOperation = {
          description,
          amount: `R$ ${amount.toFixed(2)}`,
          created_at: new Date(),
          type: "debit"
        };

        customer.statement.push(statementOperation);

        return res.status(201).json({
          message: "Withdrawal made successfully!",
          statement: statementOperation
        });
      });
    });
  });
}

// Função para obter o saldo de um cliente
export function getBalance(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { customer } = req;
      const { name, statement } = customer;

      const balance = statement.reduce(
        (acc, operation) =>
          operation.type === "credit"
            ? acc + Number(operation.amount.replace("R$ ", ""))
            : acc - Number(operation.amount.replace("R$ ", "")),
        0
      );

      return res.json({
        message: `Name: ${name}. Your current balance is: R$ ${balance.toFixed(2)}`
      });
    });
  });
}

// Função para atualizar o usuário
export function updateAccount(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
    const { id } = req.params; // Pega o ID do cliente da URL
    const { name } = req.body; // Pega o novo nome do corpo da requisição

    // Busca o cliente pelo ID
    const customer = customers.find((customer) => customer.id === id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found!" });
    }

    // Atualiza o nome do cliente
    customer.name = name;
    return res.status(200).json({ message: "Name updated successfully!" });
    });
  });
}


// Função para deletar o usuário
export function deleteAccount(req, res) {
  validateRequiredFields(req, res, () => {
    ensureAccountExists(req, res, () => {
      const { customer } = req; 

      // Calcula o saldo do cliente
      const balance = customer.statement.reduce(
        (acc, operation) =>
          operation.type === "credit"
            ? acc + Number(operation.amount.replace("R$ ", ""))
            : acc - Number(operation.amount.replace("R$ ", "")),
        0
      );

      // Verifica se o saldo é negativo
      if (balance < 0) {
        return res.status(400).json({ error: "You cannot delete an account with a negative balance!" });
      }

      // Remove o cliente do array
      const customerIndex = customers.indexOf(customer);
      if (customerIndex > -1) {
        customers.splice(customerIndex, 1);
      }

      return res.status(200).json({ 
        message: `${customer.name} deleted successfully! You had R$ ${balance.toFixed(2)} in your account.` 
      });
    });
  });
}


