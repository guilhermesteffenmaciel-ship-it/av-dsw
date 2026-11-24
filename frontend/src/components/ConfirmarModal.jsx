// Modal de confirmação para ações destrutivas (excluir, cancelar).
import Modal from './Modal';
import { Botao } from './ui';

export default function ConfirmarModal({ aberto, titulo, mensagem, textoConfirmar = 'Confirmar', carregando, aoConfirmar, aoFechar }) {
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={titulo}>
      <p className="text-sm text-stone-600">{mensagem}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Botao variante="secundario" onClick={aoFechar} disabled={carregando}>Voltar</Botao>
        <Botao variante="perigo" onClick={aoConfirmar} carregando={carregando}>{textoConfirmar}</Botao>
      </div>
    </Modal>
  );
}
