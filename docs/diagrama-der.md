# Diagrama de Entidade-Relacionamento (DER)

## Modelo de Dados do EventPass

Este diagrama representa as entidades principais do sistema EventPass e seus relacionamentos.

```mermaid
erDiagram
    USER {
        String id PK "uuid"
        String email UK "unique email"
        String password "encrypted password"
        String name "user full name"
        Role role "USER or ADMIN"
        DateTime createdAt "creation timestamp"
        DateTime updatedAt "last update timestamp"
    }
    
    EVENT {
        String id PK "uuid"
        String title "event title"
        String description "event description"
        DateTime date "event date and time"
        String location "event location"
        Int totalTickets "total available tickets"
        Int availableTickets "remaining tickets"
        DateTime createdAt "creation timestamp"
        DateTime updatedAt "last update timestamp"
    }
    
    TICKET {
        String id PK "uuid"
        String userId FK "user reference"
        String eventId FK "event reference"
        String code UK "JWT token or hash"
        DateTime checkedInAt "check-in timestamp (nullable)"
        DateTime createdAt "creation timestamp"
        DateTime updatedAt "last update timestamp"
    }
    
    USER ||--o{ TICKET : "purchases"
    EVENT ||--o{ TICKET : "has"
    
    USER {
        Role role "Enum: USER, ADMIN"
    }
```

## Descrição das Entidades

### USER
- **Propósito**: Representa os usuários do sistema (compradores e administradores)
- **Campos principais**:
  - `role`: Define se é usuário comum ou administrador
  - `email`: Único no sistema, usado para autenticação
  - `password`: Armazenado de forma criptografada

### EVENT
- **Propósito**: Representa os eventos disponíveis para compra de ingressos
- **Campos principais**:
  - `totalTickets`: Capacidade total do evento
  - `availableTickets`: Ingressos ainda disponíveis (decrementado a cada compra)

### TICKET
- **Propósito**: Representa a relação entre usuário e evento (ingresso comprado)
- **Campos principais**:
  - `code`: Token JWT único para validação do ingresso
  - `checkedInAt`: Timestamp do check-in (null = não fez check-in)
  - Constraint única: um usuário só pode ter um ingresso por evento

## Regras de Negócio Implementadas

1. **Um usuário por evento**: Constraint `@@unique([userId, eventId])` impede múltiplos ingressos
2. **Controle de disponibilidade**: Campo `availableTickets` é decrementado atomicamente
3. **Segurança**: Códigos dos ingressos são tokens JWT assinados
4. **Auditoria**: Todos os registros têm timestamps de criação e atualização