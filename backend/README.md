# Construction & Real Estate Management System Backend

Node.js + Express + MySQL Backend API for the Construction & Real Estate Management System.

## Architecture

```
backend/
├── config/
│   └── db.js               # MySQL Connection Pool
├── controllers/            # Route business logic handlers
├── database/
│   ├── schema.sql          # MySQL DDL relational schema definition
│   └── seed.sql            # Initial master data & sample seed SQL
├── middleware/
│   └── authMiddleware.js   # JWT authentication & session handler
├── routes/                 # Express API routes definition
├── .env                    # Local environment config
├── .env.example            # Environment sample template
├── package.json            # Node.js project manifest & npm scripts
├── server.js               # Express application entrypoint
└── README.md
```

## Setup Instructions

### 1. Database Setup (MySQL)
Make sure MySQL is running on port 3306 (or configured DB_PORT).

Initialize schema and seed data:
```bash
mysql -u root < database/schema.sql
mysql -u root construction_realestate_db < database/seed.sql
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=construction_realestate_db
DB_PORT=3306
JWT_SECRET=construction_realestate_jwt_secret_key_2026
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Backend Server

Development mode with nodemon:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Backend API will run on `http://localhost:5000`.
