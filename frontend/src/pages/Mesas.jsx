// Página de mesas.
// ADMIN: CRUD completo (cadastrar, editar, ativar/desativar, excluir).
// CLIENTE: apenas consulta as mesas ativas e pode iniciar uma reserva.
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmarModal from '../components/ConfirmarModal';
import MesaFormModal from '../components/MesaFormModal';
import { Alerta, Badge, Botao, CabecalhoPagina, Carregando, EstadoVazio } from '../components/ui';
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

  const listaRef = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.item-mesa', { y: 30, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out' });
    });
  }, { scope: listaRef, dependencies: [mesas, carregando], revertOnUpdate: true });

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

  const abrirNova = () => { setEmEdicao(null); setFormAberto(true); };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28">
      <CabecalhoPagina
        rotulo={isAdmin ? '// hangar de mesas' : '// mapa estelar'}
        titulo={isAdmin ? 'Gerenciar mesas' : 'Nossas mesas'}
        descricao={isAdmin ? 'Cadastre, edite, desative ou exclua as mesas do restaurante.' : 'Cada ponto em órbita é um lugar à mesa. Escolha a sua e reserve.'}
        acao={isAdmin && <Botao onClick={abrirNova} className="px-5">＋ Nova mesa</Botao>}
      />

      <div className="mt-8" ref={listaRef}>
        {carregando ? (
          <Carregando texto="Mapeando mesas" />
        ) : erro ? (
          <div className="space-y-3">
            <Alerta>{erro}</Alerta>
            <Botao variante="secundario" onClick={carregar}>↻ Tentar novamente</Botao>
          </div>
        ) : mesas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma mesa cadastrada"
            descricao={isAdmin ? 'Cadastre a primeira mesa do restaurante.' : 'O restaurante ainda não cadastrou mesas.'}
            acao={isAdmin && <Botao onClick={abrirNova}>Cadastrar mesa</Botao>}
          />
        ) : isAdmin ? (
          // Tabela para o administrador (rola horizontalmente em telas pequenas)
          <div className="glass overflow-x-auto rounded-3xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-5 py-4 font-normal">Mesa</th>
                  <th className="px-5 py-4 font-normal">Capacidade</th>
                  <th className="px-5 py-4 font-normal">Localização</th>
                  <th className="px-5 py-4 font-normal">Situação</th>
                  <th className="px-5 py-4 text-right font-normal">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mesas.map((m) => (
                  <tr key={m.id} className="item-mesa transition hover:bg-white/[0.04]">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="flex items-center gap-3 font-display font-semibold text-white">
                        <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-neon-violet/30 to-neon-cyan/20 ring-1 ring-white/10">{m.numero}</span>
                        Mesa {m.numero}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                      <span className="flex items-center gap-1">
                        {Array.from({ length: Math.min(m.capacidade, 10) }).map((_, i) => <span key={i} className="size-1.5 rounded-full bg-neon-cyan/70" />)}
                        <span className="ml-2">{m.capacidade} pessoas</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">{m.localizacao}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">{m.ativa ? <Badge cor="verde">Ativa</Badge> : <Badge cor="ambar">Inativa</Badge>}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="inline-flex gap-1">
                        <Botao variante="fantasma" className="px-3 py-1.5" aria-label={`Editar mesa ${m.numero}`} onClick={() => { setEmEdicao(m); setFormAberto(true); }}>Editar</Botao>
                        <Botao variante="fantasma" className="px-3 py-1.5" aria-label={`${m.ativa ? 'Desativar' : 'Ativar'} mesa ${m.numero}`} onClick={() => alternarAtiva(m)}>{m.ativa ? 'Desativar' : 'Ativar'}</Botao>
                        <Botao variante="fantasma" className="px-3 py-1.5 text-neon-red hover:bg-neon-red/10 hover:text-neon-red" aria-label={`Excluir mesa ${m.numero}`} onClick={() => setAExcluir(m)}>Excluir</Botao>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Cartões "planeta" para o cliente: as cadeiras orbitam a mesa
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mesas.map((m) => (
              <li key={m.id} className="item-mesa glass spotlight group flex flex-col items-center rounded-3xl p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className="relative my-3 size-36">
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/15 transition duration-[2s] group-hover:rotate-180">
                    {Array.from({ length: m.capacidade }).map((_, i) => (
                      <span
                        key={i}
                        className="absolute left-1/2 top-1/2 size-3 rounded-full bg-neon-cyan shadow-[0_0_10px] shadow-neon-cyan"
                        style={{ transform: `translate(-50%, -50%) rotate(${(360 / m.capacidade) * i}deg) translateY(-72px)` }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-7 grid place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fde68a,#f472b6_40%,#7c3aed_80%)] font-display text-3xl font-bold text-white shadow-[0_0_50px_-6px] shadow-neon-pink/60 transition duration-500 group-hover:scale-110">
                    {m.numero}
                  </div>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">Mesa {m.numero}</h3>
                <p className="text-sm text-slate-400">{m.localizacao} · até {m.capacidade} pessoas</p>
                <Botao variante="secundario" className="mt-5 w-full" onClick={() => navigate('/reservas', { state: { novaReservaMesaId: m.id } })}>
                  Reservar esta mesa →
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
