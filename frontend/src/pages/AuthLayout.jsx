// Layout compartilhado das telas de login e cadastro.
export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-stone-900 lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-brand-700/80 via-stone-900 to-stone-950" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="text-6xl">🍷</p>
          <h2 className="mt-6 text-3xl font-bold">Sua mesa garantida, sem fila e sem ligação.</h2>
          <p className="mt-3 max-w-md text-stone-300">
            Escolha o dia, o horário e quantas pessoas vão. O sistema mostra quais mesas estão livres e confirma na hora.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-stone-900">{titulo}</h1>
          <p className="mt-1 text-sm text-stone-500">{subtitulo}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
