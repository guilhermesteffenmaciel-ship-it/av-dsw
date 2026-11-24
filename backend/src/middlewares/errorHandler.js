import { AppError } from '../utils/AppError.js';

// Rota inexistente -> 404
export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não encontrada` });
}

// Middleware central de tratamento de erros.
// No Express 5, erros lançados em funções async chegam aqui automaticamente.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Erros de negócio/validação lançados por nós
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message, detalhes: err.detalhes });
  }

  // JSON mal formatado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  // Erros conhecidos do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Registro duplicado: já existe um item com esse valor único' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ erro: 'Operação viola um relacionamento entre registros' });
  }

  // Qualquer outro erro: não expomos detalhes internos ao cliente
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}
