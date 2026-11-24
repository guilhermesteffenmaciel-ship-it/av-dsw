import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-semibold">Página não encontrada</h1>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">Voltar ao início</Link>
    </div>
  );
}
