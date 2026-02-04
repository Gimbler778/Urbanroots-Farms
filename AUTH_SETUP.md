# Authentication Setup Guide

This guide explains how to set up and use the authentication system in UrbanRoots Farms.

## Features

- **Email/Password Authentication** using Better Auth
- **PostgreSQL Database** for storing user data and sessions
- **Secure Password Hashing** with bcrypt
- **Session Management** with HTTP-only cookies
- **Protected Routes** on both frontend and backend

## Prerequisites

1. **PostgreSQL** installed and running
2. **Python 3.8+** for backend
3. **Node.js 16+** for frontend

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE urbanroots;
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/urbanroots
SECRET_KEY=your-secret-key-here
```

To generate a secure secret key, run:

```bash
openssl rand -hex 32
```

### 4. Initialize the Database

Run the application to create all tables:

```bash
python main.py
```

Or use the init_db script if available:

```bash
python init_db.py
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Sign In

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Sign Out

```http
POST /api/auth/sign-out
```

#### Get Session

```http
GET /api/auth/session
```

## Database Schema

### User Table

- `id`: String (Primary Key)
- `name`: String
- `email`: String (Unique)
- `emailVerified`: Boolean
- `image`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Session Table

- `id`: String (Primary Key)
- `userId`: String (Foreign Key)
- `expiresAt`: DateTime
- `ipAddress`: String
- `userAgent`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Account Table

- `id`: String (Primary Key)
- `accountId`: String
- `providerId`: String
- `userId`: String (Foreign Key)
- `password`: String (Hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Frontend Usage

### Using the Auth Client

```tsx
import { useSession, signIn, signOut } from '@/lib/auth-client'

function MyComponent() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <div>
        <p>Welcome, {session.user.name}!</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    )
  }

  return <button onClick={() => signIn.email({...})}>Sign In</button>
}
```

### Navigation

- **Sign In**: Navigate to `/sign-in`
- **Sign Out**: Navigate to `/sign-out` (automatically signs out and redirects)

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies to prevent XSS attacks
3. **CORS Protection**: Backend only accepts requests from configured origins
4. **Session Expiration**: Sessions automatically expire after 30 days
5. **Database Health Checks**: Connection pool includes pre-ping for reliability

## Troubleshooting

### Database Connection Issues

If you get a database connection error:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Ensure the database exists: `psql -l`

### CORS Errors

If you see CORS errors in the browser console:

1. Check that your frontend URL is in `ALLOWED_ORIGINS` in `.env`
2. Restart the backend server after changing `.env`

### Session Not Persisting

If sessions don't persist between page refreshes:

1. Check browser console for cookie errors
2. Verify cookies are enabled in your browser
3. For production, set `secure=True` in cookie settings (requires HTTPS)

## Production Deployment

### Environment Variables

For production, update these settings:

```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generate-a-new-secure-key>
DATABASE_URL=postgresql://user:pass@production-host:5432/urbanroots
ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Checklist

- [ ] Generate a new SECRET_KEY
- [ ] Set `secure=True` for cookies (requires HTTPS)
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable logging and monitoring

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [React Router](https://reactrouter.com/)
