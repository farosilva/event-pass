# Diagramas de Sequência

## Fluxos Principais do EventPass

### 1. Fluxo de Compra de Ingresso

Este diagrama mostra o processo completo de compra de um ingresso, incluindo validações e controle de concorrência.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as Backend API
    participant TC as TicketController
    participant TS as TicketService
    participant DB as PostgreSQL
    participant ES as EmailService
    participant JWT as JWT Utils

    U->>F: Seleciona evento e clica "Comprar"
    F->>API: POST /tickets<br/>{eventId, token: Bearer}
    
    Note over API: AuthMiddleware valida JWT
    API->>TC: buyTicket(eventId, userId)
    TC->>TS: buyTicket(userId, eventId)
    
    Note over TS, DB: Transação Atômica
    TS->>DB: BEGIN TRANSACTION
    TS->>DB: SELECT Event WHERE id = eventId
    DB-->>TS: Event data
    
    alt Event não encontrado
        TS-->>TC: Error: Event not found
        TC-->>API: 404 Not Found
        API-->>F: Error response
        F-->>U: "Evento não encontrado"
    else Event com tickets disponíveis
        TS->>DB: SELECT Ticket WHERE userId+eventId
        DB-->>TS: Existing ticket check
        
        alt Usuário já tem ingresso
            TS-->>TC: Error: User already has ticket
            TC-->>API: 400 Bad Request  
            API-->>F: Error response
            F-->>U: "Você já possui ingresso para este evento"
        else Pode comprar
            TS->>JWT: signToken({ticketId, userId, eventId, eventTitle})
            JWT-->>TS: JWT token
            TS->>DB: INSERT Ticket
            TS->>DB: UPDATE Event SET availableTickets = availableTickets - 1
            TS->>DB: COMMIT TRANSACTION
            DB-->>TS: Ticket with relations
            
            Note over TS: Email assíncrono (fire & forget)
            TS->>ES: sendTicketPurchasedEmail(email, name, eventTitle, code)
            
            TS-->>TC: Ticket data
            TC-->>API: 201 Created + Ticket
            API-->>F: Success + Ticket data
            F-->>U: "Ingresso comprado com sucesso!"
        end
    else Event esgotado
        TS-->>TC: Error: Event sold out
        TC-->>API: 400 Bad Request
        API-->>F: Error response
        F-->>U: "Evento esgotado"
    end
```

### 2. Fluxo de Autenticação (Login)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as Backend API
    participant AC as AuthController
    participant AS as AuthService
    participant DB as PostgreSQL
    participant JWT as JWT Utils
    participant Hash as Hash Utils

    U->>F: Insere email/senha e clica "Login"
    F->>API: POST /auth/login<br/>{email, password}
    API->>AC: login(email, password)
    AC->>AS: login(email, password)
    
    AS->>DB: SELECT User WHERE email = email
    DB-->>AS: User data (with hashed password)
    
    alt Usuário não encontrado
        AS-->>AC: Error: Invalid credentials
        AC-->>API: 401 Unauthorized
        API-->>F: Error response
        F-->>U: "Credenciais inválidas"
    else Usuário encontrado
        AS->>Hash: compare(password, user.password)
        Hash-->>AS: Password match result
        
        alt Senha incorreta
            AS-->>AC: Error: Invalid credentials
            AC-->>API: 401 Unauthorized
            API-->>F: Error response
            F-->>U: "Credenciais inválidas"
        else Senha correta
            AS->>JWT: signToken({userId, email, role})
            JWT-->>AS: JWT token
            
            AS-->>AC: {token, user: {id, name, email, role}}
            AC-->>API: 200 OK + Auth data
            API-->>F: Success + Auth data
            F->>F: localStorage.setItem('token', token)
            F->>F: localStorage.setItem('user', user)
            F-->>U: Redirecionamento para dashboard
        end
    end
```

### 3. Fluxo de Validação de Ingresso (Check-in)

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant API as Backend API
    participant TC as TicketController
    participant TS as TicketService
    participant DB as PostgreSQL
    participant JWT as JWT Utils

    A->>F: Escaneia QR Code do ingresso
    F->>F: Extrai token do QR Code
    F->>API: POST /tickets/validate<br/>{token, authToken: Bearer}
    
    Note over API: AuthMiddleware + AdminMiddleware
    API->>TC: validate(token)
    TC->>TS: validateCheckIn(token)
    
    TS->>JWT: verifyToken(token)
    JWT-->>TS: Decoded token data
    
    alt Token inválido ou expirado
        TS-->>TC: Error: Invalid token
        TC-->>API: 400 Bad Request
        API-->>F: Error response
        F-->>A: "Token inválido"
    else Token válido
        TS->>DB: SELECT Ticket WHERE id = ticketId
        DB-->>TS: Ticket data
        
        alt Ingresso não encontrado
            TS-->>TC: Error: Ticket not found
            TC-->>API: 404 Not Found
            API-->>F: Error response
            F-->>A: "Ingresso não encontrado"
        else Ingresso encontrado
            alt Já foi validado
                TS-->>TC: Info: Already checked in
                TC-->>API: 200 OK (already validated)
                API-->>F: Already validated info
                F-->>A: "Ingresso já foi validado"
            else Primeira validação
                TS->>DB: UPDATE Ticket SET checkedInAt = NOW()
                DB-->>TS: Updated ticket
                TS-->>TC: Success: Check-in completed
                TC-->>API: 200 OK + Validation data
                API-->>F: Success response
                F-->>A: "Check-in realizado com sucesso!"
            end
        end
    end
```

## Características dos Fluxos

### Segurança
- Todos os endpoints protegidos requerem token JWT válido
- Operações administrativas requerem role ADMIN
- Tokens de ingresso são JWT assinados com informações do evento

### Concorrência
- Compra de ingressos usa transações atômicas para evitar overselling
- Controle de disponibilidade é feito no nível de banco de dados

### Experiência do Usuário
- Emails de confirmação enviados de forma assíncrona
- Feedback claro para todos os cenários de erro
- Validação de ingressos com QR Code para facilidade de uso