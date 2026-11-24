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
      <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${
              t.tipo === 'sucesso' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            <span className="text-lg leading-none">{t.tipo === 'sucesso' ? '✓' : '!'}</span>
            <p className="flex-1 text-sm">{t.mensagem}</p>
            <button onClick={() => remover(t.id)} className="text-sm opacity-60 hover:opacity-100" aria-label="Fechar">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
