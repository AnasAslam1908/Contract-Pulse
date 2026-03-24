# ContractPulse

A comprehensive contract and invoice management platform built with Spring Boot and React.

## Project Structure

```
Contract-Pulse/
├── contact-pulse-backend/     # Spring Boot Backend
│   └── src/
│       ├── main/java/io/anas/contractpulse/
│       │   ├── auth/          # Authentication & JWT
│       │   ├── contract/      # Contract Management
│       │   ├── invoice/       # Invoice Generation
│       │   ├── client/        # Client Management
│       │   ├── dashboard/     # Dashboard Stats
│       │   └── security/      # Security Config
│       └── resources/
│           └── application.properties
│
└── contracts-pulse-frontend/   # React + TypeScript Frontend
    └── src/
        ├── pages/            # Page components
        ├── components/       # Reusable components
        ├── contexts/         # Auth context
        ├── hooks/            # Custom hooks
        └── lib/              # Utilities & API
```

## Features

- 📋 **Contract Management** - Create, track, and manage contracts
- 💰 **Invoice Generation** - Auto-generate and download invoices as PDF
- 👥 **Client Management** - Track and manage clients
- 📊 **Dashboard** - Real-time statistics and insights
- 🔐 **Secure Authentication** - JWT-based authentication
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with React, Tailwind CSS, and shadcn/ui

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MySQL/PostgreSQL
- **Security**: Spring Security + JWT
- **PDF Generation**: iText
- **Build**: Maven

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **Build**: Vite

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- npm or bun
- MySQL/PostgreSQL

### Backend Setup

```bash
cd contact-pulse-backend
mvn clean install
mvn spring-boot:run
```

The backend will run on `http://localhost:8081`

### Frontend Setup

```bash
cd contracts-pulse-frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend
Create `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/contract_pulse
spring.datasource.username=root
spring.datasource.password=your_password
app.jwt.secret=your_jwt_secret_key_here
app.jwt.expiration-ms=86400000
app.storage.invoice-dir=./invoices/
```

### Frontend
No environment variables needed - uses localhost:8081 by default

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create contract
- `GET /api/contracts/{id}` - Get contract details
- `PUT /api/contracts/{id}` - Update contract
- `DELETE /api/contracts/{id}` - Delete contract

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices/generate/{milestoneId}` - Generate invoice
- `GET /api/invoices/{id}/pdf` - Download invoice as PDF
- `PATCH /api/invoices/{id}/status` - Update invoice status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Contributing

Feel free to fork this project and submit pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

