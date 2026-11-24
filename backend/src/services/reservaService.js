// SERVICE: regras de negócio das reservas.
//
// REGRAS IMPLEMENTADAS
//  1. (principal) Uma mesa NÃO pode ter duas reservas confirmadas com horários sobrepostos.
//  2. A quantidade de pessoas não pode ultrapassar a capacidade da mesa.
//  3. Não é possível reservar para uma data/hora que já passou.
//  4. Mesas desativadas não aceitam novas reservas.
//  5. Reservas que já aconteceram não podem ser alteradas.
//
// AUTORIZAÇÃO
//  - CLIENTE: vê, altera e exclui somente as PRÓPRIAS reservas.
//  - ADMIN: vê, altera e exclui qualquer reserva.
import { mesaModel } from '../models/mesaModel.js';
import { reservaModel } from '../models/reservaModel.js';
import { AppError } from '../utils/AppError.js';

// Cada reserva ocupa a mesa por 2 horas a partir do horário de chegada
export const DURACAO_RESERVA_HORAS = 2;

function calcularFim(inicio) {
  return new Date(inicio.getTime() + DURACAO_RESERVA_HORAS * 60 * 60 * 1000);
}

function formatarHora(data) {
  return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
}

// Verifica as regras 1 a 4 para uma reserva (nova ou editada)
async function verificarRegras({ mesaId, inicio, quantidadePessoas, ignorarId }) {
  if (inicio <= new Date()) {
    throw new AppError('Não é possível reservar para uma data/hora que já passou', 422);
  }

  const mesa = await mesaModel.buscarPorId(mesaId);
  if (!mesa) throw new AppError('Mesa não encontrada', 404);
  if (!mesa.ativa) throw new AppError(`A mesa ${mesa.numero} está desativada e não aceita reservas`, 422);

  if (quantidadePessoas > mesa.capacidade) {
    throw new AppError(
      `A mesa ${mesa.numero} comporta no máximo ${mesa.capacidade} pessoa(s); foram informadas ${quantidadePessoas}`,
      422,
    );
  }

  const fim = calcularFim(inicio);
  const conflito = await reservaModel.buscarConflito({ mesaId, inicio, fim, ignorarId });
  if (conflito) {
    throw new AppError(
      `A mesa ${mesa.numero} já está reservada entre ${formatarHora(conflito.inicio)} e ${formatarHora(conflito.fim)}. Escolha outro horário ou outra mesa.`,
      409,
    );
  }
  return fim;
}

// Garante que o usuário pode mexer nesta reserva (dono ou admin)
function verificarPermissao(reserva, usuario) {
  if (usuario.perfil !== 'ADMIN' && reserva.usuarioId !== usuario.id) {
    throw new AppError('Acesso negado: esta reserva pertence a outro usuário', 403);
  }
}

export const reservaService = {
  listar(usuario) {
    // Cliente só enxerga as próprias reservas
    const filtro = usuario.perfil === 'ADMIN' ? {} : { usuarioId: usuario.id };
    return reservaModel.listar(filtro);
  },

  async buscarPorId(id, usuario) {
    const reserva = await reservaModel.buscarPorId(id);
    if (!reserva) throw new AppError('Reserva não encontrada', 404);
    verificarPermissao(reserva, usuario);
    return reserva;
  },

  async criar(dados, usuario) {
    const fim = await verificarRegras(dados);
    return reservaModel.criar({
      mesaId: dados.mesaId,
      inicio: dados.inicio,
      fim,
      quantidadePessoas: dados.quantidadePessoas,
      observacao: dados.observacao ?? null,
      usuarioId: usuario.id, // o dono é sempre quem está logado
    });
  },

  async atualizar(id, dados, usuario) {
    const atual = await this.buscarPorId(id, usuario);

    if (atual.fim <= new Date()) {
      throw new AppError('Esta reserva já aconteceu e não pode mais ser alterada', 422);
    }

    // Junta os dados atuais com os enviados para validar a reserva "final"
    const final = {
      mesaId: dados.mesaId ?? atual.mesaId,
      inicio: dados.inicio ?? atual.inicio,
      quantidadePessoas: dados.quantidadePessoas ?? atual.quantidadePessoas,
      status: dados.status ?? atual.status,
    };

    const alteraHorarioOuMesa = dados.mesaId !== undefined || dados.inicio !== undefined
      || dados.quantidadePessoas !== undefined;
    const reativando = atual.status === 'CANCELADA' && final.status === 'CONFIRMADA';

    // Mudou o horário de chegada? Recalcula o horário de término
    if (dados.inicio) dados.fim = calcularFim(dados.inicio);

    // Se a reserva ficará confirmada e algo relevante mudou, as regras são verificadas de novo
    if (final.status === 'CONFIRMADA' && (alteraHorarioOuMesa || reativando)) {
      dados.fim = await verificarRegras({ ...final, ignorarId: id });
    }

    return reservaModel.atualizar(id, dados);
  },

  async excluir(id, usuario) {
    await this.buscarPorId(id, usuario);
    await reservaModel.excluir(id);
  },
};
