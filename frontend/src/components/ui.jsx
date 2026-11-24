// Componentes visuais reutilizáveis (botões, campos, alertas, estados de carregamento e vazio).
// Estilizados com classes utilitárias do Tailwind CSS 4.3.

const variantes = {
  primario: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secundario: 'bg-white text-stone-700 ring-1 ring-inset ring-stone-300 hover:bg-stone-50',
  perigo: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  fantasma: 'text-stone-600 hover:bg-stone-100',
};

export function Botao({ variante = 'primario', carregando = false, className = '', children, ...props }) {
  return (
    <button
      {...props}
      disabled={carregando || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
    >
      {carregando && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

// Campo de formulário com rótulo e mensagem de erro
export function Campo({ label, erro, id, as = 'input', ...props }) {
  const Elemento = as;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <Elemento
        id={id}
        {...props}
        aria-invalid={!!erro}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
          erro ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500 focus:ring-brand-100'
        }`}
      />
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

export function Alerta({ tipo = 'erro', children }) {
  const estilos = {
    erro: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  };
  return <div role="alert" className={`rounded-lg border p-3 text-sm ${estilos[tipo]}`}>{children}</div>;
}

export function Spinner({ className = 'size-8' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500">
      <Spinner className="size-8 text-brand-600" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

export function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-300 px-6 py-14 text-center">
      <p className="text-4xl">🍽️</p>
      <h3 className="mt-3 font-semibold text-stone-800">{titulo}</h3>
      {descricao && <p className="mt-1 text-sm text-stone-500">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

export function Badge({ cor = 'stone', children }) {
  const cores = {
    stone: 'bg-stone-100 text-stone-700 ring-stone-200',
    verde: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    vermelho: 'bg-red-50 text-red-700 ring-red-200',
    ambar: 'bg-amber-50 text-amber-800 ring-amber-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cores[cor]}`}>
      {children}
    </span>
  );
}

// Transforma a lista de erros de validação do backend em { campo: mensagem }
export function errosPorCampo(detalhes) {
  if (!Array.isArray(detalhes)) return {};
  return Object.fromEntries(detalhes.filter((d) => d.campo).map((d) => [d.campo, d.mensagem]));
}
