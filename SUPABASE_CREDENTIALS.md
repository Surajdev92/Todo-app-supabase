# How to Get Supabase Credentials

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign in to your account

2. **Select or Create a Project**
   - If you have a project, click on it
   - If you don't have one, click "New Project" and create one

3. **Navigate to API Settings**
   - In the left sidebar, click on **Settings** (⚙️ gear icon)
   - Click on **API** in the settings menu

4. **Copy Your Credentials**

   You'll see a page with your API configuration. Look for:

   ### Project URL
   - **Location**: At the top, labeled "Project URL" or "API URL"
   - **Format**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Action**: Click the copy button (📋) next to it, or select and copy manually

   ### API Keys
   - **Location**: Under "Project API keys" section
   - **What to copy**: The **anon public** key (not the service_role key!)
   - **Format**: A long JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Action**: Click the copy button (📋) next to "anon public"

## Important Notes

⚠️ **Security Warning:**
- Only use the **anon public** key in your frontend code
- **Never** expose the `service_role` key - it has admin privileges
- The anon key is safe for frontend use because Row Level Security (RLS) protects your data

## Example .env File

After copying your credentials, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.your-actual-key-here
```

Replace:
- `your-project-ref` with your actual project reference
- The long key string with your actual anon public key

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
│                                         │
│  [Projects] [Settings] [SQL Editor] ... │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Settings > API                  │ │
│  │                                  │ │
│  │  Project URL                     │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ https://xxxxx.supabase.co  │  │ │
│  │  │                    [Copy]  │  │ │
│  │  └─────────────────────────────┘  │ │
│  │                                  │ │
│  │  Project API keys                │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ anon public                  │  │ │
│  │  │ eyJhbGciOiJIUzI1NiIsInR5c... │  │ │
│  │  │                    [Copy]  │  │ │
│  │  └─────────────────────────────┘  │ │
│  │                                  │ │
│  │  service_role (secret)           │  │
│  │  [Don't copy this one!]          │  │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Troubleshooting

**Can't find the API settings?**
- Make sure you're logged in
- Ensure you've selected a project (not just on the projects list page)
- The Settings icon is in the left sidebar, usually near the bottom

**Don't have a project?**
1. Click "New Project" in the Supabase dashboard
2. Fill in your project details (name, database password, region)
3. Wait for the project to be created (takes a few minutes)
4. Then follow the steps above to get your credentials
