// Contexto de autenticação: guarda o usuário logado e oferece login, cadastro e logout
// para qualquer componente da aplicação.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, definirAoExpirarSessao, tokenStorage } from '../services/api';
import { tokenExpirado } from '../utils/datas';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true); // verificando sessão salva
  const navigate = useNavigate();
  const toast = useToast();

  const logout = useCallback(() => {
    tokenStorage.remover();
    setUsuario(null);
  }, []);

  // Ao abrir o site: se há token salvo e ainda válido, busca os dados do usuário
  useEffect(() => {
    const token = tokenStorage.ler();
    if (!token || tokenExpirado(token)) {
      tokenStorage.remover();
      setCarregando(false);
      return;
    }
    api.me()
      .then(setUsuario)
      .catch(() => tokenStorage.remover())
      .finally(() => setCarregando(false));
  }, []);

  // Quando a API responde 401 (token expirado/inválido), encerra a sessão e volta ao login
  useEffect(() => {
    definirAoExpirarSessao(() => {
      // Várias requisições podem receber 401 ao mesmo tempo: só tratamos a primeira
      if (!tokenStorage.ler()) return;
      logout();
      toast.erro('Sua sessão expirou ou é inválida. Faça login novamente.');
      navigate('/login', { replace: true });
    });
  }, [logout, navigate, toast]);

  async function login(credenciais) {
    const { usuario: u, token } = await api.login(credenciais);
    tokenStorage.salvar(token);
    setUsuario(u);
    return u;
  }

  async function cadastrar(dados) {
    const { usuario: u, token } = await api.cadastrar(dados);
    tokenStorage.salvar(token);
    setUsuario(u);
    return u;
  }

  const valor = { usuario, carregando, login, cadastrar, logout, isAdmin: usuario?.perfil === 'ADMIN' };
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
