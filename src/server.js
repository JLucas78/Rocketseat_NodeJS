import express from 'express';
import routes from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

class Server {
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

    start() {
        this.app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    }
}

export default new Server();
