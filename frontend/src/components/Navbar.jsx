// Barra de navegação responsiva: no celular os links ficam em um menu recolhível.
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { usuario, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function sair() {
    logout();
    toast.sucesso('Você saiu da sua conta.');
    navigate('/login');
  }

  const linkClasse = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100'}`;

  const links = (
    <>
      <NavLink to="/reservas" className={linkClasse} onClick={() => setMenuAberto(false)}>
        {isAdmin ? 'Todas as reservas' : 'Minhas reservas'}
      </NavLink>
      <NavLink to="/mesas" className={linkClasse} onClick={() => setMenuAberto(false)}>
        {isAdmin ? 'Gerenciar mesas' : 'Mesas'}
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-stone-900">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-lg text-white">🍴</span>
          <span>Reserva de Mesas</span>
        </Link>

        {usuario && (
          <>
            <div className="hidden items-center gap-1 md:flex">{links}</div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right text-sm leading-tight">
                <p className="font-medium">{usuario.nome}</p>
                <p className="text-xs text-stone-500">{isAdmin ? 'Administrador' : 'Cliente'}</p>
              </div>
              <button onClick={sair} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50">
                Sair
              </button>
            </div>
            <button
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
              onClick={() => setMenuAberto((a) => !a)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {menuAberto ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </>
        )}
      </nav>

      {usuario && menuAberto && (
        <div className="space-y-1 border-t border-stone-200 px-4 py-3 md:hidden">
          {links}
          <div className="mt-2 flex items-center justify-between border-t border-stone-200 pt-3">
            <p className="text-sm"><span className="font-medium">{usuario.nome}</span> · {isAdmin ? 'Administrador' : 'Cliente'}</p>
            <button onClick={sair} className="rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-stone-300">Sair</button>
          </div>
        </div>
      )}
    </header>
  );
}
