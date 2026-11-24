import { AppError } from '../utils/AppError.js';

// Executa uma função validadora sobre req.body.
// Se houver erros, responde 400 com a lista; senão, substitui o body pelos dados já tratados.
export function validar(validador) {
  return (req, res, next) => {
    const { erros, dados } = validador(req.body ?? {}, req);
    if (erros.length > 0) {
      throw new AppError('Dados inválidos', 400, erros);
    }
    req.body = dados;
    next();
  };
}

// Valida o parâmetro :id da URL
export function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('O id informado na URL é inválido', 400);
  }
  req.params.id = id;
  next();
}
