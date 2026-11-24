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

  const rotulo = { livre: '✓ livre', ocupada: '✕ ocupada neste horário', pequena: '✕ capacidade insuficiente', desconhecida: '' };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={editando ? `Editar reserva #${reserva.id}` : 'Nova reserva'}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {erro && <Alerta>{erro}</Alerta>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="inicio" name="inicio" type="datetime-local" label="Data e horário de chegada" min={agoraParaInput()} value={form.inicio} onChange={alterar} erro={errosCampos.inicio} />
          <Campo id="quantidadePessoas" name="quantidadePessoas" type="number" min="1" max="20" label="Quantidade de pessoas" value={form.quantidadePessoas} onChange={alterar} erro={errosCampos.quantidadePessoas} />
        </div>
        <p className="-mt-2 text-xs text-stone-500">Cada reserva ocupa a mesa por 2 horas.</p>

        <Campo id="mesaId" name="mesaId" as="select" label={carregandoMesas ? 'Mesa (verificando disponibilidade...)' : 'Mesa'} value={form.mesaId} onChange={alterar} erro={errosCampos.mesaId}>
          <option value="">Selecione uma mesa</option>
          {mesas.map((m) => {
            const s = situacaoMesa(m);
            return (
              <option key={m.id} value={m.id}>
                Mesa {m.numero} · {m.localizacao} · até {m.capacidade} pessoas {rotulo[s] && `— ${rotulo[s]}`}
              </option>
            );
          })}
        </Campo>
        {livres !== null && livres.length === 0 && (
          <Alerta tipo="info">Nenhuma mesa livre para esse horário e quantidade de pessoas. Tente outro horário.</Alerta>
        )}

        <Campo id="observacao" name="observacao" as="textarea" rows="2" maxLength={255} label="Observação (opcional)" placeholder="Ex.: aniversário, cadeira para bebê..." value={form.observacao} onChange={alterar} erro={errosCampos.observacao} />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={enviando}>{editando ? 'Salvar alterações' : 'Confirmar reserva'}</Botao>
        </div>
      </form>
    </Modal>
  );
}
