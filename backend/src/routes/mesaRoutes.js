import { Router } from 'express';
import { mesaController } from '../controllers/mesaController.js';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { validar, validarId } from '../middlewares/validar.js';
import { validarMesaAtualizacao, validarMesaCriacao } from '../validators/mesaValidator.js';

const router = Router();

// Todas as rotas de mesas exigem login
router.use(autenticar);

// Qualquer usuário logado pode consultar
router.get('/', mesaController.listar);
router.get('/disponiveis', mesaController.disponiveis);
router.get('/:id', validarId, mesaController.buscar);

// Somente ADMIN pode criar, alterar e excluir mesas
router.post('/', autorizar('ADMIN'), validar(validarMesaCriacao), mesaController.criar);
router.put('/:id', autorizar('ADMIN'), validarId, validar(validarMesaAtualizacao), mesaController.atualizar);
router.delete('/:id', autorizar('ADMIN'), validarId, mesaController.excluir);

export default router;
