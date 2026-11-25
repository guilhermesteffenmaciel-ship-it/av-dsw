// Protege páginas no frontend:
//  - sem login -> redireciona para /login
//  - perfil sem permissão -> mostra "acesso negado"
// Obs.: é apenas um complemento. Quem realmente garante a segurança é o backend (middleware JWT).
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Carregando } from './ui';

export default function RotaProtegida({ perfis }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <Carregando texto="Verificando credenciais" />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;

  if (perfis && !perfis.includes(usuario.perfil)) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <p className="font-mono text-6xl font-bold text-neon-red">403</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-white">Acesso negado</h1>
        <p className="mt-2 text-sm text-slate-400">Seu perfil não tem permissão para acessar esta área.</p>
        <Link to="/" className="mt-6 inline-block text-sm text-neon-cyan hover:underline">Voltar à base</Link>
      </div>
    );
  }
  return <Outlet />;
}
