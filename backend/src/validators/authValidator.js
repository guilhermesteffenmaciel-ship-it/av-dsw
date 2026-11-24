// Validações de formato/obrigatoriedade dos dados de autenticação.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCadastro(body) {
  const erros = [];
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const senha = typeof body.senha === 'string' ? body.senha : '';

  if (nome.length < 3) erros.push({ campo: 'nome', mensagem: 'Nome deve ter pelo menos 3 caracteres' });
  if (nome.length > 100) erros.push({ campo: 'nome', mensagem: 'Nome deve ter no máximo 100 caracteres' });
  if (!EMAIL_REGEX.test(email)) erros.push({ campo: 'email', mensagem: 'E-mail inválido' });
  if (senha.length < 6) erros.push({ campo: 'senha', mensagem: 'Senha deve ter pelo menos 6 caracteres' });

  return { erros, dados: { nome, email, senha } };
}

export function validarLogin(body) {
  const erros = [];
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const senha = typeof body.senha === 'string' ? body.senha : '';

  if (!email) erros.push({ campo: 'email', mensagem: 'E-mail é obrigatório' });
  if (!senha) erros.push({ campo: 'senha', mensagem: 'Senha é obrigatória' });

  return { erros, dados: { email, senha } };
}
