// CONTROLLER: recebe a requisição HTTP, chama o service e devolve a resposta JSON.
import { authService } from '../services/authService.js';

export const authController = {
  async cadastrar(req, res) {
    const resultado = await authService.cadastrar(req.body);
    res.status(201).json(resultado);
  },

  async login(req, res) {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  },

  async me(req, res) {
    const usuario = await authService.perfil(req.usuario.id);
    res.json(usuario);
  },
};
