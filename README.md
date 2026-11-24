# 🍴 Reserva de Mesas (AV DSW)

Aplicação web full stack para **reserva de mesas em restaurantes**, desenvolvida para a disciplina de DSW (AV1 e AV2, 4º bimestre).

> **Aplicação publicada:** `https://SEU-PROJETO.vercel.app` *(preencher após o deploy)*
> **API publicada:** `https://SEU-BACKEND.onrender.com/api` *(preencher após o deploy)*

## Problema, público-alvo e solução

- **Problema:** em muitos restaurantes as reservas são feitas por telefone ou WhatsApp e anotadas em papel. Isso gera mesas reservadas duas vezes para o mesmo horário, grupos maiores do que a mesa comporta e nenhum controle do histórico.
- **Público-alvo:** restaurantes de pequeno e médio porte (administrador) e seus clientes.
- **Solução:** o cliente cria uma conta, escolhe data, horário e quantidade de pessoas, vê quais mesas estão livres e confirma a reserva. O sistema **impede automaticamente reservas sobrepostas na mesma mesa**. O administrador cadastra as mesas e acompanha todas as reservas.

## Tecnologias e versões

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Node.js | 22 (≥ 22.18) |
| Backend | Express (arquitetura MVC) | 5.3.0 |
| ORM | Prisma ORM: `prisma` e `@prisma/client` | **7.10.0** (fixado) |
| ORM | `@prisma/adapter-pg` (driver adapter do Prisma 7) | 7.10.0 |
| Banco | PostgreSQL | 16 |
| Autenticação | jsonwebtoken (JWT) e bcryptjs (hash de senhas) | 9.0.3 / 3.0.3 |
| Frontend | React e React Router | 19 / 7 |
| Frontend | Tailwind CSS: `tailwindcss` e `@tailwindcss/vite` | **4.3.0** (fixado) |
| Frontend | Vite | 8 |
| Deploy | Render (API e banco) e Vercel (frontend) | – |

## Funcionalidades

- Cadastro e login de usuários (senha com hash bcrypt e token JWT)
- **CRUD de reservas**: criar, listar, ver, editar, cancelar/reativar e excluir
- **CRUD de mesas** (administrador): cadastrar, listar, editar, ativar/desativar e excluir
- Consulta de mesas disponíveis por horário e quantidade de pessoas
- Interface responsiva, com mensagens de sucesso e erro, estados de carregamento e listas vazias

### Regras de negócio (verificadas no backend: `backend/src/services/reservaService.js`)

1. **Principal:** uma mesa **não pode ter duas reservas confirmadas com horários sobrepostos**. Cada reserva ocupa a mesa por 2 horas. Uma tentativa de conflito retorna `409 Conflict`.
2. A quantidade de pessoas não pode ultrapassar a capacidade da mesa (`422`).
3. Não é possível reservar para uma data ou horário que já passou (`422`).
4. Mesas desativadas não aceitam novas reservas (`422`).
5. Reservas que já aconteceram não podem ser alteradas (`422`).
6. Uma mesa com reservas futuras confirmadas não pode ser excluída (`409`): é preciso cancelar as reservas ou desativar a mesa.

### Perfis e permissões

| Operação | CLIENTE | ADMIN |
|---|---|---|
| Consultar mesas | ✅ (somente ativas) | ✅ (todas) |
| Criar, alterar e excluir mesas | ❌ `403` | ✅ |
| Criar reservas | ✅ (em seu nome) | ✅ |
| Consultar, alterar e excluir reservas | ✅ somente as **próprias** (`403` nas dos outros) | ✅ todas |

O cadastro público sempre cria um **CLIENTE**. O **ADMIN** é criado pelo seed, a partir das variáveis `ADMIN_EMAIL` e `ADMIN_SENHA`.

## Estrutura do projeto

