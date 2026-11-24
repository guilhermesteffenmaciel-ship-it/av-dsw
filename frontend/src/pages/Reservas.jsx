// Página de reservas: lista, cria, edita, cancela e exclui (CRUD completo).
// CLIENTE vê apenas as próprias reservas; ADMIN vê as de todos (o filtro é feito pela API).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmarModal from '../components/ConfirmarModal';
import ReservaFormModal from '../components/ReservaFormModal';
import { Alerta, Badge, Botao, Carregando, EstadoVazio } from '../components/ui';
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

  function abrirNova() {
    setEmEdicao(null);
    setMesaInicialId(null);
    setFormAberto(true);
  }

  function aoSalvar(salva) {
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{isAdmin ? 'Todas as reservas' : 'Minhas reservas'}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {isAdmin ? 'Acompanhe e gerencie as reservas de todos os clientes.' : 'Faça, altere ou cancele suas reservas.'}
          </p>
        </div>
        <Botao onClick={abrirNova}>+ Nova reserva</Botao>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-stone-100 p-1 sm:inline-flex">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filtro === f.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {f.nome}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {carregando ? (
          <Carregando texto="Carregando reservas..." />
        ) : erro ? (
          <div className="space-y-3">
            <Alerta>{erro}</Alerta>
            <Botao variante="secundario" onClick={carregar}>Tentar novamente</Botao>
          </div>
        ) : filtradas.length === 0 ? (
          <EstadoVazio
            titulo={reservas.length === 0 ? 'Nenhuma reserva ainda' : 'Nenhuma reserva neste filtro'}
            descricao={reservas.length === 0 ? 'Que tal reservar uma mesa agora?' : 'Experimente outro filtro.'}
            acao={reservas.length === 0 && <Botao onClick={abrirNova}>Fazer minha primeira reserva</Botao>}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((r) => {
              const futura = new Date(r.fim) > agora;
              const confirmada = r.status === 'CONFIRMADA';
              return (
                <li key={r.id} className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Reserva #{r.id}</p>
                      <h3 className="mt-1 text-lg font-semibold">Mesa {r.mesa.numero}</h3>
                      <p className="text-sm text-stone-500">{r.mesa.localizacao}</p>
                    </div>
                    {!confirmada ? <Badge cor="vermelho">Cancelada</Badge> : futura ? <Badge cor="verde">Confirmada</Badge> : <Badge>Concluída</Badge>}
                  </div>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex gap-2"><dt>📅</dt><dd className="capitalize">{formatarDataHora(r.inicio)} – {formatarHora(r.fim)}</dd></div>
                    <div className="flex gap-2"><dt>👥</dt><dd>{r.quantidadePessoas} pessoa(s)</dd></div>
                    {isAdmin && <div className="flex gap-2"><dt>🙋</dt><dd>{r.usuario.nome} <span className="text-stone-400">({r.usuario.email})</span></dd></div>}
                    {r.observacao && <div className="flex gap-2"><dt>📝</dt><dd className="text-stone-600">{r.observacao}</dd></div>}
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                    {futura && confirmada && (
                      <>
                        <Botao variante="secundario" className="px-3 py-1.5" onClick={() => { setEmEdicao(r); setFormAberto(true); }}>Editar</Botao>
                        <Botao variante="secundario" className="px-3 py-1.5" onClick={() => setConfirmacao({ tipo: 'cancelar', reserva: r })}>Cancelar</Botao>
                      </>
                    )}
                    {futura && !confirmada && (
                      <Botao variante="secundario" className="px-3 py-1.5" onClick={() => reativar(r)}>Reativar</Botao>
                    )}
                    <Botao variante="fantasma" className="px-3 py-1.5 text-red-600 shadow-none hover:bg-red-50" onClick={() => setConfirmacao({ tipo: 'excluir', reserva: r })}>Excluir</Botao>
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
