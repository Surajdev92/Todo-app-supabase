# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Supabase

1. Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Get your Supabase credentials:

   **Step-by-step:**
   - Go to [supabase.com](https://supabase.com) and sign in
   - Select your project (or create a new one if you don't have one)
   - In the left sidebar, click on **Settings** (gear icon)
   - Click on **API** in the settings menu
   - You'll see two important values:

     **Project URL:**
     - Look for "Project URL" or "API URL"
     - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
     - Copy this entire URL

     **Anon/Public Key:**
     - Look for "anon public" or "Project API keys"
     - Under "Project API keys", find the "anon" or "public" key
     - It's a long string that starts with `eyJ...`
     - Click the copy icon or select and copy this key

   **Visual Guide:**

   ```
   Supabase Dashboard
   ├── Settings (gear icon in sidebar)
   │   └── API
   │       ├── Project URL: https://xxxxx.supabase.co
   │       └── Project API keys
   │           └── anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 3. Set Up Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script

This will:

- Create the `todos` table
- Enable Row Level Security (RLS)
- Create RLS policies to ensure users can only access their own todos

## 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 5. Test the Application

1. Navigate to the app in your browser
2. Click "Sign up" to create a new account
3. After signing up, you'll be redirected to the todos page
4. Start adding todos!

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure your `.env` file exists and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the development server after creating/updating the `.env` file

### Database errors

- Make sure you've run the SQL setup script in Supabase
- Verify that RLS policies are enabled in your Supabase dashboard

### Authentication issues

- Check that email authentication is enabled in Supabase (Settings > Authentication > Providers)
- Verify your Supabase project URL and anon key are correct
