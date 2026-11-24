// Validações de formato dos dados de uma reserva.
// As REGRAS DE NEGÓCIO (conflito de horário, capacidade etc.) ficam no reservaService.
export function validarReserva(body, parcial = false) {
  const erros = [];
  const dados = {};

  if (!parcial || body.mesaId !== undefined) {
    const mesaId = Number(body.mesaId);
    if (!Number.isInteger(mesaId) || mesaId <= 0) {
      erros.push({ campo: 'mesaId', mensagem: 'Informe uma mesa válida' });
    } else dados.mesaId = mesaId;
  }

  if (!parcial || body.inicio !== undefined) {
    const inicio = new Date(body.inicio);
    if (!body.inicio || Number.isNaN(inicio.getTime())) {
      erros.push({ campo: 'inicio', mensagem: 'Data e hora inválidas (use o formato ISO, ex.: 2026-12-01T19:30:00-03:00)' });
    } else dados.inicio = inicio;
  }

  if (!parcial || body.quantidadePessoas !== undefined) {
    const qtd = Number(body.quantidadePessoas);
    if (!Number.isInteger(qtd) || qtd < 1) {
      erros.push({ campo: 'quantidadePessoas', mensagem: 'Quantidade de pessoas deve ser um inteiro maior que zero' });
    } else dados.quantidadePessoas = qtd;
  }

  if (body.observacao !== undefined && body.observacao !== null) {
    if (typeof body.observacao !== 'string' || body.observacao.length > 255) {
      erros.push({ campo: 'observacao', mensagem: 'Observação deve ser um texto de até 255 caracteres' });
    } else dados.observacao = body.observacao.trim() || null;
  }

  if (body.status !== undefined) {
    if (!['CONFIRMADA', 'CANCELADA'].includes(body.status)) {
      erros.push({ campo: 'status', mensagem: 'Status deve ser CONFIRMADA ou CANCELADA' });
    } else dados.status = body.status;
  }

  if (parcial && Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push({ campo: null, mensagem: 'Envie ao menos um campo para atualizar' });
  }

  return { erros, dados };
}

export const validarReservaCriacao = (body) => validarReserva(body, false);
export const validarReservaAtualizacao = (body) => validarReserva(body, true);
