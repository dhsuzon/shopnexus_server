# ShopNexus - Backend API Server

## How the Server Serves the Client

This Express.js backend API server provides all data operations for the ShopNexus frontend client. It handles product CRUD, order management, user authentication (JWT verification via Better Auth JWKS), review submissions, and dashboard analytics. The frontend communicates with this server through RESTful JSON API endpoints.

## Description

ShopNexus Backend is a TypeScript-based Express.js server with MongoDB as the database. It uses JWT-based authentication via Better Auth's JWKS endpoint for secure API access and role-based authorization (user/admin). The server manages product inventory, processes orders, handles reviews/ratings, and provides aggregated data for the admin dashboard.

## Used Packages

| Package | Purpose |
|---------|---------|
| `express` ^5.2.1 | HTTP server framework |
| `typescript` ^7 | Type safety |
| `mongodb` ^7.5.0 | MongoDB native driver |
| `jose` ^6.2.3 | JWT verification (JWKS) |
| `stripe` ^22.3.1 | Payment intent creation |
| `cors` ^2.8.6 | Cross-origin resource sharing |
| `dotenv` ^17.4.2 | Environment variable management |
| `nodemon` ^3.1.14 | Auto-restart during development |
| `tsx` ^4.23.0 | TypeScript execution |

## Key Features

- **Product API:** CRUD operations with search, category filter, price filter, sort, and pagination
- **Order API:** Create orders, get user orders, admin list all orders, update order status
- **Review API:** Fetch product reviews, submit reviews (authenticated), auto-update product rating
- **Dashboard API:** Aggregated stats (total users, products, orders, revenue), monthly order trends, order status distribution
- **Authentication:** JWT verification via Better Auth JWKS endpoint
- **Authorization:** Role-based access control (user/admin)
- **Newsletter:** Email subscription endpoint
- **CORS:** Configured for frontend client origin

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | - | List products (search, filter, sort, paginate) |
| GET | `/api/products/categories` | - | Get all categories |
| GET | `/api/products/:id` | - | Get single product |
| GET | `/api/products/:id/related` | - | Get related products |
| GET | `/api/products/:id/reviews` | - | Get product reviews |
| POST | `/api/products/:id/reviews` | User | Submit a review |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | User | Create order |
| GET | `/api/orders/my-orders` | User | Get user's orders |
| GET | `/api/orders/all` | Admin | Get all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/dashboard/stats` | Admin | Dashboard statistics |
| GET | `/api/dashboard/monthly-orders` | Admin | Monthly order data |
| GET | `/api/dashboard/order-status` | Admin | Order status distribution |
| POST | `/api/newsletter/subscribe` | - | Subscribe to newsletter |

## Environment Setup (.env)

```env
PORT=5001
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

## Installation Process

```bash
# Clone the repository
git clone <repository-url>
cd ShopNexus_server

# Install dependencies
npm install

# Set up environment variables
# Edit .env with your MongoDB connection string and other settings

# Start development server
npm start

# Build for production
npm run build
npm run start:build
```

The server will start on the port specified in the `.env` file (default `5001`). Make sure the frontend client's `NEXT_PUBLIC_API_URL` matches this port.
