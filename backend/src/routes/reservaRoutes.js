import { Router } from 'express';
import { reservaController } from '../controllers/reservaController.js';
import { autenticar } from '../middlewares/auth.js';
import { validar, validarId } from '../middlewares/validar.js';
import { validarReservaAtualizacao, validarReservaCriacao } from '../validators/reservaValidator.js';

const router = Router();

// Todas as rotas de reservas exigem login.
// A verificação "dono da reserva ou ADMIN" é feita no reservaService.
router.use(autenticar);

router.get('/', reservaController.listar);
router.get('/:id', validarId, reservaController.buscar);
router.post('/', validar(validarReservaCriacao), reservaController.criar);
router.put('/:id', validarId, validar(validarReservaAtualizacao), reservaController.atualizar);
router.delete('/:id', validarId, reservaController.excluir);

export default router;
