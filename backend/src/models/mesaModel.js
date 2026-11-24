// MODEL: acesso aos dados da tabela "mesas" via Prisma.
import { prisma } from '../config/prisma.js';

export const mesaModel = {
  listar: (filtro = {}) => prisma.mesa.findMany({ where: filtro, orderBy: { numero: 'asc' } }),

  buscarPorId: (id) => prisma.mesa.findUnique({ where: { id } }),

  criar: (dados) => prisma.mesa.create({ data: dados }),

  atualizar: (id, dados) => prisma.mesa.update({ where: { id }, data: dados }),

  excluir: (id) => prisma.mesa.delete({ where: { id } }),

  // Quantas reservas confirmadas e ainda não encerradas a mesa possui
  contarReservasFuturas: (id) =>
    prisma.reserva.count({ where: { mesaId: id, status: 'CONFIRMADA', fim: { gt: new Date() } } }),

  // Remove o histórico (reservas antigas/canceladas) antes de excluir a mesa
  excluirComHistorico: (id) =>
    prisma.$transaction([
      prisma.reserva.deleteMany({ where: { mesaId: id } }),
      prisma.mesa.delete({ where: { id } }),
    ]),
};
