import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alerta, Botao, Campo, errosPorCampo } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from './AuthLayout';
import { dispararWarp } from '../components/cosmos/CosmicBackground';

export default function Login() {
  const { usuario, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [errosCampos, setErrosCampos] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/reservas" replace />;

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setErrosCampos({});
    setEnviando(true);
    try {
      const u = await login(form);
      dispararWarp(); // efeito de 'salto' no fundo de estrelas
      toast.sucesso(`Bem-vindo(a), ${u.nome}!`);
      navigate(location.state?.de || '/reservas', { replace: true });
    } catch (err) {
      setErro(err.message);
      setErrosCampos(errosPorCampo(err.detalhes));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout rotulo="// acesso à nave" titulo="Entrar" subtitulo="Acesse sua conta para ver e fazer reservas.">
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {erro && <Alerta>{erro}</Alerta>}
        <Campo id="email" name="email" type="email" label="E-mail" autoComplete="email" value={form.email} onChange={alterar} erro={errosCampos.email} required />
        <Campo id="senha" name="senha" type="password" label="Senha" autoComplete="current-password" value={form.senha} onChange={alterar} erro={errosCampos.senha} required />
        <Botao type="submit" carregando={enviando} className="w-full py-3">Entrar</Botao>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-neon-cyan hover:underline">Cadastre-se</Link>
      </p>
    </AuthLayout>
  );
}
