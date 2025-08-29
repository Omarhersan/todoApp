# Phone-Based Todo App Authentication

This is a simple Next.js todo application with phone-based authentication using Supabase as the database backend.

## Features

- **Simple Phone Authentication**: Users can sign up and login using just their phone number (no password required)
- **User-Specific Todos**: Each user can only see and manage their own todos
- **Session Management**: Cookie-based session management for authentication
- **Responsive UI**: Modern, clean interface using Tailwind CSS and shadcn/ui components

## Authentication Flow

### Sign Up
1. User provides their name and phone number
2. System validates the phone number (must be numeric only)
3. User account is created in the `users` table
4. User is automatically logged in with a session cookie

### Login  
1. User provides their phone number
2. System looks up the user by phone number
3. If found, user is logged in with a session cookie
4. If not found, error message is displayed

### Session Management
- Sessions are stored as HTTP-only cookies (`user_id`)
- Cookies expire after 7 days
- Middleware protects routes and redirects unauthenticated users to login

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text DEFAULT ''::text,
  phone text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

### Todos Table
```sql
CREATE TABLE public.todos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title character varying,
  is_completed boolean DEFAULT false,
  completed_at timestamp without time zone,
  description text,
  user_id bigint,
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

## API Routes

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with phone number  
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get current user info

### Todos
- `GET /api/todos` - Get all todos for authenticated user
- `POST /api/todos` - Create new todo for authenticated user
- `GET /api/todos/[id]` - Get specific todo (user-scoped)
- `PUT /api/todos/[id]` - Update specific todo (user-scoped)
- `DELETE /api/todos/[id]` - Delete specific todo (user-scoped)

## Security Notes

- No Row Level Security (RLS) is used - security is handled at the API level
- All todo operations are filtered by `user_id` to ensure users only access their own data
- Phone numbers must be numeric only (simple validation)
- Sessions are stored in HTTP-only cookies to prevent XSS attacks

## Usage

1. **First Time Users**: Go to `/auth/sign-up` to create an account
2. **Returning Users**: Go to `/auth/login` to sign in
3. **Main App**: Once authenticated, users can manage their todos on the home page
4. **Logout**: Click the logout button in the navbar to end the session

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000` (or next available port).

## Phone Number Format

- Phone numbers should contain only digits (0-9)
- No special formatting, spaces, or country codes required
- Example: `1234567890` instead of `(123) 456-7890`

This simple authentication system is perfect for internal tools, prototypes, or applications where you want minimal friction for users while still maintaining basic security.
