// Centraliza a leitura das variáveis de ambiente.
// Nenhuma credencial fica escrita no código: tudo vem do arquivo .env (local)
// ou das variáveis configuradas na plataforma de hospedagem (produção).
import 'dotenv/config';

const obrigatorias = ['DATABASE_URL', 'JWT_SECRET'];
for (const nome of obrigatorias) {
  if (!process.env[nome]) {
    console.error(`Variável de ambiente ${nome} não definida. Veja o arquivo .env.example`);
    process.exit(1);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  port: Number(process.env.PORT) || 3000,
  // Uma ou mais origens separadas por vírgula (ex.: URL da Vercel)
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
};
