// Protege páginas no frontend:
//  - sem login -> redireciona para /login
//  - perfil sem permissão -> mostra "acesso negado"
// Obs.: é apenas um complemento. Quem realmente garante a segurança é o backend (middleware JWT).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Carregando } from './ui';

export default function RotaProtegida({ perfis }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <Carregando texto="Verificando sessão..." />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;

  if (perfis && !perfis.includes(usuario.perfil)) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm text-stone-500">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }
  return <Outlet />;
}
