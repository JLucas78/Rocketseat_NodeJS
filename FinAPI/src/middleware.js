import customers from "./db.js";

// Função para verificar se o usuario existe
export function ensureCustomerDoesNotExist(req, res, next) {
    const { cpf } = req.body.cpf ? req.body : req.headers;

    if (customers.length === 0) {
        return next();
    }

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return next();
    }

    req.customer = customer;
    return res.status(400).json({ error: "Customer already exists!" });
}

// Função para verificar se a conta existe
export function ensureAccountExists(req, res, next) {
    const { cpf } = req.body.cpf ? req.body : req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: "Customer not found!" });
    }

    req.customer = customer;
    return next();
}

// Função para verificar os campos obrigatorios
export function validateRequiredFields(req, res, next) {
    const { cpf , name } = req.body.cpf ? req.body : req.headers;

    if (!cpf || !name) {
        return res.status(400).json({ error: "CPF and name are required!" });
    }

    next();
}

// Função para verificar se o cliente tem saldo suficiente
export function ensureBalance(req, res, next) {
    const { amount } = req.body;
    const { customer } = req;

    // Calcula o saldo total do cliente
    const balance = customer.statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + Number(operation.amount.replace("R$ ", ""));
        } else {
            return acc - Number(operation.amount.replace("R$ ", ""));
        }
    }, 0);

    // Verifica se o saldo é suficiente para a operação
    if (amount > balance) {
        return res.status(400).json({ error: "Insufficient funds!" });
    }

    // Armazena o saldo no objeto de requisição para uso posterior
    req.balance = balance;
    next();
}

