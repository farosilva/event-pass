# Technology Stack (Prescriptive)

Any dependency not listed below requires explicit approval from the Technical Lead.

## 1. Core
- **Language**: TypeScript 5+

## 2. Frontend
- **Framework**: React 18+ (bundled via **Vite**)
- **Styling**: Tailwind CSS
- **HTTP Client**: axios
- **Validation**: Zod (Form schemata)
- **QR Code**:
  - Geração: `qrcode.react`
  - Leitura: `react-qr-reader`
- **Icons**: @heroicons/react

## 3. Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express
- **Database/ORM**: Prisma ORM
- **Authentication**: JsonWebToken (JWT)
- **Validation**: Zod (DTOs & Inputs)
- **Logging**: Winston (Mandatory)
- **Email**: Nodemailer + Ethereal (Dev/Test)

## 4. Infrastructure
- **Containerization**: Docker & Docker Compose (Mandatory for all services)

## 5. Prohibited Technologies 🚫
- **Validation**: Joi, Yup. (Reason: Standardization on Zod).
- **State Management**: Redux, MobX. (Reason: Use Context API for simplicity).
- **ORM**: TypeORM, Sequelize. (Reason: Standardization on Prisma).
- **Styling**: CSS Modules, Styled Components, SASS/SCSS. (Reason: Standardization on Tailwind).
