// MODEL: acesso aos dados da tabela "reservas" via Prisma.
import { prisma } from '../config/prisma.js';

// Dados relacionados devolvidos junto com cada reserva
const incluir = {
  mesa: { select: { id: true, numero: true, capacidade: true, localizacao: true } },
  usuario: { select: { id: true, nome: true, email: true } },
};

export const reservaModel = {
  listar: (filtro = {}) =>
    prisma.reserva.findMany({ where: filtro, include: incluir, orderBy: { inicio: 'asc' } }),

  buscarPorId: (id) => prisma.reserva.findUnique({ where: { id }, include: incluir }),

  criar: (dados) => prisma.reserva.create({ data: dados, include: incluir }),

  atualizar: (id, dados) => prisma.reserva.update({ where: { id }, data: dados, include: incluir }),

  excluir: (id) => prisma.reserva.delete({ where: { id } }),

  // Procura uma reserva CONFIRMADA da mesma mesa cujo horário se sobreponha ao intervalo [inicio, fim).
  // Dois intervalos se sobrepõem quando: existente.inicio < novo.fim  E  existente.fim > novo.inicio
  // ignorarId é usado na edição, para a reserva não "conflitar com ela mesma".
  buscarConflito: ({ mesaId, inicio, fim, ignorarId }) =>
    prisma.reserva.findFirst({
      where: {
        mesaId,
        status: 'CONFIRMADA',
        inicio: { lt: fim },
        fim: { gt: inicio },
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
    }),

  // IDs das mesas ocupadas em um intervalo (usado na consulta de disponibilidade)
  mesasOcupadas: async ({ inicio, fim }) => {
    const reservas = await prisma.reserva.findMany({
      where: { status: 'CONFIRMADA', inicio: { lt: fim }, fim: { gt: inicio } },
      select: { mesaId: true },
    });
    return reservas.map((r) => r.mesaId);
  },
};
