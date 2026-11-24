// Formulário de criação/edição de mesa (somente ADMIN).
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from './Modal';
import { Alerta, Botao, Campo, errosPorCampo } from './ui';

const LOCAIS = ['Salão', 'Varanda', 'Área externa', 'Bar', 'Mezanino'];

export default function MesaFormModal({ aberto, mesa, aoFechar, aoSalvar }) {
  const editando = Boolean(mesa);
  const [form, setForm] = useState({ numero: '', capacidade: 4, localizacao: 'Salão', ativa: true });
  const [erro, setErro] = useState('');
  const [errosCampos, setErrosCampos] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setErro('');
    setErrosCampos({});
    setForm(mesa ? { numero: mesa.numero, capacidade: mesa.capacidade, localizacao: mesa.localizacao, ativa: mesa.ativa }
      : { numero: '', capacidade: 4, localizacao: 'Salão', ativa: true });
  }, [aberto, mesa]);

  const alterar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setErrosCampos({});
    const dados = { numero: Number(form.numero), capacidade: Number(form.capacidade), localizacao: form.localizacao, ativa: form.ativa };
    setEnviando(true);
    try {
      const salva = editando ? await api.atualizarMesa(mesa.id, dados) : await api.criarMesa(dados);
      aoSalvar(salva);
    } catch (err) {
      setErro(err.message);
      setErrosCampos(errosPorCampo(err.detalhes));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={editando ? `Editar mesa ${mesa.numero}` : 'Nova mesa'}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {erro && <Alerta>{erro}</Alerta>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="numero" name="numero" type="number" min="1" label="Número da mesa" value={form.numero} onChange={alterar} erro={errosCampos.numero} />
          <Campo id="capacidade" name="capacidade" type="number" min="1" max="20" label="Capacidade (pessoas)" value={form.capacidade} onChange={alterar} erro={errosCampos.capacidade} />
        </div>
        <Campo id="localizacao" name="localizacao" label="Localização" list="locais" value={form.localizacao} onChange={alterar} erro={errosCampos.localizacao} />
        <datalist id="locais">{LOCAIS.map((l) => <option key={l} value={l} />)}</datalist>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="ativa" checked={form.ativa} onChange={alterar} className="size-4 rounded border-stone-300 accent-brand-600" />
          Mesa ativa (aceita novas reservas)
        </label>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={enviando}>{editando ? 'Salvar alterações' : 'Cadastrar mesa'}</Botao>
        </div>
      </form>
    </Modal>
  );
}
