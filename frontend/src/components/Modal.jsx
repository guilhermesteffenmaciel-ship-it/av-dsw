// Janela modal genérica (usada nos formulários e confirmações), com entrada animada.
import { useEffect } from 'react';

export default function Modal({ aberto, aoFechar, titulo, children }) {
  // Fecha com a tecla Esc
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="absolute inset-0 bg-space-950/70 backdrop-blur-sm" onClick={aoFechar} />
      <div className="glass relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-space-900/80 p-6 shadow-[0_0_80px_-20px] shadow-neon-violet/50 starting:translate-y-8 starting:opacity-0 transition duration-300 sm:max-w-lg sm:rounded-3xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-neon-cyan to-transparent" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="font-display text-xl font-semibold text-white">{titulo}</h2>
          <button onClick={aoFechar} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:rotate-90 hover:bg-white/10 hover:text-white" aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
