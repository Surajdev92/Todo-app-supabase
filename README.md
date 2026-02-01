# Todo App

A modern Todo application built with React, TypeScript, and Supabase.

## Features

- ✅ User authentication (email + password)
- ✅ Create, read, update, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Filter todos (All, Active, Completed)
- ✅ Row Level Security (RLS) for data protection
- ✅ Modern UI with Tailwind CSS and shadcn/ui
- ✅ Real-time updates with Supabase Realtime (optional)

## Tech Stack

### Frontend

- **React 18** with Vite
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **React Router DOM** for routing
- **TanStack React Query** for server state management
- **React Hook Form** + **Zod** for forms and validation

### Backend

- **Supabase** (PostgreSQL database)
- **Supabase Auth** for authentication
- **Row Level Security (RLS)** for authorization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to your project settings and copy your project URL and anon key
   - Create a `.env` file in the root directory:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up the database**

   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create todos table
   CREATE TABLE todos (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     title TEXT NOT NULL,
     completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   -- Create policy: Users can only see their own todos
   CREATE POLICY "Users can view their own todos"
     ON todos FOR SELECT
     USING (auth.uid() = user_id);

   -- Create policy: Users can insert their own todos
   CREATE POLICY "Users can insert their own todos"
     ON todos FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Create policy: Users can update their own todos
   CREATE POLICY "Users can update their own todos"
     ON todos FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);

   -- Create policy: Users can delete their own todos
   CREATE POLICY "Users can delete their own todos"
     ON todos FOR DELETE
     USING (auth.uid() = user_id);

   -- Optional: Enable Realtime
   ALTER PUBLICATION supabase_realtime ADD TABLE todos;
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
todo-app/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (AuthContext)
│   ├── lib/             # Utilities and Supabase client
│   ├── pages/           # Page components (Login, Signup, Todos)
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── public/
├── .env                 # Environment variables (not in git)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run docs:serve` - View OpenAPI documentation in browser (interactive)
- `npm run docs:build` - Generate static HTML documentation file

## Database Schema

### `todos` table

| Column     | Type      | Description               |
| ---------- | --------- | ------------------------- |
| id         | UUID      | Primary key               |
| user_id    | UUID      | Foreign key to auth.users |
| title      | TEXT      | Todo title                |
| completed  | BOOLEAN   | Completion status         |
| created_at | TIMESTAMP | Creation timestamp        |

## API Documentation

The backend API is documented using OpenAPI 3.0 specification. The complete API documentation is available in `openapi.yaml`.

### Viewing the API Documentation

You can view the API documentation using tools like:

- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://github.com/Redocly/redoc)
- [Postman](https://www.postman.com/) (import the OpenAPI file)

### API Endpoints

The API provides the following endpoints:

**Authentication:**

- `POST /auth/v1/signup` - Create a new user account
- `POST /auth/v1/token` - Sign in and get access token
- `POST /auth/v1/logout` - Sign out

**Todos:**

- `GET /rest/v1/todos` - List all todos for the authenticated user
- `POST /rest/v1/todos` - Create a new todo
- `GET /rest/v1/todos/{id}` - Get a specific todo
- `PATCH /rest/v1/todos/{id}` - Update a todo
- `DELETE /rest/v1/todos/{id}` - Delete a todo

All todo endpoints require authentication via Bearer token in the Authorization header.

## Security

- **Row Level Security (RLS)** ensures users can only access their own todos
- All database operations are authenticated through Supabase Auth
- Environment variables are used for sensitive configuration

## License

MIT
