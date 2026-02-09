# Diagrama de Arquitetura

## Visão Geral da Arquitetura do EventPass

### Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "Cliente"
        Browser[Browser Web<br/>Chrome/Firefox/Safari]
    end
    
    subgraph "Docker Environment"
        subgraph "Frontend Container"
            React[React 18<br/>+ TypeScript]
            Vite[Vite Dev Server<br/>Port 3000]
            TW[Tailwind CSS]
            Router[React Router]
        end
        
        subgraph "Backend Container"  
            Express[Express.js<br/>+ TypeScript]
            Server[Node.js Server<br/>Port 3001]
            JWT[JWT Auth]
            Swagger[Swagger Docs]
        end
        
        subgraph "Database Container"
            Postgres[(PostgreSQL 15<br/>Port 5432)]
            Vol[Docker Volume<br/>postgres_data]
        end
    end
    
    subgraph "External Services"
        Email[Email Service<br/>SMTP/Nodemailer]
    end

    Browser -->|HTTP/HTTPS Requests| Vite
    React -->|API Calls /api/*| Express
    Express -->|Prisma Client| Postgres
    Express -.->|Send Emails| Email
    Postgres -->|Persist Data| Vol
    
    style React fill:#61DAFB
    style Express fill:#68A063
    style Postgres fill:#336791
    style Docker fill:#2496ED
```

### Arquitetura Interna do Backend

```mermaid
graph TB
    subgraph "Presentation Layer"
        Routes[routes.ts<br/>Route Definitions]
        Auth[AuthController]
        Event[EventController] 
        Ticket[TicketController]
    end
    
    subgraph "Business Layer"
        AuthSrv[AuthService<br/>User Management]
        EventSrv[EventService<br/>Event Management]
        TicketSrv[TicketService<br/>Ticket Management]
        EmailSrv[EmailService<br/>Notification Service]
    end
    
    subgraph "Infrastructure Layer"
        Prisma[Prisma Client<br/>ORM/Query Builder]
        Logger[Winston Logger<br/>Structured Logging]
        Utils[Utilities<br/>JWT, Hash, Validation]
    end
    
    subgraph "Middleware Layer"
        AuthMid[authMiddleware<br/>JWT Validation]
        AdminMid[adminMiddleware<br/>RBAC]
        ErrorMid[errorMiddleware<br/>Error Handling]
    end
    
    subgraph "Database"
        DB[(PostgreSQL<br/>Users, Events, Tickets)]
    end
    
    Routes --> Auth
    Routes --> Event
    Routes --> Ticket
    
    Auth --> AuthSrv
    Event --> EventSrv  
    Ticket --> TicketSrv
    
    AuthSrv --> Prisma
    EventSrv --> Prisma
    TicketSrv --> Prisma
    TicketSrv --> EmailSrv
    
    Prisma --> DB
    
    Routes -.->|Uses| AuthMid
    Routes -.->|Uses| AdminMid 
    Routes -.->|Uses| ErrorMid
    
    AuthSrv -.->|Uses| Utils
    TicketSrv -.->|Uses| Utils
    
    EmailSrv -.->|Logs| Logger
    TicketSrv -.->|Logs| Logger
    AuthSrv -.->|Logs| Logger
```

### Arquitetura Interna do Frontend

```mermaid
graph TB
    subgraph "Components Layer"
        Layout[Layout Component<br/>Navigation & Structure]
        QR[QRScanner Component<br/>Ticket Validation]
        Modal[CreateAdminModal<br/>Admin Management]
    end
    
    subgraph "Pages Layer"
        Login[Login Page<br/>User Authentication]
        Register[Register Page<br/>User Registration]
        Events[EventList Page<br/>Browse Events]
        Tickets[MyTickets Page<br/>User's Tickets]
        Admin[AdminDashboard<br/>Event Management]
    end
    
    subgraph "Context Layer"
        AuthCtx[AuthContext<br/>Global State Management]
        LocalStore[localStorage<br/>Token Persistence]
    end
    
    subgraph "Services Layer"
        API[api.ts<br/>HTTP Client/Axios]
        Utils[Utils<br/>Regions, Helpers]
    end
    
    subgraph "Routing"
        Router[React Router<br/>SPA Navigation]
        Protected[Protected Routes<br/>RBAC Implementation]
    end

    Layout --> Login
    Layout --> Register
    Layout --> Events
    Layout --> Tickets
    Layout --> Admin
    
    Login --> AuthCtx
    Register --> AuthCtx
    Events --> API
    Tickets --> API
    Admin --> API
    
    AuthCtx --> LocalStore
    API --> AuthCtx
    
    Router --> Protected
    Protected --> AuthCtx
    
    Admin --> Modal
    Admin --> QR
    
    style AuthCtx fill:#FF6B6B
    style API fill:#4ECDC4
    style Router fill:#45B7D1
```

## Padrões Arquiteturais Implementados

### 1. Monolito Modular (Backend)
```mermaid
graph LR
    subgraph "Modular Monolith"
        direction TB
        C[Controllers<br/>Presentation]
        S[Services<br/>Business Logic]
        R[Repository<br/>Data Access via Prisma]
    end
    
    C --> S
    S --> R
    
    style C fill:#FFD93D
    style S fill:#6BCF7F
    style R fill:#4D96FF
```

### 2. Microservices-Ready Structure
- **Separação clara de responsabilidades** por domínio (Auth, Events, Tickets)
- **Services independentes** podem ser extraídos facilmente
- **Database per service** pattern preparado (cada entidade isolada)

### 3. Security Architecture
```mermaid
graph TB
    Client[Client Browser]
    
    subgraph "Security Layers"
        CORS[CORS Protection<br/>Origin Validation]
        JWT[JWT Middleware<br/>Token Validation]  
        RBAC[Role-Based Access<br/>Admin/User Permissions]
        Hash[Password Hashing<br/>bcrypt]
    end
    
    subgraph "Protected Resources"
        AdminAPI[Admin Endpoints]
        UserAPI[User Endpoints]
        PublicAPI[Public Endpoints]
    end
    
    Client -->|Requests| CORS
    CORS --> JWT
    JWT --> RBAC
    
    RBAC -->|Admin Role| AdminAPI
    RBAC -->|User Role| UserAPI
    CORS -->|No Auth| PublicAPI
    
    style JWT fill:#FF6B6B
    style RBAC fill:#4ECDC4
```

## Características Técnicas

### Containerização
- **Docker Compose**: Orquestração completa do ambiente
- **Multi-stage builds**: Otimização de imagens para dev/prod
- **Volume persistence**: Dados do PostgreSQL persistidos
- **Network isolation**: Rede interna para comunicação entre containers

### Tecnologias utilizadas

**Frontend Stack:**
- React 18 com TypeScript
- Vite (build tool e dev server)
- Tailwind CSS (styling)
- React Router (roteamento)
- Axios (HTTP client)

**Backend Stack:**
- Node.js com Express.js
- TypeScript (type safety)
- Prisma ORM (database abstraction)
- JWT (autenticação stateless)
- Swagger (documentação de API)
- Winston (logging estruturado)

**Infrastructure:**
- PostgreSQL 15 (banco relacional)
- Docker & Docker Compose (containerização)
- Volume persistence (dados)

### Princípios de Design

1. **Separation of Concerns**: Cada camada tem responsabilidade específica
2. **Dependency Injection**: Services injetados nos controllers
3. **Transaction Safety**: Operações críticas em transações atômicas
4. **Error Handling**: Middleware centralizado para tratamento de erros
5. **Type Safety**: TypeScript em toda a aplicação
6. **Stateless Authentication**: JWT para escalabilidade horizontal