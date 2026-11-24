import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { autenticar } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { validarCadastro, validarLogin } from '../validators/authValidator.js';

const router = Router();

router.post('/cadastro', validar(validarCadastro), authController.cadastrar); // público
router.post('/login', validar(validarLogin), authController.login); // público
router.get('/me', autenticar, authController.me); // exige token

export default router;
