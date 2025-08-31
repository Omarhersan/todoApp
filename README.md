# 📋 AI-Enhanced Todo App

A modern, intelligent todo application built with Next.js 15, featuring AI-powered task enhancement, phone-based authentication, and multi-channel support.

## ✨ Key Features

### 🤖 AI-Powered Task Enhancement
- **Automatic AI enhancement** of all tasks using OpenAI gpt-5-mini
- **Smart title generation** - transforms basic titles into descriptive ones
- **Action step breakdown** - AI generates 3-5 specific, actionable steps for each task
- **Real-time status tracking** with visual indicators (Processing → Enhanced → Failed)
- **Fallback system** with rule-based enhancement when OpenAI is unavailable
- **Multi-source enhancement** - works for web app, external API, and WhatsApp integrations

### 📱 Phone-Based Authentication
- **Simple signup/login** using just phone number (no password required)
- **Session management** with secure HTTP-only cookies
- **User isolation** - each user sees only their own todos
- **7-day session expiration** with automatic cleanup

### 🔌 External API Integration
- **RESTful API** for external systems integration
- **Bearer token authentication** with configurable API keys
- **Multi-source support** (n8n, WhatsApp, and other external systems)
- **CRUD operations** with proper error handling
- **User context** via phone number headers

### 🎨 Modern UI/UX
- **Dark/Light theme** support with system preference detection
- **Responsive design** optimized for all screen sizes
- **Real-time updates** with 2-second polling for enhancement status
- **Visual feedback** including success animations and status badges
- **Enhancement statistics** dashboard
- **Non-blocking UX** - tasks appear instantly while enhancing in background

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom phone-based auth with cookies
- **AI Integration**: OpenAI gpt-5-mini
- **State Management**: React Context API
- **Performance**: Code splitting, dynamic imports, bundle analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase project
- OpenAI API key (optional, for AI enhancement)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=sk-your-openai-api-key (optional)
   N8N_API_KEY=your-n8n-api-key (for external API)
   ```

4. **Setup Supabase Database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Users table
   CREATE TABLE public.users (
     id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
     created_at timestamp with time zone NOT NULL DEFAULT now(),
     name text DEFAULT ''::text,
     phone text,
     CONSTRAINT users_pkey PRIMARY KEY (id)
   );

   -- Todos table
   CREATE TABLE public.todos (
     id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
     created_at timestamp with time zone NOT NULL DEFAULT now(),
     title character varying,
     is_completed boolean DEFAULT false,
     completed_at timestamp with time zone,
     description text,
     user_id bigint REFERENCES public.users(id) ON DELETE CASCADE,
     enhanced_title text,
     steps text[],
     enhancement_status text DEFAULT 'pending',
     source text DEFAULT 'web_app',
     CONSTRAINT todos_pkey PRIMARY KEY (id)
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 API Documentation

### External API Endpoints

All external API requests require:
- `Authorization: Bearer <API_KEY>`
- `x-call-from: <source>` (e.g., "n8n")
- `x-user-phone: <phone_number>`

#### Get All Todos
```http
GET /api/external/todos
```

#### Create Todo
```http
POST /api/external/todos
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description (optional)"
}
```

#### Update Todo
```http
PUT /api/external/todos/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "is_completed": true
}
```

#### Delete Todo
```http
DELETE /api/external/todos/{id}
```

### Internal API Endpoints

- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/handle/{id}` - Update todo
- `DELETE /api/todos/handle/{id}` - Delete todo
- `GET /api/todos/status` - Get enhancement status
- `POST /api/todos/enhance` - Manual enhancement trigger

## 🧠 AI Enhancement System

The AI enhancement system automatically improves todos by:

1. **Analyzing the task title** for context and intent
2. **Generating enhanced titles** that are more descriptive and actionable
3. **Breaking down tasks** into 3-5 specific, actionable steps
4. **Updating status** from "pending" → "done" or "failed"
5. **Providing visual feedback** in the UI with badges and animations

### Enhancement Flow
```
User creates todo → Auto-enhancement triggered → OpenAI processes → 
Database updated → UI shows real-time status → Enhanced content displayed
```

## 🎯 Performance Features

- **Bundle analysis** with `npm run build:analyze`
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Lighthouse performance monitoring**
- **Type checking** with TypeScript strict mode
- **Production builds** optimized for deployment

## 🚀 Deployment

The app is deployment-ready with:

- **Production configuration** in `next.config.ts`
- **Environment variable validation**
- **Build scripts** for production
- **Type checking** and linting
- **Security headers** and compression

### Build Commands
```bash
npm run build:prod     # Production build
npm run start:prod     # Start production server
npm run type-check     # TypeScript validation
npm run lint           # ESLint checking
```

## 🔐 Security Features

- **HTTP-only cookies** for session management
- **Bearer token authentication** for external APIs
- **Input validation** and sanitization
- **SQL injection protection** via Supabase
- **CORS configuration** for API endpoints
- **User isolation** - strict data separation

## 📱 Multi-Platform Support

- **Web Application** - Full-featured React interface
- **External API** - For n8n, Zapier, and other automation tools
- **WhatsApp Integration** - Via external API endpoints
- **Mobile Responsive** - Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - AI enhancement
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
