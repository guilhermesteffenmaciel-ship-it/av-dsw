// Página de reservas: lista, cria, edita, cancela e exclui (CRUD completo).
// CLIENTE vê apenas as próprias reservas; ADMIN vê as de todos (o filtro é feito pela API).
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmarModal from '../components/ConfirmarModal';
import ReservaFormModal from '../components/ReservaFormModal';
import { dispararWarp } from '../components/cosmos/CosmicBackground';
import { Alerta, Badge, Botao, CabecalhoPagina, Carregando, EstadoVazio } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatarDataHora, formatarHora } from '../utils/datas';

const FILTROS = [
  { id: 'proximas', nome: 'Próximas' },
  { id: 'passadas', nome: 'Anteriores' },
  { id: 'canceladas', nome: 'Canceladas' },
  { id: 'todas', nome: 'Todas' },
];

export default function Reservas() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('proximas');

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);
  const [mesaInicialId, setMesaInicialId] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null); // { tipo: 'cancelar' | 'excluir', reserva }
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setReservas(await api.listarReservas());
    } catch (err) {
      if (err.status !== 401) setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Vindo da página de mesas com "Reservar esta mesa"
  useEffect(() => {
    if (location.state?.novaReservaMesaId) {
      setMesaInicialId(location.state.novaReservaMesaId);
      setEmEdicao(null);
      setFormAberto(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Entrada em cascata dos cartões sempre que a lista (ou o filtro) muda
  const listaRef = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.cartao-reserva', { y: 40, opacity: 0, scale: 0.96, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    });
  }, { scope: listaRef, dependencies: [reservas, filtro, carregando], revertOnUpdate: true });

  const agora = new Date();
  const filtradas = useMemo(() => {
    const now = new Date();
    return reservas.filter((r) => {
      if (filtro === 'proximas') return r.status === 'CONFIRMADA' && new Date(r.fim) > now;
      if (filtro === 'passadas') return r.status === 'CONFIRMADA' && new Date(r.fim) <= now;
      if (filtro === 'canceladas') return r.status === 'CANCELADA';
      return true;
    });
  }, [reservas, filtro]);

  const contagem = useMemo(() => {
    const now = new Date();
    return {
      proximas: reservas.filter((r) => r.status === 'CONFIRMADA' && new Date(r.fim) > now).length,
      passadas: reservas.filter((r) => r.status === 'CONFIRMADA' && new Date(r.fim) <= now).length,
      canceladas: reservas.filter((r) => r.status === 'CANCELADA').length,
      todas: reservas.length,
    };
  }, [reservas]);

  function abrirNova() {
    setEmEdicao(null);
    setMesaInicialId(null);
    setFormAberto(true);
  }

  function aoSalvar(salva) {
    if (!emEdicao) dispararWarp(900);
    toast.sucesso(emEdicao ? 'Reserva atualizada com sucesso!' : `Reserva confirmada na mesa ${salva.mesa.numero}!`);
    setFormAberto(false);
    carregar();
  }

  async function confirmarAcao() {
    const { tipo, reserva } = confirmacao;
    setProcessando(true);
    try {
      if (tipo === 'cancelar') {
        await api.atualizarReserva(reserva.id, { status: 'CANCELADA' });
        toast.sucesso('Reserva cancelada.');
      } else {
        await api.excluirReserva(reserva.id);
        toast.sucesso('Reserva excluída.');
      }
      setConfirmacao(null);
      carregar();
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setProcessando(false);
    }
  }

  async function reativar(reserva) {
    try {
      await api.atualizarReserva(reserva.id, { status: 'CONFIRMADA' });
      toast.sucesso('Reserva confirmada novamente.');
      carregar();
    } catch (err) {
      toast.erro(err.message); // ex.: horário já ocupado por outra pessoa (regra de negócio)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28">
      <CabecalhoPagina
        rotulo={isAdmin ? '// painel de controle' : '// diário de bordo'}
        titulo={isAdmin ? 'Todas as reservas' : 'Minhas reservas'}
        descricao={isAdmin ? 'Acompanhe e gerencie as reservas de todos os clientes.' : 'Faça, altere ou cancele suas reservas.'}
        acao={<Botao onClick={abrirNova} className="px-5">＋ Nova reserva</Botao>}
      />

      <div className="glass mt-8 flex gap-1 overflow-x-auto rounded-2xl p-1.5 sm:inline-flex">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              filtro === f.id ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px] shadow-neon-cyan/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.nome}
            <span className={`rounded-md px-1.5 font-mono text-[10px] ${filtro === f.id ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-slate-500'}`}>
              {contagem[f.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8" ref={listaRef}>
        {carregando ? (
          <Carregando texto="Sincronizando reservas" />
        ) : erro ? (
          <div className="space-y-3">
            <Alerta>{erro}</Alerta>
            <Botao variante="secundario" onClick={carregar}>↻ Tentar novamente</Botao>
          </div>
        ) : filtradas.length === 0 ? (
          <EstadoVazio
            titulo={reservas.length === 0 ? 'Nenhuma reserva ainda' : 'Nada por aqui neste filtro'}
            descricao={reservas.length === 0 ? 'Seu diário de bordo está vazio. Que tal reservar uma mesa agora?' : 'Experimente outro filtro.'}
            acao={reservas.length === 0 && <Botao onClick={abrirNova}>Fazer minha primeira reserva</Botao>}
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((r) => {
              const futura = new Date(r.fim) > agora;
              const confirmada = r.status === 'CONFIRMADA';
              const destaque = !confirmada ? 'from-neon-red/60' : futura ? 'from-neon-cyan/60' : 'from-slate-500/40';
              return (
                <li key={r.id} className="cartao-reserva glass spotlight group relative flex flex-col overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r ${destaque} via-transparent to-transparent`} />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-neon-violet/30 to-neon-cyan/20 font-display text-lg font-bold text-white ring-1 ring-white/15">
                        {r.mesa.numero}
                      </span>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Reserva #{r.id}</p>
                        <h3 className="font-display text-lg font-semibold text-white">Mesa {r.mesa.numero}</h3>
                        <p className="text-xs text-slate-400">{r.mesa.localizacao}</p>
                      </div>
                    </div>
                    {!confirmada ? <Badge cor="vermelho">Cancelada</Badge> : futura ? <Badge cor="verde">Confirmada</Badge> : <Badge>Concluída</Badge>}
                  </div>

                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Quando</dt>
                      <dd className="ml-auto text-right capitalize text-slate-100">{formatarDataHora(r.inicio)} <span className="text-slate-500">→ {formatarHora(r.fim)}</span></dd>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Pessoas</dt>
                      <dd className="ml-auto flex items-center gap-1 text-slate-100">
                        {Array.from({ length: Math.min(r.quantidadePessoas, 8) }).map((_, i) => (
                          <span key={i} className="size-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px] shadow-neon-cyan" />
                        ))}
                        <span className="ml-1.5">{r.quantidadePessoas}</span>
                      </dd>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Cliente</dt>
                        <dd className="ml-auto truncate text-right text-slate-100" title={r.usuario.email}>{r.usuario.nome}</dd>
                      </div>
                    )}
                    {r.observacao && <p className="px-1 pt-1 text-xs italic text-slate-400">“{r.observacao}”</p>}
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {futura && confirmada && (
                      <>
                        <Botao variante="secundario" className="px-3 py-1.5" onClick={() => { setEmEdicao(r); setFormAberto(true); }}>Editar</Botao>
                        <Botao variante="secundario" className="px-3 py-1.5" onClick={() => setConfirmacao({ tipo: 'cancelar', reserva: r })}>Cancelar</Botao>
                      </>
                    )}
                    {futura && !confirmada && (
                      <Botao variante="secundario" className="px-3 py-1.5" onClick={() => reativar(r)}>↻ Reativar</Botao>
                    )}
                    <Botao variante="fantasma" className="ml-auto px-3 py-1.5 text-neon-red hover:bg-neon-red/10 hover:text-neon-red" onClick={() => setConfirmacao({ tipo: 'excluir', reserva: r })}>Excluir</Botao>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ReservaFormModal aberto={formAberto} reserva={emEdicao} mesaInicialId={mesaInicialId} aoFechar={() => setFormAberto(false)} aoSalvar={aoSalvar} />

      <ConfirmarModal
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.tipo === 'cancelar' ? 'Cancelar reserva?' : 'Excluir reserva?'}
        mensagem={
          confirmacao?.tipo === 'cancelar'
            ? 'A mesa ficará livre para outras pessoas nesse horário. Você poderá reativá-la se o horário continuar livre.'
            : 'A reserva será apagada permanentemente. Esta ação não pode ser desfeita.'
        }
        textoConfirmar={confirmacao?.tipo === 'cancelar' ? 'Cancelar reserva' : 'Excluir'}
        carregando={processando}
        aoConfirmar={confirmarAcao}
        aoFechar={() => setConfirmacao(null)}
      />
    </div>
  );
}
