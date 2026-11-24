// Instância única do Prisma Client (Prisma ORM 7.10).
// No Prisma 7 a conexão com o PostgreSQL é feita por um "driver adapter" (@prisma/adapter-pg).
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { env } from './env.js';

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({ adapter });
