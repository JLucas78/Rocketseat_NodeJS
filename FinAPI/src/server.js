// Importando as dependências
import express from 'express';
import routes from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

// Chamando a isntancia do servidor
class Server {
    // Construtor do servidor
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(express.json());
    }

    routes() {
        this.app.use(routes);
    }

    // Iniciando o servidor
    start() {
        this.app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    }
}

export default new Server();
