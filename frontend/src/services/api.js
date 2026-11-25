// Camada de comunicação com a API (backend da AV1).
// Todas as chamadas passam por aqui: o token JWT é enviado automaticamente
// e os erros são convertidos em mensagens amigáveis.

// URL da API:
//  1. VITE_API_URL, se configurada (local: .env | produção: variável na Vercel)
//  2. senão, no computador local usa a API local; publicado, usa a API do Render
// O "/api" final é completado automaticamente caso tenha sido esquecido.
const API_PADRAO = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api'
  : 'https://reserva-mesas-api-9ott.onrender.com/api';
const API_URL = (() => {
  const url = (import.meta.env.VITE_API_URL || API_PADRAO).trim().replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
})();
const CHAVE_TOKEN = 'reserva-mesas:token';

export const tokenStorage = {
  ler: () => localStorage.getItem(CHAVE_TOKEN),
  salvar: (token) => localStorage.setItem(CHAVE_TOKEN, token),
  remover: () => localStorage.removeItem(CHAVE_TOKEN),
};

// Erro padronizado: guarda o status HTTP e os detalhes de validação vindos do backend
export class ApiError extends Error {
  constructor(mensagem, status, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

// Função chamada quando a sessão expira (registrada pelo AuthContext)
let aoExpirarSessao = () => {};
export function definirAoExpirarSessao(callback) {
  aoExpirarSessao = callback;
}

async function requisicao(caminho, { method = 'GET', body } = {}) {
  const token = tokenStorage.ler();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch só lança erro quando não há resposta: servidor fora do ar, sem internet, CORS...
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0);
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem = dados?.erro || `Erro inesperado (HTTP ${resposta.status})`;
    // 401 com token enviado = token expirado ou inválido -> encerra a sessão
    if (resposta.status === 401 && token) aoExpirarSessao(mensagem);
    throw new ApiError(mensagem, resposta.status, dados?.detalhes);
  }
  return dados;
}

export const api = {
  // Autenticação
  login: (dados) => requisicao('/auth/login', { method: 'POST', body: dados }),
  cadastrar: (dados) => requisicao('/auth/cadastro', { method: 'POST', body: dados }),
  me: () => requisicao('/auth/me'),

  // Mesas
  listarMesas: () => requisicao('/mesas'),
  mesasDisponiveis: (inicio, pessoas) =>
    requisicao(`/mesas/disponiveis?inicio=${encodeURIComponent(inicio)}&pessoas=${pessoas}`),
  criarMesa: (dados) => requisicao('/mesas', { method: 'POST', body: dados }),
  atualizarMesa: (id, dados) => requisicao(`/mesas/${id}`, { method: 'PUT', body: dados }),
  excluirMesa: (id) => requisicao(`/mesas/${id}`, { method: 'DELETE' }),

  // Reservas
  listarReservas: () => requisicao('/reservas'),
  criarReserva: (dados) => requisicao('/reservas', { method: 'POST', body: dados }),
  atualizarReserva: (id, dados) => requisicao(`/reservas/${id}`, { method: 'PUT', body: dados }),
  excluirReserva: (id) => requisicao(`/reservas/${id}`, { method: 'DELETE' }),
};
