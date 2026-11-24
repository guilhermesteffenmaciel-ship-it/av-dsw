// MODEL: acesso aos dados da tabela "usuarios" via Prisma.
import { prisma } from '../config/prisma.js';

// Campos devolvidos ao cliente (nunca devolvemos o hash da senha)
const camposPublicos = { id: true, nome: true, email: true, perfil: true, criadoEm: true };

export const usuarioModel = {
  buscarPorEmail: (email) => prisma.usuario.findUnique({ where: { email } }),

  buscarPorId: (id) => prisma.usuario.findUnique({ where: { id }, select: camposPublicos }),

  criar: (dados) => prisma.usuario.create({ data: dados, select: camposPublicos }),
};
