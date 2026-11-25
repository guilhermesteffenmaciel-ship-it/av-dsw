// Notificações (toasts) de sucesso e erro exibidas no canto da tela.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remover = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback((tipo, mensagem) => {
    const id = crypto.randomUUID();
    // Mantém no máximo 3 notificações na tela
    setToasts((lista) => [...lista.slice(-2), { id, tipo, mensagem }]);
    setTimeout(() => remover(id), 4000);
  }, [remover]);

  const toast = useMemo(() => ({
    sucesso: (msg) => mostrar('sucesso', msg),
    erro: (msg) => mostrar('erro', msg),
  }), [mostrar]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:left-auto sm:w-96" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`glass flex items-start gap-3 rounded-2xl bg-space-900/80 p-4 shadow-2xl transition duration-300 starting:translate-x-8 starting:opacity-0 ${
              t.tipo === 'sucesso' ? 'border-neon-green/40 shadow-neon-green/10' : 'border-neon-red/40 shadow-neon-red/10'
            }`}
          >
            <span className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-xs ${t.tipo === 'sucesso' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'}`}>
              {t.tipo === 'sucesso' ? '✓' : '!'}
            </span>
            <p className="flex-1 text-sm text-slate-100">{t.mensagem}</p>
            <button onClick={() => remover(t.id)} className="text-sm text-slate-500 hover:text-white" aria-label="Fechar">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
