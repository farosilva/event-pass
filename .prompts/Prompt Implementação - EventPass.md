# Implementação do Sistema EventPass (Node.js + React)

> Você está operando em **Agent Mode**, com permissão para:
>
> * Criar e editar arquivos
> * Implementar código e testes
> * Configurar ambiente Docker Híbrido (Dev/Prod)
>
> Atue como um **Senior Fullstack Engineer** responsável pela implementação completa do EventPass.
>
> **IMPORTANTE:** Todo o conteúdo de texto visível para o usuário (UI, mensagens de erro, feedback) deve ser em **Português do Brasil (pt-BR)**. Identificadores de código (variáveis, funções) mantêm-se em Inglês.

---

## 📌 Contexto obrigatório (LEITURA INICIAL)

Antes de iniciar, **leia atentamente** as definições em:
`standards.md`, `architecture.md`, `tech-stack.md`, `business-rules.md`.

⚠️ **Regra de Ouro:** Se houver conflito, os arquivos `.ai/` têm prioridade.

---

## ⚙️ Estratégia de Ambiente (CRÍTICO)

Você deve configurar o projeto para suportar dois cenários distintos:

1.  **Ambiente de Desenvolvimento (Foco: Produtividade):**
    * Uso de **Bind Mounts** (Volumes) no Docker Compose para espelhar o código local dentro do container.
    * **Hot-Reload Obrigatório:** O Backend deve rodar com `tsx watch` ou `nodemon` e o Frontend com Vite HMR. Alterou o arquivo, atualizou o sistema.
2.  **Preparo para Produção (Foco: Performance):**
    * Os `Dockerfiles` devem ser **Multi-stage**.
    * Deve haver um *stage* de `dev` (usado no compose) e um *stage* de `prod` (usado no deploy real).

---

## 🎨 Identidade Visual (Design System)

Configure o Tailwind CSS seguindo estritamente:
* **Tema:** Dark Mode obrigatório (Fundo: `slate-900` ou `zinc-950`).
* **Cor Primária (Ação/Sucesso):** Verde Vibrante (`emerald-500` ou `green-500`).
* **Cor de Erro (Destrutivo):** Vermelho/Rose (`rose-500`).
* **Cor Secundária (Detalhes/Admin):** Violeta (`violet-500`).
* **Tipografia:** Sans-serif moderna (Inter ou Roboto).

---

## 🛠️ Etapas Obrigatórias de Implementação

Adote a metodologia **Backend First**. Não escreva React antes da API estar testada.

### 🔹 Etapa 1 — Infraestrutura Híbrida

1.  **Dockerfiles Inteligentes:** Criar `Dockerfile` para Backend e Frontend usando **Multi-stage Builds** (targets: `development` vs `production`).
2.  **Orquestração de Dev:** Criar `docker-compose.yml` configurado para usar o target `development` e volumes locais (para hot-reload funcionar).
3.  **Configuração:**
    * Criar `.env.example` robusto.
    * Definir portas: Postgres (`5432`), API (`3001`), Front (`3000`).
4.  **Banco:** Inicializar Prisma e schema (User, Event, Ticket).

### 🔹 Etapa 2 — Backend (Core & Testes)

1.  Implementar API Node/Express com TypeScript.
2.  **Segurança:** JWT, Hash de Senha e **Zod** para validação estrita.
3.  **Lógica de Negócio (CRÍTICO):**
    * Usar `Prisma.$transaction` para evitar *overbooking*.
    * **QR Code Seguro:** O conteúdo deve ser um Token JWT assinado (com ID do ticket).
4.  **Seed:** Criar script `prisma seed` com:
    * 1 Admin (`admin@eventpass.com` / `admin123`)
    * 3 Eventos fictícios.
5.  **Testes (BLOQUEANTE):**
    * Configurar Jest + Supertest.
    * Criar testes de integração para o fluxo de inscrição e validação.
6.  **Documentação:** Swagger/OpenAPI acessível em `/api-docs`.

### 🔹 Etapa 3 — Frontend (React + Tailwind)

1.  Setup Vite + TypeScript.
2.  Configurar Tailwind com as cores da Identidade Visual.
3.  **Arquitetura de API:** Criar camada de services (`api.ts`) com Axios.
4.  Implementar Rotas:
    * Public: Login, Cadastro, Vitrine.
    * Private (User): Meus Ingressos (QR Code).
    * Private (Admin): Dashboard, Criar Evento, **Leitor de QR Code**.
5.  **Leitor de QR:**
    * Ao ler, bater na API para validar.
    * Feedback visual imediato: **Tela Verde (Sucesso)** ou **Tela Vermelha (Erro)**.

---

## 📦 Critérios de Aceite

O trabalho só termina quando:

1.  O comando `docker-compose up` subir todo o ambiente em **modo desenvolvimento** (com hot-reload funcionando).
2.  O comando `npm run test` no backend passar com 100% de sucesso.
3.  Os Dockerfiles possuírem explicitamente as etapas de build para produção.
4.  Eu conseguir realizar o fluxo completo: Login Admin -> Criar Evento -> Login User -> Comprar -> Ler QR Code.

---

## 🔁 Checkpoints

Ao final de cada etapa principal (Infra, Back, Front), **pare e me peça confirmação** mostrando o que foi feito.