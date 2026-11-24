import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alerta, Botao, Campo, errosPorCampo } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from './AuthLayout';

export default function Cadastro() {
  const { usuario, cadastrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [errosCampos, setErrosCampos] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/reservas" replace />;

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    // Validação rápida no navegador (o backend valida de novo)
    if (form.senha !== form.confirmar) {
      setErrosCampos({ confirmar: 'As senhas não conferem' });
      return;
    }
    setErrosCampos({});
    setEnviando(true);
    try {
      const u = await cadastrar({ nome: form.nome, email: form.email, senha: form.senha });
      toast.sucesso(`Conta criada! Bem-vindo(a), ${u.nome}.`);
      navigate('/reservas', { replace: true });
    } catch (err) {
      setErro(err.message);
      setErrosCampos(errosPorCampo(err.detalhes));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Cadastre-se para reservar mesas.">
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {erro && <Alerta>{erro}</Alerta>}
        <Campo id="nome" name="nome" label="Nome completo" autoComplete="name" value={form.nome} onChange={alterar} erro={errosCampos.nome} />
        <Campo id="email" name="email" type="email" label="E-mail" autoComplete="email" value={form.email} onChange={alterar} erro={errosCampos.email} />
        <Campo id="senha" name="senha" type="password" label="Senha (mínimo 6 caracteres)" autoComplete="new-password" value={form.senha} onChange={alterar} erro={errosCampos.senha} />
        <Campo id="confirmar" name="confirmar" type="password" label="Confirmar senha" autoComplete="new-password" value={form.confirmar} onChange={alterar} erro={errosCampos.confirmar} />
        <Botao type="submit" carregando={enviando} className="w-full">Criar conta</Botao>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        Já tem conta? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
