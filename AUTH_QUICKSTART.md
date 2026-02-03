# 🔐 Authentication System - Quick Setup

Your UrbanRoots authentication system is ready! Here's how to get started.

## ✅ What's Been Set Up

### Backend (FastAPI + PostgreSQL)
- ✅ Better Auth compatible authentication routes
- ✅ User, Session, Account, and Verification database models
- ✅ Password hashing with bcrypt
- ✅ Session management with HTTP-only cookies
- ✅ PostgreSQL support (with SQLite fallback)
- ✅ CORS configuration for frontend access

### Frontend (React + Better Auth)
- ✅ Better Auth React client
- ✅ Sign In / Sign Up page with toggle
- ✅ Sign Out page with auto-redirect
- ✅ Auth-aware Navbar showing user name
- ✅ Session hook for checking auth status
- ✅ Beautiful UI with shadcn/ui components

## 🚀 Quick Start

### 1. Set Up PostgreSQL Database

```bash
# Create the database (run in PostgreSQL)
createdb urbanroots
```

Or using psql:
```sql
CREATE DATABASE urbanroots;
```

### 2. Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/urbanroots
```

### 3. Install Backend Dependencies

```bash
# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (includes psycopg2-binary for PostgreSQL)
pip install -r requirements.txt
```

### 4. Initialize Database

```bash
# Create all tables
python init_db.py
```

### 5. Start Backend

```bash
python main.py
# Backend runs at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 6. Start Frontend

```bash
cd ../frontend

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
# Frontend runs at: http://localhost:5173
```

## 🧪 Testing the Authentication

1. **Open the app**: Navigate to `http://localhost:5173`

2. **Sign Up**:
   - Click "Sign In" in the navbar
   - Toggle to "Sign Up"
   - Enter name, email, and password
   - Click "Sign up"

3. **Verify**:
   - You should be redirected to the home page
   - Your name should appear in the navbar
   - "Sign Out" button should be visible

4. **Sign Out**:
   - Click "Sign Out" in the navbar
   - You'll be signed out and redirected

5. **Sign In**:
   - Click "Sign In" in the navbar
   - Enter your email and password
   - Click "Sign in"

## 📁 New Files Created

### Backend
- `backend/app/models/user.py` - User, Session, Account, Verification models
- `backend/app/api/routes/auth.py` - Authentication endpoints
- `backend/.env.example` - Updated with PostgreSQL config

### Frontend
- `frontend/src/lib/auth-client.ts` - Better Auth client setup
- `frontend/src/pages/SignInPage.tsx` - Sign in/up page
- `frontend/src/pages/SignOutPage.tsx` - Sign out page
- `frontend/src/components/ui/input.tsx` - Input component
- `AUTH_SETUP.md` - Detailed documentation

### Updated Files
- `backend/requirements.txt` - Added psycopg2-binary
- `backend/app/core/config.py` - PostgreSQL default, added Vite ports to CORS
- `backend/app/core/database.py` - Better connection handling
- `backend/app/models/__init__.py` - Import auth models
- `backend/main.py` - Include auth router
- `frontend/src/App.tsx` - Added sign-in/out routes
- `frontend/src/components/Navbar.tsx` - Added auth UI

## 🔒 Security Features

- **Password Hashing**: bcrypt with automatic salt
- **HTTP-Only Cookies**: Session tokens not accessible via JavaScript
- **Session Expiration**: 30-day automatic expiration
- **CORS Protection**: Whitelist-based origin control
- **Connection Pooling**: Database connection health checks

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up` | Create new user account |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-out` | Sign out and clear session |
| GET | `/api/auth/session` | Get current session info |

## 🛠️ Configuration Options

### Environment Variables (backend/.env)

```env
# Database - Use PostgreSQL for production
DATABASE_URL=postgresql://user:pass@localhost:5432/urbanroots

# Security - Generate with: openssl rand -hex 32
SECRET_KEY=your-secret-key-here

# Session duration
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS - Add your production domain
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## 🐛 Troubleshooting

### "Database connection failed"
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

### "CORS error" in browser
- Check frontend URL is in `ALLOWED_ORIGINS`
- Restart backend after changing `.env`
- Vite default port (5173) is already included

### "Module not found" errors
- Backend: Make sure virtual environment is activated
- Frontend: Run `npm install` again
- Check you're in the correct directory

### Sessions not persisting
- Check browser allows cookies
- Verify cookie settings in browser DevTools
- For production, enable HTTPS and set `secure=True`

## 📖 Additional Documentation

For more detailed information, see:
- `AUTH_SETUP.md` - Complete authentication guide
- `DOCUMENTATION.md` - General project documentation
- API docs - `http://localhost:8000/docs` (when running)

## 🎯 Next Steps

1. **Test the authentication flow** completely
2. **Customize the sign-in page** styling to match your brand
3. **Add protected routes** that require authentication
4. **Implement password reset** functionality (optional)
5. **Add email verification** (optional)
6. **Set up production environment** with proper secrets

## 💡 Tips

- Use **strong passwords** (8+ characters) for testing
- Check browser **DevTools → Application → Cookies** to see session token
- Visit **http://localhost:8000/docs** to test API endpoints directly
- Use **PostgreSQL** for production (SQLite is fine for development)

---

Need help? Check the detailed documentation in `AUTH_SETUP.md` or review the API docs at `/docs`.
