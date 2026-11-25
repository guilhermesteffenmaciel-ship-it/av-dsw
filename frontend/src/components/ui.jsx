// Componentes visuais reutilizáveis no tema "Cosmos" (vidro + neon).
// Estilizados com classes utilitárias do Tailwind CSS 4.3 e utilitários próprios (glass, spotlight).

const variantes = {
  primario:
    'bg-linear-to-r from-neon-violet to-neon-cyan text-white shadow-[0_0_24px_-4px] shadow-neon-violet/60 hover:shadow-[0_0_36px_-2px] hover:shadow-neon-cyan/60 hover:brightness-110',
  secundario: 'glass text-slate-100 hover:border-neon-cyan/50 hover:text-white',
  perigo: 'bg-linear-to-r from-rose-500 to-neon-pink text-white shadow-[0_0_24px_-6px] shadow-rose-500/70 hover:brightness-110',
  fantasma: 'text-slate-300 hover:bg-white/10 hover:text-white',
};

export function Botao({ variante = 'primario', carregando = false, className = '', children, ...props }) {
  return (
    <button
      {...props}
      disabled={carregando || props.disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variante]} ${className}`}
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
      <label htmlFor={id} className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</label>
      <Elemento
        id={id}
        {...props}
        aria-invalid={!!erro}
        className={`block w-full rounded-xl border bg-space-900/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-4 ${
          erro
            ? 'border-neon-red/70 focus:ring-neon-red/20'
            : 'border-white/10 hover:border-white/20 focus:border-neon-cyan/70 focus:ring-neon-cyan/15'
        }`}
      />
      {erro && <p className="mt-1.5 text-xs text-neon-red">⚠ {erro}</p>}
    </div>
  );
}

export function Alerta({ tipo = 'erro', children }) {
  const estilos = {
    erro: 'border-neon-red/40 bg-neon-red/10 text-rose-100 animate-shake',
    info: 'border-neon-cyan/40 bg-neon-cyan/10 text-cyan-50',
  };
  return (
    <div role="alert" className={`flex gap-2 rounded-xl border p-3 text-sm ${estilos[tipo]}`}>
      <span className="font-mono">{tipo === 'erro' ? '✕' : 'i'}</span>
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ className = 'size-8' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Carregamento em forma de "órbita"
export function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-slate-400" role="status">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neon-cyan" />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-b-neon-violet [animation-direction:reverse]" />
        <div className="absolute inset-[26px] rounded-full bg-neon-amber shadow-[0_0_16px] shadow-neon-amber" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em]">{texto}</p>
    </div>
  );
}

export function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl px-6 py-16 text-center">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="mx-auto grid size-20 place-items-center rounded-full border border-dashed border-white/20 animate-float">
        <span className="text-3xl">🪐</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-white">{titulo}</h3>
      {descricao && <p className="mt-1 text-sm text-slate-400">{descricao}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}

export function Badge({ cor = 'stone', children }) {
  const cores = {
    stone: 'bg-white/5 text-slate-300 ring-white/15',
    verde: 'bg-neon-green/10 text-neon-green ring-neon-green/30',
    vermelho: 'bg-neon-red/10 text-neon-red ring-neon-red/30',
    ambar: 'bg-neon-amber/10 text-neon-amber ring-neon-amber/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset ${cores[cor]}`}>
      <span className="size-1.5 rounded-full bg-current shadow-[0_0_6px] shadow-current" />
      {children}
    </span>
  );
}

// Título de página com "rótulo técnico" acima
export function CabecalhoPagina({ rotulo, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">{rotulo}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{titulo}</h1>
        {descricao && <p className="mt-2 text-sm text-slate-400">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}

// Transforma a lista de erros de validação do backend em { campo: mensagem }
export function errosPorCampo(detalhes) {
  if (!Array.isArray(detalhes)) return {};
  return Object.fromEntries(detalhes.filter((d) => d.campo).map((d) => [d.campo, d.mensagem]));
}
