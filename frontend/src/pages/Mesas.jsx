// Página de mesas.
// ADMIN: CRUD completo (cadastrar, editar, ativar/desativar, excluir).
// CLIENTE: apenas consulta as mesas ativas e pode iniciar uma reserva.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmarModal from '../components/ConfirmarModal';
import MesaFormModal from '../components/MesaFormModal';
import { Alerta, Badge, Botao, Carregando, EstadoVazio } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Mesas() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);
  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setMesas(await api.listarMesas());
    } catch (err) {
      if (err.status !== 401) setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoSalvar(mesa) {
    toast.sucesso(emEdicao ? `Mesa ${mesa.numero} atualizada!` : `Mesa ${mesa.numero} cadastrada!`);
    setFormAberto(false);
    carregar();
  }

  async function alternarAtiva(mesa) {
    try {
      await api.atualizarMesa(mesa.id, { ativa: !mesa.ativa });
      toast.sucesso(`Mesa ${mesa.numero} ${mesa.ativa ? 'desativada' : 'ativada'}.`);
      carregar();
    } catch (err) {
      toast.erro(err.message);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await api.excluirMesa(aExcluir.id);
      toast.sucesso(`Mesa ${aExcluir.numero} excluída.`);
      setAExcluir(null);
      carregar();
    } catch (err) {
      toast.erro(err.message); // ex.: mesa com reservas futuras (409)
      setAExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{isAdmin ? 'Gerenciar mesas' : 'Nossas mesas'}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {isAdmin ? 'Cadastre, edite, desative ou exclua as mesas do restaurante.' : 'Escolha uma mesa e faça sua reserva.'}
          </p>
        </div>
        {isAdmin && <Botao onClick={() => { setEmEdicao(null); setFormAberto(true); }}>+ Nova mesa</Botao>}
      </div>

      <div className="mt-6">
        {carregando ? (
          <Carregando texto="Carregando mesas..." />
        ) : erro ? (
          <div className="space-y-3">
            <Alerta>{erro}</Alerta>
            <Botao variante="secundario" onClick={carregar}>Tentar novamente</Botao>
          </div>
        ) : mesas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma mesa cadastrada"
            descricao={isAdmin ? 'Cadastre a primeira mesa do restaurante.' : 'O restaurante ainda não cadastrou mesas.'}
            acao={isAdmin && <Botao onClick={() => { setEmEdicao(null); setFormAberto(true); }}>Cadastrar mesa</Botao>}
          />
        ) : isAdmin ? (
          // Tabela para o administrador (rola horizontalmente em telas pequenas)
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Mesa</th>
                  <th className="px-4 py-3">Capacidade</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mesas.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">Mesa {m.numero}</td>
                    <td className="whitespace-nowrap px-4 py-3">{m.capacidade} pessoas</td>
                    <td className="whitespace-nowrap px-4 py-3">{m.localizacao}</td>
                    <td className="whitespace-nowrap px-4 py-3">{m.ativa ? <Badge cor="verde">Ativa</Badge> : <Badge cor="ambar">Inativa</Badge>}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Botao variante="fantasma" className="px-2 py-1 shadow-none" onClick={() => { setEmEdicao(m); setFormAberto(true); }}>Editar</Botao>
                        <Botao variante="fantasma" className="px-2 py-1 shadow-none" onClick={() => alternarAtiva(m)}>{m.ativa ? 'Desativar' : 'Ativar'}</Botao>
                        <Botao variante="fantasma" className="px-2 py-1 text-red-600 shadow-none hover:bg-red-50" onClick={() => setAExcluir(m)}>Excluir</Botao>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Cartões para o cliente
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mesas.map((m) => (
              <li key={m.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">{m.numero}</span>
                  <div>
                    <h3 className="font-semibold">Mesa {m.numero}</h3>
                    <p className="text-sm text-stone-500">{m.localizacao} · até {m.capacidade} pessoas</p>
                  </div>
                </div>
                <Botao variante="secundario" className="mt-4 w-full" onClick={() => navigate('/reservas', { state: { novaReservaMesaId: m.id } })}>
                  Reservar esta mesa
                </Botao>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAdmin && (
        <>
          <MesaFormModal aberto={formAberto} mesa={emEdicao} aoFechar={() => setFormAberto(false)} aoSalvar={aoSalvar} />
          <ConfirmarModal
            aberto={Boolean(aExcluir)}
            titulo={`Excluir mesa ${aExcluir?.numero}?`}
            mensagem="A mesa e seu histórico de reservas serão apagados. Mesas com reservas futuras não podem ser excluídas: nesse caso, desative-a."
            textoConfirmar="Excluir mesa"
            carregando={excluindo}
            aoConfirmar={excluir}
            aoFechar={() => setAExcluir(null)}
          />
        </>
      )}
    </div>
  );
}
