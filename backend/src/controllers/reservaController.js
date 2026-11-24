// CONTROLLER das reservas.
import { reservaService } from '../services/reservaService.js';

export const reservaController = {
  async listar(req, res) {
    res.json(await reservaService.listar(req.usuario));
  },

  async buscar(req, res) {
    res.json(await reservaService.buscarPorId(req.params.id, req.usuario));
  },

  async criar(req, res) {
    res.status(201).json(await reservaService.criar(req.body, req.usuario));
  },

  async atualizar(req, res) {
    res.json(await reservaService.atualizar(req.params.id, req.body, req.usuario));
  },

  async excluir(req, res) {
    await reservaService.excluir(req.params.id, req.usuario);
    res.status(204).send();
  },
};
