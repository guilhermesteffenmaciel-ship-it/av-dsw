// CONTROLLER das mesas.
import { mesaService } from '../services/mesaService.js';

export const mesaController = {
  async listar(req, res) {
    res.json(await mesaService.listar(req.usuario));
  },

  async disponiveis(req, res) {
    res.json(await mesaService.disponiveis(req.query));
  },

  async buscar(req, res) {
    res.json(await mesaService.buscarPorId(req.params.id, req.usuario));
  },

  async criar(req, res) {
    res.status(201).json(await mesaService.criar(req.body));
  },

  async atualizar(req, res) {
    res.json(await mesaService.atualizar(req.params.id, req.body));
  },

  async excluir(req, res) {
    await mesaService.excluir(req.params.id);
    res.status(204).send();
  },
};
