// Funções auxiliares para datas.

// Data ISO (UTC, vinda da API) -> texto em português. Ex.: "qui., 26/11/2026, 19:00"
export function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Data ISO -> valor aceito pelo <input type="datetime-local"> (horário local, sem fuso)
export function isoParaInputLocal(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Valor do <input type="datetime-local"> -> ISO em UTC para enviar à API
export function inputLocalParaIso(valor) {
  return new Date(valor).toISOString();
}

// Lê a data de expiração de um JWT (sem validar a assinatura: isso é papel do backend)
export function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
