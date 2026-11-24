// SERVICE: regras de cadastro e login.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuarioModel } from '../models/usuarioModel.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 10;

function gerarToken(usuario) {
  // "sub" (subject) guarda o id do usuário; perfil e nome vão junto para o frontend usar
  return jwt.sign({ sub: usuario.id, perfil: usuario.perfil, nome: usuario.nome }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export const authService = {
  async cadastrar({ nome, email, senha }) {
    const existente = await usuarioModel.buscarPorEmail(email);
    if (existente) throw new AppError('Já existe um usuário cadastrado com este e-mail', 409);

    // Nunca salvamos a senha pura: salvamos o hash gerado pelo bcrypt
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    // Todo cadastro público cria um CLIENTE. O ADMIN é criado pelo seed.
    const usuario = await usuarioModel.criar({ nome, email, senha: senhaHash, perfil: 'CLIENTE' });
    return { usuario, token: gerarToken(usuario) };
  },

  async login({ email, senha }) {
    const usuario = await usuarioModel.buscarPorEmail(email);
    // Mensagem genérica para não revelar se o e-mail existe
    const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha) : false;
    if (!senhaConfere) throw new AppError('E-mail ou senha incorretos', 401);

    const { senha: _omitida, ...dadosPublicos } = usuario;
    return { usuario: dadosPublicos, token: gerarToken(usuario) };
  },

  async perfil(id) {
    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) throw new AppError('Usuário não encontrado', 404);
    return usuario;
  },
};
