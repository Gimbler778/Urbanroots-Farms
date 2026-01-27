# UrbanRoots E-Commerce Platform

A full-stack e-commerce web application for organic produce, built with TypeScript, React, FastAPI, and modern web technologies.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **UI Components**: Custom components with shadcn-inspired design
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQLite (easily switchable to PostgreSQL)
- **Validation**: Pydantic v2
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: Passlib with bcrypt
- **Server**: Uvicorn with hot reload

## Project Structure

```
urbanroots/
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── CheckoutPage.tsx
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper utilities
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── backend/
    ├── app/
    │   ├── api/
    │   │   └── routes/      # API route handlers
    │   │       ├── products.py
    │   │       └── orders.py
    │   ├── core/            # Core configurations
    │   │   ├── config.py
    │   │   └── database.py
    │   ├── models/          # SQLAlchemy models
    │   ├── schemas/         # Pydantic schemas
    │   └── services/        # Business logic
    │       ├── product_service.py
    │       └── order_service.py
    ├── tests/               # Test files
    ├── .env.example         # Environment variables template
    ├── main.py              # Application entry point
    ├── requirements.txt
    └── requirements-dev.txt
```

## Features

- 🛍️ Product browsing with category filtering
- 🛒 Shopping cart with real-time updates
- 💳 Checkout with shipping information
- 📦 Order management
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Type-safe frontend and backend
- 🚀 Fast development with hot reload
- 📱 Mobile-friendly design

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `.\venv\Scripts\Activate.ps1`
- Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Copy the environment variables:
```bash
cp .env.example .env
```

6. Start the development server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`
API documentation (Swagger): `http://localhost:8000/docs`

## Development

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Commands
```bash
python main.py                    # Run the server
uvicorn main:app --reload         # Run with uvicorn (recommended for dev)
pytest                            # Run tests
pip install -r requirements-dev.txt  # Install dev dependencies
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with optional category filter)
- `GET /api/products/{id}` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/{id}` - Update order status

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./urbanroots.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
```

## Database

The application uses SQLite by default for easy setup. To use PostgreSQL:

1. Install PostgreSQL and create a database
2. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/urbanroots
```
3. Install the PostgreSQL driver:
```bash
pip install psycopg2-binary
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- React and Vite teams
- FastAPI community
- Tailwind CSS and DaisyUI
- shadcn/ui for design inspiration
