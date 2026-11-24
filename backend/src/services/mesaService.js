// SERVICE: regras de negócio das mesas.
import { mesaModel } from '../models/mesaModel.js';
import { reservaModel } from '../models/reservaModel.js';
import { AppError } from '../utils/AppError.js';
import { DURACAO_RESERVA_HORAS } from './reservaService.js';

export const mesaService = {
  // Admin vê todas as mesas; cliente vê somente as ativas
  listar(usuario) {
    return mesaModel.listar(usuario.perfil === 'ADMIN' ? {} : { ativa: true });
  },

  async buscarPorId(id, usuario) {
    const mesa = await mesaModel.buscarPorId(id);
    if (!mesa || (!mesa.ativa && usuario.perfil !== 'ADMIN')) {
      throw new AppError('Mesa não encontrada', 404);
    }
    return mesa;
  },

  criar(dados) {
    return mesaModel.criar(dados);
  },

  async atualizar(id, dados) {
    await this.buscarPorId(id, { perfil: 'ADMIN' });
    return mesaModel.atualizar(id, dados);
  },

  // REGRA: não é possível excluir uma mesa que ainda tem reservas confirmadas futuras.
  async excluir(id) {
    await this.buscarPorId(id, { perfil: 'ADMIN' });
    const futuras = await mesaModel.contarReservasFuturas(id);
    if (futuras > 0) {
      throw new AppError(
        `Esta mesa possui ${futuras} reserva(s) futura(s) confirmada(s). Cancele-as ou desative a mesa.`,
        409,
      );
    }
    await mesaModel.excluirComHistorico(id);
  },

  // Mesas ativas, com capacidade suficiente e livres no horário informado
  async disponiveis({ inicio, pessoas }) {
    const dataInicio = new Date(inicio);
    const qtd = Number(pessoas);
    if (!inicio || Number.isNaN(dataInicio.getTime())) {
      throw new AppError('Informe o parâmetro "inicio" com uma data/hora válida', 400);
    }
    if (!Number.isInteger(qtd) || qtd < 1) {
      throw new AppError('Informe o parâmetro "pessoas" com um inteiro maior que zero', 400);
    }
    const fim = new Date(dataInicio.getTime() + DURACAO_RESERVA_HORAS * 60 * 60 * 1000);
    const [mesas, ocupadas] = await Promise.all([
      mesaModel.listar({ ativa: true, capacidade: { gte: qtd } }),
      reservaModel.mesasOcupadas({ inicio: dataInicio, fim }),
    ]);
    return mesas.filter((m) => !ocupadas.includes(m.id));
  },
};
