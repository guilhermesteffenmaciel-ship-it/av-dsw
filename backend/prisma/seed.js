// Seed: cria o usuário ADMIN (a partir das variáveis de ambiente) e algumas mesas de exemplo.
// Executar com:  npm run db:seed
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

const { ADMIN_NOME = 'Administrador', ADMIN_EMAIL, ADMIN_SENHA } = process.env;

// Sem ADMIN_EMAIL/ADMIN_SENHA, apenas avisamos (sem derrubar a inicialização da API em produção)
if (!ADMIN_EMAIL || !ADMIN_SENHA) {
  console.warn('[seed] ADMIN_EMAIL e/ou ADMIN_SENHA não definidos: o administrador NÃO foi criado.');
} else {
  const senha = await bcrypt.hash(ADMIN_SENHA, 10);
  await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: {},
    create: { nome: ADMIN_NOME, email: ADMIN_EMAIL.toLowerCase(), senha, perfil: 'ADMIN' },
  });
  console.log(`[seed] administrador ${ADMIN_EMAIL.toLowerCase()} pronto.`);
}

const mesas = [
  { numero: 1, capacidade: 2, localizacao: 'Salão' },
  { numero: 2, capacidade: 4, localizacao: 'Salão' },
  { numero: 3, capacidade: 4, localizacao: 'Varanda' },
  { numero: 4, capacidade: 6, localizacao: 'Varanda' },
  { numero: 5, capacidade: 8, localizacao: 'Área externa' },
];
for (const mesa of mesas) {
  await prisma.mesa.upsert({ where: { numero: mesa.numero }, update: {}, create: mesa });
}

console.log('[seed] mesas de exemplo prontas.');
await prisma.$disconnect();
