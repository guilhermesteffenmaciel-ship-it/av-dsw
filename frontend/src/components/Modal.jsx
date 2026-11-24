// Janela modal genérica (usada nos formulários e confirmações).
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
    <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="absolute inset-0 bg-stone-900/50" onClick={aoFechar} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="text-lg font-semibold text-stone-900">{titulo}</h2>
          <button onClick={aoFechar} className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