```
reserva-mesas/
├── backend/                     # AV1: API REST (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma        # modelagem do banco
│   │   ├── migrations/          # migrations versionadas
│   │   └── seed.js              # cria o admin e mesas de exemplo
│   ├── prisma.config.ts         # configuração do Prisma 7 (URL do banco vem do .env)
│   ├── src/
│   │   ├── server.js            # sobe o servidor
│   │   ├── app.js               # configura o Express (CORS, JSON, rotas, erros)
│   │   ├── config/              # variáveis de ambiente e Prisma Client
│   │   ├── routes/              # ROTAS: URL + middlewares + controller
│   │   ├── controllers/         # CONTROLLERS: recebem a requisição e devolvem JSON
│   │   ├── services/            # REGRAS DE NEGÓCIO e de autorização
│   │   ├── models/              # MODELS: acesso aos dados via Prisma
│   │   ├── validators/          # validação de campos obrigatórios e formatos
│   │   ├── middlewares/         # JWT (autenticar/autorizar), validação, erros
│   │   └── utils/AppError.js    # erro com código HTTP
│   ├── .env.example
│   └── reserva-mesas.postman_collection.json
├── frontend/                    # AV2: interface (React + Tailwind CSS 4.3)
│   ├── src/
│   │   ├── services/api.js      # chamadas à API (envia o JWT e trata erros)
│   │   ├── context/             # AuthContext (sessão) e ToastContext (mensagens)
│   │   ├── components/          # Navbar, RotaProtegida, Modal, formulários, UI
│   │   ├── pages/               # Login, Cadastro, Reservas, Mesas, 404
│   │   └── utils/datas.js
│   ├── vercel.json              # faz as rotas do React funcionarem na Vercel
│   └── .env.example
└── render.yaml                  # blueprint de deploy do backend e do banco no Render
```

**Fluxo de uma requisição:** `rota → middlewares (autenticar, autorizar, validar) → controller → service (regras) → model (Prisma) → banco`. Os erros vão para o `errorHandler`, que devolve o código HTTP correto.

### Modelagem do banco

```
usuarios (id, nome, email UNIQUE, senha [hash], perfil CLIENTE|ADMIN, criadoEm)
mesas    (id, numero UNIQUE, capacidade, localizacao, ativa, criadoEm)
reservas (id, inicio, fim, quantidadePessoas, observacao, status CONFIRMADA|CANCELADA,
          usuarioId → usuarios, mesaId → mesas, criadoEm, atualizadoEm)

usuarios 1 ── N reservas N ── 1 mesas
```

## Como executar localmente

Pré-requisitos: **Node.js 22.18 ou mais recente** e **PostgreSQL** instalado e rodando.

### 1. Backend (API)

```bash
cd backend
npm install                 # instala as dependências e gera o Prisma Client (postinstall)
cp .env.example .env        # depois edite o .env com os dados do seu PostgreSQL
npx prisma migrate deploy   # cria as tabelas (use "npm run db:migrate" ao alterar o schema)
npm run db:seed             # cria o administrador e mesas de exemplo
npm run dev                 # API em http://localhost:3000
```

Crie o banco antes, se ele ainda não existir: `CREATE DATABASE reservas;`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm run dev                 # http://localhost:5173
```

### Variáveis de ambiente

**Backend (`backend/.env`)**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Segredo que assina os tokens (texto longo e aleatório) |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `8h`) |
| `PORT` | Porta da API (padrão `3000`) |
| `CORS_ORIGIN` | URL(s) do frontend autorizadas, separadas por vírgula |
| `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA` | Dados do administrador criado pelo seed |

**Frontend (`frontend/.env`)**

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (ex.: `https://SEU-BACKEND.onrender.com/api`) |

> O `VITE_API_URL` é público, pois fica embutido no JavaScript do navegador. Por isso nenhum segredo é colocado no frontend.

## Rotas da API

