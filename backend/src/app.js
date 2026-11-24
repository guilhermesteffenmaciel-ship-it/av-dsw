// Configuração do Express: middlewares globais, rotas e tratamento de erros.
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, rotaNaoEncontrada } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({ origin: env.corsOrigin })); // libera o acesso do frontend
app.use(express.json()); // lê o corpo das requisições em JSON

app.get('/', (req, res) => res.json({ api: 'Reserva de Mesas', docs: 'Veja o README do repositório' }));
app.use('/api', routes);

app.use(rotaNaoEncontrada);
app.use(errorHandler);

export default app;
