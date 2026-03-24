# 🌱 UrbanRoots E-Commerce Platform - Quick Start Guide

## ✅ Project Setup Complete!

Your full-stack e-commerce platform is ready to go!

---

## 📁 Project Structure

```
urbanroots/
├── frontend/          # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── pages/     # HomePage, ProductsPage, CartPage, etc.
│   │   ├── components/ui/  # Reusable UI components
│   │   ├── services/  # API integration
│   │   ├── store/     # Zustand state management
│   │   └── types/     # TypeScript definitions
│   └── package.json
│
└── backend/           # Python + FastAPI + SQLAlchemy
    ├── app/
    │   ├── api/routes/    # API endpoints
    │   ├── core/          # Config & database
    │   ├── models/        # Database models
    │   ├── schemas/       # Pydantic schemas
    │   └── services/      # Business logic
    ├── main.py
    └── requirements.txt
```

---

## 🚀 How to Run

### Option 1: Quick Start (Automated)
```powershell
.\start.ps1
```

### Option 2: Manual Start

#### Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

---

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

---

## 📦 What's Included

### Frontend Features:
✅ Home page with hero section
✅ Product listing with category filters
✅ Product detail pages
✅ Shopping cart with quantity controls
✅ Checkout page with shipping form
✅ Responsive design (mobile-friendly)
✅ Modern UI with Tailwind CSS + DaisyUI
✅ Type-safe with TypeScript

### Backend Features:
✅ RESTful API with FastAPI
✅ Product management endpoints
✅ Order management system
✅ SQLite database with sample data (12 products)
✅ Data validation with Pydantic
✅ CORS configured for frontend
✅ Auto-generated API documentation

---

## 🎨 Technology Stack

### Frontend:
- React 18 with TypeScript
- Vite (fast build tool)
- Tailwind CSS + DaisyUI
- React Router v6
- Zustand (state management)
- Axios (HTTP client)
- Lucide React (icons)

### Backend:
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Pydantic v2 (validation)
- Uvicorn (ASGI server)
- SQLite database

---

## 📚 Sample Data

The database comes pre-loaded with 12 organic products:
- Organic Tomatoes, Spinach, Lettuce, Carrots, Bell Peppers
- Organic Strawberries, Blueberries, Apples, Bananas
- Organic Basil, Mint, Parsley

---

## 🛠️ Development Commands

### Frontend:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend:
```bash
python main.py              # Run server
python init_db.py           # Re-initialize database
pip install -r requirements.txt  # Install dependencies
```

---

## 📖 Documentation

- **README.md** - Project overview and setup instructions
- **DOCUMENTATION.md** - Detailed technical documentation
- **Backend API Docs** - http://localhost:8000/docs (when running)

---

## 🔧 Configuration

### Frontend (.env):
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env):
```
DATABASE_URL=sqlite:///./urbanroots.db
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🎯 Next Steps

1. **Start the application** using one of the methods above
2. **Browse products** at http://localhost:3000/products
3. **Add items to cart** and test the checkout flow
4. **Explore the API** at http://localhost:8000/docs
5. **Customize** the code to fit your needs!

---

## 💡 Tips

- The frontend uses proxy configuration to avoid CORS issues in development
- Sample products have placeholder images from Pexels
- Database is SQLite for easy development (switch to PostgreSQL for production)
- All code is type-safe (TypeScript + Pydantic)
- Hot reload is enabled for both frontend and backend

---

## 🐛 Troubleshooting

**Port already in use?**
- Frontend: Change port in `vite.config.ts`
- Backend: Change port in `main.py`

**Dependencies not installed?**
- Frontend: `npm install` in frontend folder
- Backend: Activate venv and run `pip install -r requirements.txt`

**Database not working?**
- Run `python init_db.py` in backend folder

---

## 📞 Support

For issues or questions:
1. Check DOCUMENTATION.md for detailed information
2. Review the README.md
3. Check the API documentation at /docs

---

**Happy Coding! 🚀**

Made with ❤️ using TypeScript, React, FastAPI, and modern web technologies
