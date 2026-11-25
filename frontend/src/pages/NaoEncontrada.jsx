import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-white">Perdido no espaço</h1>
      <p className="mt-2 text-sm text-slate-400">Esta página saiu de órbita ou nunca existiu.</p>
      <Link to="/" className="mt-8 rounded-full border border-white/15 px-6 py-3 text-sm text-slate-200 transition hover:border-neon-cyan hover:text-white">
        ← Voltar à base
      </Link>
    </div>
  );
}
