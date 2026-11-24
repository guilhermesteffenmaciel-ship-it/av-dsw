// Validações de formato dos dados de uma mesa.
// parcial = true é usado na atualização (PUT): só valida os campos enviados.
export function validarMesa(body, parcial = false) {
  const erros = [];
  const dados = {};

  if (!parcial || body.numero !== undefined) {
    const numero = Number(body.numero);
    if (!Number.isInteger(numero) || numero <= 0) {
      erros.push({ campo: 'numero', mensagem: 'Número da mesa deve ser um inteiro positivo' });
    } else dados.numero = numero;
  }

  if (!parcial || body.capacidade !== undefined) {
    const capacidade = Number(body.capacidade);
    if (!Number.isInteger(capacidade) || capacidade < 1 || capacidade > 20) {
      erros.push({ campo: 'capacidade', mensagem: 'Capacidade deve ser um inteiro entre 1 e 20' });
    } else dados.capacidade = capacidade;
  }

  if (!parcial || body.localizacao !== undefined) {
    const localizacao = typeof body.localizacao === 'string' ? body.localizacao.trim() : '';
    if (localizacao.length < 2 || localizacao.length > 50) {
      erros.push({ campo: 'localizacao', mensagem: 'Localização deve ter entre 2 e 50 caracteres' });
    } else dados.localizacao = localizacao;
  }

  if (body.ativa !== undefined) {
    if (typeof body.ativa !== 'boolean') {
      erros.push({ campo: 'ativa', mensagem: 'O campo ativa deve ser true ou false' });
    } else dados.ativa = body.ativa;
  }

  if (parcial && Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push({ campo: null, mensagem: 'Envie ao menos um campo para atualizar' });
  }

  return { erros, dados };
}

export const validarMesaCriacao = (body) => validarMesa(body, false);
export const validarMesaAtualizacao = (body) => validarMesa(body, true);
