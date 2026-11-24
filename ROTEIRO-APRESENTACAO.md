# Roteiro de estudo e apresentação

> Arquivo pessoal de estudo. Se não quiser que ele fique no repositório, apague-o antes de entregar.

## Antes de apresentar

1. Leia os arquivos nesta ordem, de cima para baixo: o fluxo de uma requisição fica claro.
   - `backend/prisma/schema.prisma`: as 3 tabelas e os relacionamentos
   - `backend/src/app.js` e depois `routes/reservaRoutes.js`
   - `middlewares/auth.js`: `autenticar` (JWT) e `autorizar` (perfil)
   - `controllers/reservaController.js` e depois `services/reservaService.js` (**regra de negócio**)
   - `models/reservaModel.js`: `buscarConflito`
   - `middlewares/errorHandler.js`
   - Frontend: `services/api.js`, `context/AuthContext.jsx`, `components/RotaProtegida.jsx`, `pages/Reservas.jsx`, `components/ReservaFormModal.jsx`
2. Abra a URL da API publicada uns 5 minutos antes (o Render gratuito "dorme").
3. Deixe prontas 3 contas: **admin**, **Maria** e **João** (dois clientes).

---

## AV1: Backend (Postman)

**1. Contexto (30 s):** problema da reserva por telefone e papel, com mesa reservada duas vezes. Os usuários são os clientes e o administrador do restaurante.

**2. Estrutura MVC:** mostre as pastas. Frase-chave:
> "A rota define a URL e os middlewares. O controller só recebe a requisição e devolve o JSON. O service tem as regras de negócio e o model é o único que fala com o banco pelo Prisma."

**3. Banco:** abra o `schema.prisma`. Um usuário tem N reservas; uma mesa tem N reservas. Mostre a pasta `migrations/`. O Prisma 7 usa `prisma.config.ts` e o adapter `@prisma/adapter-pg`.

**4. Demonstração no Postman** (importe a coleção e rode na ordem):

| Passo | Requisição | Esperado |
|---|---|---|
| Cadastro | Cadastro (Maria) | 201 + token |
| Hash | mostre no banco que a senha é um hash `$2b$10$...` (`npx prisma studio`) | – |
| Login | Login (Maria), Login (João), Login (Admin) | 200 + token |
| Sem token | Sem token | **401** |
| Sem permissão | Criar mesa como cliente | **403** |
| CRUD | criar, listar, buscar, atualizar e excluir reserva | 201/200/204 |
| Persistência | mostre a reserva no Prisma Studio | – |
| **Regra aceita** | Criar reserva (Maria, mesa 2) às 19h | **201** |
| **Regra bloqueada** | João na mesa 2 às 20h | **409** "já está reservada entre..." |
| Autorização | João altera reserva da Maria | **403** |
| Validação | Cadastro inválido | **400** com a lista de campos |

**5. Perguntas prováveis**

- *Como funciona o JWT?* No login, `jwt.sign` gera um token com o id e o perfil, assinado com o `JWT_SECRET`. A cada requisição, o middleware `autenticar` faz `jwt.verify`; se o token foi alterado ou expirou, responde 401.
- *Por que hash?* Se o banco vazar, as senhas não aparecem. O `bcrypt.compare` compara a senha digitada com o hash.
- *Como detecta a sobreposição?* Dois intervalos se sobrepõem quando `existente.inicio < novo.fim` **e** `existente.fim > novo.inicio`. Está em `reservaModel.buscarConflito`. Na edição, `ignorarId` evita que a reserva conflite com ela mesma.
- *Diferença entre 401 e 403?* 401 = não sei quem você é (sem token ou token inválido). 403 = sei quem você é, mas você não pode fazer isso.
- *Onde fica a autorização "só o dono"?* `verificarPermissao` no `reservaService`. A de perfil fica no middleware `autorizar('ADMIN')`.
- *Por que 422 e não 400?* 400 = formato inválido (validator). 422 = dados bem formatados que violam uma regra (ex.: mais pessoas que a capacidade).
- *Variáveis de ambiente?* `.env` (fora do Git) e `.env.example` (modelo sem segredos). O código lê tudo em `config/env.js`.

---

## AV2: Frontend e publicação (URL pública)

**1. Contexto:** problema, público-alvo e solução (mesmo texto do README).

**2. Demonstração**

| Item | Como mostrar |
|---|---|
| Página protegida | Abra `/reservas` sem login: redireciona para `/login` |
| Cadastro | Crie uma conta nova: entra direto |
| Validação | Cadastro com e-mail inválido: mensagem embaixo do campo |
| CRUD | Nova reserva, editar, cancelar, reativar, excluir (com confirmação) |
| Lista vazia / carregando | Conta nova mostra "Nenhuma reserva ainda" |
| **Regra de negócio** | Com outra conta, escolha a mesma mesa e horário: aparece "ocupada neste horário" e, ao confirmar, a mensagem 409 da API |
| Permissões | Cliente não vê "+ Nova mesa"; admin vê a tabela com editar/desativar/excluir e as reservas de todos |
| Excluir mesa com reserva | Admin tenta excluir a mesa 2: aparece a mensagem de erro 409 |
| Sessão expirada | No DevTools, apague ou altere o token em Application → Local Storage e clique em algo: volta ao login com aviso |
| Falha de comunicação | Mencione: se a API cair, aparece "Não foi possível conectar ao servidor" com botão "Tentar novamente" |
| Logout | Botão Sair |
| Responsivo | DevTools → modo celular: menu hambúrguer, cartões em 1 coluna |

**3. Perguntas prováveis**

- *Como o token é enviado?* `services/api.js` lê o token do `localStorage` e coloca no cabeçalho `Authorization: Bearer ...` em toda requisição.
- *E se o token expirar?* A API devolve 401; o `api.js` chama `aoExpirarSessao`, registrado no `AuthContext`, que faz logout e redireciona para `/login`.
- *A proteção do React basta?* Não. O `RotaProtegida` só melhora a experiência; quem garante a segurança é o backend. Mesmo que alguém burle o React, a API responde 401/403.
- *Context API?* O `AuthContext` disponibiliza `usuario`, `login`, `logout` e `isAdmin` para qualquer componente, sem precisar passar props.
- *Tailwind 4.3?* `@import "tailwindcss"` no `index.css`, plugin `@tailwindcss/vite` e cores próprias com `@theme` (`bg-brand-600`). Responsividade com prefixos `sm:`, `md:` e `lg:`.
- *Por que `vercel.json`?* Para que rotas como `/reservas` não deem 404 ao recarregar a página (todas apontam para o `index.html` e o React Router resolve).
- *Onde ficam os segredos em produção?* Nas variáveis de ambiente do Render. No frontend existe apenas `VITE_API_URL`, que é pública.