Base: `/api`. As rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/health` | público | Verifica se a API está no ar |
| POST | `/auth/cadastro` | público | Cadastra um cliente `{ nome, email, senha }` e devolve `{ usuario, token }` |
| POST | `/auth/login` | público | Login `{ email, senha }` e devolve `{ usuario, token }` |
| GET | `/auth/me` | 🔒 | Dados do usuário logado |
| GET | `/mesas` | 🔒 | Lista as mesas |
| GET | `/mesas/disponiveis?inicio=ISO&pessoas=N` | 🔒 | Mesas livres no horário e com capacidade suficiente |
| GET | `/mesas/:id` | 🔒 | Detalha uma mesa |
| POST | `/mesas` | 🔒 ADMIN | Cria `{ numero, capacidade, localizacao, ativa? }` |
| PUT | `/mesas/:id` | 🔒 ADMIN | Atualiza (campos parciais) |
| DELETE | `/mesas/:id` | 🔒 ADMIN | Exclui (bloqueado se houver reservas futuras) |
| GET | `/reservas` | 🔒 | Lista as reservas: as próprias (cliente) ou todas (admin) |
| GET | `/reservas/:id` | 🔒 dono/ADMIN | Detalha uma reserva |
| POST | `/reservas` | 🔒 | Cria `{ mesaId, inicio, quantidadePessoas, observacao? }` |
| PUT | `/reservas/:id` | 🔒 dono/ADMIN | Atualiza `{ mesaId?, inicio?, quantidadePessoas?, observacao?, status? }` |
| DELETE | `/reservas/:id` | 🔒 dono/ADMIN | Exclui a reserva |

**Códigos HTTP usados:** `200` OK · `201` criado · `204` excluído · `400` dados inválidos · `401` sem token, token inválido ou expirado · `403` sem permissão · `404` não encontrado · `409` conflito (horário ocupado, duplicado) · `422` regra de negócio violada · `500` erro interno.

Exemplo de erro de validação:

```json
{ "erro": "Dados inválidos", "detalhes": [{ "campo": "email", "mensagem": "E-mail inválido" }] }
```

**Postman:** importe `backend/reserva-mesas.postman_collection.json`. Os tokens são salvos automaticamente ao executar os logins.

## Publicação (deploy)

### Backend e banco no Render

1. Envie o repositório para o GitHub.
2. No [Render](https://render.com): **New → Blueprint**, selecione o repositório. O arquivo `render.yaml` cria o **PostgreSQL** e a **API**.
3. Preencha as variáveis solicitadas: `ADMIN_EMAIL`, `ADMIN_SENHA` e `CORS_ORIGIN` (URL da Vercel; pode ser ajustada depois). O `JWT_SECRET` é gerado automaticamente e o `DATABASE_URL` vem do banco criado.
4. A cada inicialização, a API executa `prisma migrate deploy` e o seed antes de subir.
5. Teste: `https://SEU-BACKEND.onrender.com/api/health`.

> No plano gratuito, a API "dorme" após 15 minutos sem uso; a primeira requisição pode levar cerca de 50 segundos. Abra a URL da API alguns minutos antes da apresentação.

### Frontend na Vercel

1. Na [Vercel](https://vercel.com): **Add New → Project**, importe o repositório.
2. **Root Directory:** `frontend` (Framework: Vite).
3. **Environment Variables:** `VITE_API_URL = https://SEU-BACKEND.onrender.com/api`.
4. Faça o deploy e copie a URL gerada para a variável `CORS_ORIGIN` no Render.

## Fontes dos componentes de interface

Os componentes visuais (botões, campos, modal, tabela, cartões, menu responsivo, notificações) foram escritos para este projeto com classes utilitárias do **Tailwind CSS 4.3** e adaptados ao tema do restaurante. Nenhum componente de biblioteca de terceiros foi copiado.

- Fonte **Inter**, via [Google Fonts](https://fonts.google.com/specimen/Inter) (SIL Open Font License)
- Paleta de cores padrão do Tailwind CSS (MIT) e uma cor `brand` definida em `frontend/src/index.css` com `@theme`
