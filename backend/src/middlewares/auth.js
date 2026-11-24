import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// AUTENTICAÇÃO: verifica se a requisição traz um JWT válido.
// Formato esperado do cabeçalho:  Authorization: Bearer <token>
export function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Token não informado. Faça login para continuar.', 401);
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    // Disponibiliza o usuário logado para os próximos middlewares/controllers
    req.usuario = { id: payload.sub, perfil: payload.perfil, nome: payload.nome };
    next();
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      throw new AppError('Sessão expirada. Faça login novamente.', 401);
    }
    throw new AppError('Token inválido.', 401);
  }
}

// AUTORIZAÇÃO POR PERFIL: libera a rota apenas para os perfis informados.
// Uso: router.post('/', autenticar, autorizar('ADMIN'), controller.criar)
export function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario?.perfil)) {
      throw new AppError('Acesso negado: você não tem permissão para esta operação.', 403);
    }
    next();
  };
}
