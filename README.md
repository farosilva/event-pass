![EventPass Logo](frontend/src/assets/logo-eventpass-header-transp.png)
---

Sistema de gestão de eventos e controle de acesso via QR Code.

O **EventPass** é uma plataforma Fullstack que permite a criação de eventos, emissão de ingressos digitais e validação segura na portaria através de leitura de QR Code assinado.

---

## 🚀 Tecnologias

O projeto opera em uma arquitetura **Monolito Modular** containerizada.

* **Infraestrutura:** Docker & Docker Compose
* **Backend:** Node.js (Express), TypeScript, Prisma ORM, JWT
* **Frontend:** React (Vite), TypeScript, Tailwind CSS
* **Banco de Dados:** PostgreSQL
* **Validação:** Zod (Schema Validation)

---

## 💻 Guia para Desenvolvedores

Siga os passos abaixo para rodar o projeto localmente. O ambiente é totalmente automatizado via Docker.

### Pré-requisitos
* **Docker** e **Docker Compose** instalados.

### Como Rodar

1. **Clone o repositório** e entre na pasta:
   ```bash
   git clone <repo-url>
   cd event-pass
   ```

2. **Inicie o ambiente**:
   ```bash
   docker-compose up -d --build
   ```

   > **O que isso faz?**
   > * Sobe os containers (Backend, Frontend, Postgres).
   > * O Backend aguarda o Banco de Dados ficar pronto.
   > * Executa automaticamente as migrações (`prisma db push`).
   > * Popula o banco com dados de teste (`seed.ts`).

3. **Acesse a aplicação**:

   | Serviço | URL | Credenciais Padrão |
   | :--- | :--- | :--- |
   | **Frontend** | [http://localhost:3000](http://localhost:3000) | - |
   | **API** | [http://localhost:3001/api](http://localhost:3001/api) | - |
   | **Swagger Docs** | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | - |
   | **Admin Login** | - | **Email:** `admin@eventpass.com`<br>**Senha:** `admin123` |

### Comandos Úteis

* **Ver logs do backend** (útil para debug):
  ```bash
  docker logs -f eventpass_backend
  ```

* **Reiniciar do zero** (apaga banco e recria):
  ```bash
  docker-compose down -v
  docker-compose up -d --build
  ```

### Fluxo de Validação de QR Code

O sistema implementa uma validação segura com feedback imediato:

1.  **Geração (Backend)**: O QR Code contém um Token JWT assinado com `ticketId` e `eventTitle`.
2.  **Preview (Frontend)**: O Scanner decodifica o JWT localmente para exibir o nome do evento ("Validando ingresso para...") imediatamente.
3.  **Validação (API)**: O token é enviado para `/validate`, onde a assinatura e validade são checadas.
4.  **Anti-Loop**: O Frontend ignora leituras repetidas do **mesmo código** por 5 segundos para evitar chamadas duplicadas se o usuário mantiver a câmera apontada.

---

## 📂 Estrutura do Projeto

```bash
.
├── .ai/                # Documentação técnica e regras do Agente (Contexto)
├── backend/            # API REST (Node.js + Express)
├── frontend/           # Aplicação Web (React + Vite)
└── docker-compose.yml  # Orquestração do ambiente de desenvolvimento
```
