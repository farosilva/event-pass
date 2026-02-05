# EventPass 🎟️

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

## 📂 Estrutura do Projeto

```bash
.
├── .ai/                # Documentação técnica e regras do Agente (Contexto)
├── backend/            # API REST (Node.js + Express)
├── frontend/           # Aplicação Web (React + Vite)
└── docker-compose.yml  # Orquestração do ambiente de desenvolvimento