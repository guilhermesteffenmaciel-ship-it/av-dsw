// Barra de navegação flutuante (vidro). No celular os links ficam em um menu recolhível.
// Visitante: links para Entrar/Criar conta. Logado: links conforme o perfil + botão Sair.
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 font-display font-bold text-white">
      <span className="relative grid size-9 place-items-center">
        <span className="absolute inset-0 rounded-full border border-neon-cyan/40 transition duration-700 group-hover:rotate-180" />
        <span className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-neon-cyan shadow-[0_0_8px] shadow-neon-cyan transition duration-700 group-hover:rotate-180" />
        <span className="size-4 rounded-full bg-linear-to-br from-neon-amber to-neon-pink shadow-[0_0_14px] shadow-neon-pink/60" />
      </span>
      <span className="text-[15px] tracking-tight sm:text-base">Órbita<span className="text-neon-cyan">.</span>Reservas</span>
    </Link>
  );
}

export default function Navbar() {
  const { usuario, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  // a barra ganha fundo mais sólido depois de rolar a página
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 20);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  function sair() {
    logout();
    setMenuAberto(false);
    toast.sucesso('Você saiu da sua conta. Até a próxima órbita!');
    navigate('/login');
  }

  const linkClasse = ({ isActive }) =>
    `relative block rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px] shadow-white/15' : 'text-slate-400 hover:text-white'
    }`;

  const fechar = () => setMenuAberto(false);
  const links = usuario ? (
    <>
      <NavLink to="/reservas" className={linkClasse} onClick={fechar}>{isAdmin ? 'Todas as reservas' : 'Minhas reservas'}</NavLink>
      <NavLink to="/mesas" className={linkClasse} onClick={fechar}>{isAdmin ? 'Gerenciar mesas' : 'Mesas'}</NavLink>
    </>
  ) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3">
      <nav
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full px-3 pl-4 transition duration-500 ${
          rolou || menuAberto ? 'glass bg-space-900/60 shadow-[0_8px_40px_-12px] shadow-neon-violet/30' : 'border border-transparent'
        }`}
      >
        <Logo />

        {usuario ? (
          <>
            <div className="hidden items-center gap-1 md:flex">{links}</div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-neon-violet to-neon-cyan text-xs font-bold text-white">
                  {usuario.nome.charAt(0).toUpperCase()}
                </span>
                <div className="text-sm leading-tight">
                  <p className="font-medium text-white">{usuario.nome.split(' ')[0]}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neon-cyan">{isAdmin ? 'admin' : 'cliente'}</p>
                </div>
              </div>
              <button onClick={sair} className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-slate-300 transition hover:border-neon-red/60 hover:text-neon-red">
                Sair
              </button>
            </div>
            <button
              className="grid size-10 place-items-center rounded-full text-slate-300 hover:bg-white/10 md:hidden"
              onClick={() => setMenuAberto((a) => !a)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {menuAberto ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h10M4 17h16" />}
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <Link to="/login" className="whitespace-nowrap rounded-full px-3 py-2 text-sm sm:px-4 font-medium text-slate-300 transition hover:text-white">Entrar</Link>
            <Link to="/cadastro" className="whitespace-nowrap rounded-full bg-white px-3.5 py-2 sm:px-4 text-sm font-semibold text-space-950 transition hover:bg-neon-cyan hover:shadow-[0_0_24px] hover:shadow-neon-cyan/60">
              Criar conta
            </Link>
          </div>
        )}
      </nav>

      {usuario && menuAberto && (
        <div className="glass mx-auto mt-2 max-w-6xl space-y-1 rounded-3xl bg-space-900/85 p-3 transition starting:-translate-y-2 starting:opacity-0 md:hidden">
          {links}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 px-2 pt-3">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">{usuario.nome}</span> · <span className="font-mono text-xs text-neon-cyan">{isAdmin ? 'admin' : 'cliente'}</span>
            </p>
            <button onClick={sair} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-300">Sair</button>
          </div>
        </div>
      )}
    </header>
  );
}
