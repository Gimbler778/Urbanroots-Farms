# Project Documentation

## Architecture Overview

### Frontend Architecture
The frontend follows a modern React architecture with TypeScript:

- **Component-based**: Modular, reusable components
- **Type-safe**: Full TypeScript coverage
- **State Management**: Zustand for global state (cart)
- **Routing**: React Router for client-side routing
- **Styling**: Utility-first with Tailwind CSS + DaisyUI components

### Backend Architecture
The backend uses FastAPI with a layered architecture:

- **Routes Layer**: HTTP endpoint definitions
- **Service Layer**: Business logic and data operations
- **Models Layer**: SQLAlchemy ORM models
- **Schemas Layer**: Pydantic models for validation

## Key Directories

### Frontend (`/frontend/src`)
- `components/ui/` - Reusable UI components (Button, Card, etc.)
- `pages/` - Full page components
- `services/` - API communication layer
- `store/` - Zustand state management
- `types/` - TypeScript type definitions
- `lib/` - Utility functions and helpers

### Backend (`/backend/app`)
- `api/routes/` - API endpoint handlers
- `core/` - Configuration and database setup
- `models/` - Database models
- `schemas/` - Request/response schemas
- `services/` - Business logic

## Data Models

### Product
```typescript
{
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'vegetables' | 'fruits' | 'herbs'
  stock: number
  organic: boolean
  unit: string
}
```

### Order
```typescript
{
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shippingAddress: Address
  createdAt: string
}
```

## API Documentation

Full interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## State Management

### Cart Store (Zustand)
The cart is managed globally using Zustand:

```typescript
{
  items: CartItem[]
  addItem: (product, quantity) => void
  removeItem: (productId) => void
  updateQuantity: (productId, quantity) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}
```

## Styling System

### Tailwind CSS + DaisyUI
The project uses Tailwind CSS for utility-first styling and DaisyUI for pre-built components:

- Base styles in `src/index.css`
- Theme configuration in `tailwind.config.js`
- Custom colors using CSS variables
- Responsive design with mobile-first approach

### Color Palette
```css
--primary: Green (organic theme)
--secondary: Neutral gray
--accent: Light green
--background: White/Dark
```

## Environment Setup

### Required Tools
- Node.js 18+
- Python 3.11+
- npm or yarn
- pip

### Environment Variables

#### Frontend
```env
VITE_API_URL=http://localhost:8000/api
```

#### Backend
```env
DATABASE_URL=sqlite:///./urbanroots.db
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

## Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Run tests
npm run test:watch  # Watch mode
```

### Backend Testing
```bash
cd backend
pytest              # Run all tests
pytest -v           # Verbose output
pytest tests/test_products.py  # Specific test file
```

## Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy with Python buildpack
```

## Common Issues & Solutions

### Frontend Won't Start
- Check if port 3000 is available
- Delete `node_modules` and reinstall: `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Backend Won't Start
- Ensure virtual environment is activated
- Check if port 8000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check .env file exists with correct values

### CORS Issues
- Verify `ALLOWED_ORIGINS` in backend `.env`
- Check frontend is using correct `VITE_API_URL`
- Ensure both servers are running

## Performance Optimization

### Frontend
- Lazy loading routes
- Image optimization
- Code splitting
- Memoization for expensive computations

### Backend
- Database indexing
- Query optimization
- Response caching
- Connection pooling

## Security Best Practices

1. Never commit `.env` files
2. Use strong `SECRET_KEY` in production
3. Enable HTTPS in production
4. Validate all user inputs
5. Sanitize database queries
6. Use prepared statements

## Contributing Guidelines

1. Create a feature branch
2. Follow TypeScript/Python conventions
3. Add tests for new features
4. Update documentation
5. Submit PR with description

## Useful Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

### Backend
```bash
python main.py              # Start server
uvicorn main:app --reload   # Start with auto-reload
python init_db.py           # Initialize database
pytest                      # Run tests
```

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
