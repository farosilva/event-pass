# Criação do contexto técnico do projeto EventPass (`.ai/`)

> Você está operando em **Agent Mode**, com permissão para criar arquivos e escrever documentação.
>
> Atue como um **Staff Engineer / Tech Lead Fullstack (Node/React)**, responsável por preparar o **contexto técnico e arquitetural** de um projeto que será implementado posteriormente por outro agente.
>
> Pense como se estivesse escrevendo documentação interna para um time real.

---

## 🎯 Objetivo

Criar uma pasta `.ai/` na raiz do projeto contendo documentos **claros, prescritivos e não genéricos**, que definem:

- Padrões de código
- Decisões arquiteturais
- Stack tecnológica aprovada
- Regras de negócio e domínio

Esses arquivos **não são explicativos**; eles **definem regras** que devem ser seguidas.

---

## 📁 Estrutura obrigatória

Criar exatamente a seguinte estrutura:
```
.ai/
├── standards.md
├── architecture.md
├── tech-stack.md
└── business-rules.md
```

---

## 📄 Conteúdo esperado (DETALHADO)

### 🔹 `.ai/standards.md` — Padrões de código e estilo

Defina regras **concretas**, incluindo:

**Linguagem:**
- TypeScript estrito (`strict: true`) obrigatório no Backend e Frontend.

**Estrutura de Pastas (Monorepo Simples):**
- Raiz deve conter apenas `frontend/`, `backend/` e arquivos de configuração (Docker/Git).

**Configuração e Ambiente:**
- Obrigatório criar `.env.example` em ambos os projetos (sem segredos, apenas chaves).
- **Portas Padronizadas** para evitar conflitos no time:
  - Frontend: `3000`
  - Backend API: `3001`
  - PostgreSQL: `5432`

**Backend (Node/Express):**
- Uso de `async/await` obrigatório (proibido `.then()` chain).
- Arquitetura em camadas: `Controllers` -> `Services` -> `Prisma/Repositories`.
- **Validação:** Obrigatório uso de **Zod** para validar inputs nos controllers e DTOs.
- Tratamento de erros centralizado (Middleware de Error Handler).

**Frontend (React):**
- Componentes funcionais com Hooks.
- Tipagem explícita para Props (`interface Props { ... }`).
- Proibido uso de `any`.
- Estilização exclusivamente via classes utilitárias do Tailwind.

**Commits:**
- Padrão Conventional Commits (feat, fix, chore, docs).

Evite qualquer linguagem vaga como "quando possível".

---

### 🔹 `.ai/architecture.md` — Arquitetura e decisões

Descreva explicitamente:

**Arquitetura:**
- Monolito Modular em 3 camadas.

**Infraestrutura de Desenvolvimento (Full Docker):**
- Todo o ambiente (Frontend, Backend e Banco) deve rodar via **Docker Compose**.
- A aplicação deve funcionar com um único comando `docker-compose up`.

**Banco de Dados:**
- Relacional (PostgreSQL).
- Persistência garantida via Volumes do Docker.

**Autenticação:**
- Stateless via JWT.

**Concorrência:**
- Controle de vagas deve usar **Transações de Banco de Dados** (Prisma Transaction) para garantir integridade e evitar *overbooking*.

**Decisões Arquiteturais:**
- O projeto NÃO é microserviços.
- O QR Code é gerado no backend (ou frontend) mas hash validado no backend.

Inclua 2–3 decisões arquiteturais no formato:
```
Decision:
Context:
Consequence:
```

---

### 🔹 `.ai/tech-stack.md` — Stack tecnológica (PRESCRITIVO)

Defina explicitamente:

**Linguagem:**
- TypeScript 5+

**Frontend:**
- React 18+ (Vite)
- Tailwind CSS
- qrcode.react (Geração)
- react-qr-reader (Leitura)
- axios (Cliente HTTP)
- Zod (Validação de formulários/schema)

**Backend:**
- Node.js 20+ (LTS)
- Express
- Prisma ORM
- Nodemailer (Email)
- JsonWebToken (JWT)
- Zod (Validação de DTOs e inputs)

**Infraestrutura Local:**
- Docker & Docker Compose (Obrigatório para todos os serviços)

**Proibido:**
- Joi / Yup (Usar Zod)
- Redux (Manter estado simples com Context API)
- TypeORM (Usar Prisma)
- CSS Modules / Styled Components (Usar Tailwind)

Declare claramente:
- Qualquer dependência fora desta lista não deve ser utilizada sem aprovação explícita.

---

### 🔹 `.ai/business-rules.md` — Regras de negócio

Documente regras claras para o domínio EventPass:

**Perfis de Acesso:**
- ADMIN: Pode criar eventos, visualizar dashboard e realizar Check-in.
- USUARIO: Pode se cadastrar, visualizar eventos e emitir tickets.

**Regras de Inscrição:**
- Um usuário só pode se inscrever uma vez por evento (Constraint UNIQUE).
- Inscrição atômica: Verificar vagas e inserir registro na mesma transação.
- O QR Code é o identificador único do ingresso.

**Validação (Check-in):**
- Deve impedir check-in duplicado (se já entrou, retornar erro).
- Deve validar autenticidade do hash do QR Code.

**Financeiro:**
- Eventos 100% gratuitos (sem gateway de pagamento).

Não inclua código.

---

## ⚠️ Regras finais

- Escreva os documentos pensando em outro agente (Desenvolvedor Sênior).
- Seja específico e direto.
- Não use frases genéricas.
- Não antecipe implementação (não escreva classes agora, apenas as regras).

---

## ✅ Entregável

- Pasta `.ai/` criada
- Quatro arquivos preenchidos conforme especificado

Ao final, apresente:
- Lista dos arquivos criados
- Um resumo objetivo de cada documento