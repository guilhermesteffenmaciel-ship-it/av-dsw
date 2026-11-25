// Formulário de criação/edição de reserva.
// Ao escolher data/hora e quantidade de pessoas, consulta a API para mostrar quais mesas estão livres.
// A REGRA DE NEGÓCIO é aplicada no backend: se o horário estiver ocupado, a API responde 409
// e a mensagem é exibida aqui.
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { inputLocalParaIso, isoParaInputLocal } from '../utils/datas';
import Modal from './Modal';
import { Alerta, Botao, Campo, errosPorCampo } from './ui';

function agoraParaInput() {
  return isoParaInputLocal(new Date().toISOString());
}

export default function ReservaFormModal({ aberto, reserva, mesaInicialId, aoFechar, aoSalvar }) {
  const editando = Boolean(reserva);
  const [form, setForm] = useState({ inicio: '', quantidadePessoas: 2, mesaId: '', observacao: '' });
  const [mesas, setMesas] = useState([]);
  const [livres, setLivres] = useState(null); // ids das mesas livres no horário (null = não consultado)
  const [carregandoMesas, setCarregandoMesas] = useState(false);
  const [erro, setErro] = useState('');
  const [errosCampos, setErrosCampos] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Preenche o formulário ao abrir
  useEffect(() => {
    if (!aberto) return;
    setErro('');
    setErrosCampos({});
    setForm(
      reserva
        ? {
            inicio: isoParaInputLocal(reserva.inicio),
            quantidadePessoas: reserva.quantidadePessoas,
            mesaId: String(reserva.mesaId),
            observacao: reserva.observacao || '',
          }
        : { inicio: '', quantidadePessoas: 2, mesaId: mesaInicialId ? String(mesaInicialId) : '', observacao: '' },
    );
    api.listarMesas().then(setMesas).catch((err) => setErro(err.message));
  }, [aberto, reserva, mesaInicialId]);

  // Sempre que data/hora ou pessoas mudam, consulta a disponibilidade
  useEffect(() => {
    if (!aberto || !form.inicio || !(form.quantidadePessoas > 0)) {
      setLivres(null);
      return;
    }
    let cancelado = false;
    setCarregandoMesas(true);
    const timer = setTimeout(() => {
      api.mesasDisponiveis(inputLocalParaIso(form.inicio), form.quantidadePessoas)
        .then((lista) => !cancelado && setLivres(lista.map((m) => m.id)))
        .catch(() => !cancelado && setLivres(null))
        .finally(() => !cancelado && setCarregandoMesas(false));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [aberto, form.inicio, form.quantidadePessoas]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function situacaoMesa(mesa) {
    if (Number(form.quantidadePessoas) > mesa.capacidade) return 'pequena';
    // Na edição, a própria reserva ocupa a mesa atual: não conta como conflito
    if (editando && mesa.id === reserva.mesaId && reserva.status === 'CONFIRMADA') return 'livre';
    if (livres === null) return 'desconhecida';
    return livres.includes(mesa.id) ? 'livre' : 'ocupada';
  }

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setErrosCampos({});
    const novosErros = {};
    if (!form.inicio) novosErros.inicio = 'Informe a data e o horário';
    if (!form.mesaId) novosErros.mesaId = 'Escolha uma mesa';
    if (Object.keys(novosErros).length) return setErrosCampos(novosErros);

    const dados = {
      inicio: inputLocalParaIso(form.inicio),
      quantidadePessoas: Number(form.quantidadePessoas),
      mesaId: Number(form.mesaId),
      observacao: form.observacao,
    };
    setEnviando(true);
    try {
      const salva = editando ? await api.atualizarReserva(reserva.id, dados) : await api.criarReserva(dados);
      aoSalvar(salva);
    } catch (err) {
      setErro(err.message);
      setErrosCampos(errosPorCampo(err.detalhes));
    } finally {
      setEnviando(false);
    }
  }

  const estilos = {
    livre: { anel: 'border-neon-green/50 hover:border-neon-green', ponto: 'bg-neon-green shadow-neon-green', texto: 'livre' },
    ocupada: { anel: 'border-neon-red/40 hover:border-neon-red', ponto: 'bg-neon-red shadow-neon-red', texto: 'ocupada' },
    pequena: { anel: 'border-white/10 opacity-50', ponto: 'bg-slate-500 shadow-transparent', texto: 'pequena' },
    desconhecida: { anel: 'border-white/15 hover:border-white/40', ponto: 'bg-slate-400 shadow-transparent', texto: '—' },
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={editando ? `Editar reserva #${reserva.id}` : 'Nova reserva'}>
      <form onSubmit={enviar} className="space-y-5" noValidate>
        {erro && <Alerta>{erro}</Alerta>}
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <Campo id="inicio" name="inicio" type="datetime-local" label="Chegada" min={agoraParaInput()} value={form.inicio} onChange={alterar} erro={errosCampos.inicio} />
          <Campo id="quantidadePessoas" name="quantidadePessoas" type="number" min="1" max="20" label="Pessoas" value={form.quantidadePessoas} onChange={alterar} erro={errosCampos.quantidadePessoas} />
        </div>

        {/* Radar de mesas: cada botão mostra a situação da mesa no horário escolhido */}
        <fieldset>
          <legend className="mb-2 flex w-full items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <span>Mesa</span>
            <span className="normal-case tracking-normal text-slate-500">
              {carregandoMesas ? 'escaneando disponibilidade…' : livres === null ? 'escolha data e pessoas' : `${livres.length} livre(s) · 2h por reserva`}
            </span>
          </legend>
          <div role="radiogroup" aria-label="Mesa" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {mesas.map((m) => {
              const sit = situacaoMesa(m);
              const est = estilos[sit];
              const selecionada = form.mesaId === String(m.id);
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selecionada}
                  data-mesa={m.id}
                  key={m.id}
                  onClick={() => setForm({ ...form, mesaId: String(m.id) })}
                  className={`relative rounded-2xl border bg-white/[0.03] p-2.5 text-left transition duration-200 ${est.anel} ${
                    selecionada ? 'scale-[1.04] border-neon-cyan bg-neon-cyan/10 shadow-[0_0_24px_-6px] shadow-neon-cyan' : ''
                  }`}
                >
                  <span className={`absolute right-2.5 top-2.5 size-2 rounded-full shadow-[0_0_8px] ${est.ponto} ${carregandoMesas ? 'animate-pulse' : ''}`} />
                  <span className="block font-display text-lg font-bold text-white">M{m.numero}</span>
                  <span className="block truncate text-[11px] text-slate-400">{m.localizacao}</span>
                  <span className="mt-1 block font-mono text-[10px] text-slate-500">até {m.capacidade} · {est.texto}</span>
                </button>
              );
            })}
          </div>
          {errosCampos.mesaId && <p className="mt-1.5 text-xs text-neon-red">⚠ {errosCampos.mesaId}</p>}
        </fieldset>

        {livres !== null && livres.length === 0 && (
          <Alerta tipo="info">Nenhuma mesa livre para esse horário e quantidade de pessoas. Tente outro horário.</Alerta>
        )}

        <Campo id="observacao" name="observacao" as="textarea" rows="2" maxLength={255} label="Observação (opcional)" placeholder="Ex.: aniversário, cadeira para bebê..." value={form.observacao} onChange={alterar} erro={errosCampos.observacao} />

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={enviando}>{editando ? 'Salvar alterações' : 'Confirmar reserva'}</Botao>
        </div>
      </form>
    </Modal>
  );
}
