# Quick Setup Guide

## 🚨 Environment Variables Setup Required

The application is currently showing an error because Supabase environment variables are not configured. Follow these steps to fix it:

### Step 1: Create Environment File

Create a file named `.env.local` in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually takes 1-2 minutes)
3. Go to **Settings** → **API** in your Supabase dashboard
4. Copy the following values:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon public** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Add these URLs to **Site URL**:
   - `http://localhost:3000` (for development)
3. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### Step 4: Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Test the Application

1. Visit `http://localhost:3000`
2. Try to register with an email from allowed domains:
   - `@nic.gov.in`
   - `@police.gov.in` 
   - `@gmail.com`
3. Test the OTP functionality

## 🔧 Troubleshooting

### If you still get errors:

1. **Check file location**: Make sure `.env.local` is in the root directory (same level as `package.json`)
2. **Restart server**: Always restart the development server after adding environment variables
3. **Check Supabase project**: Make sure your Supabase project is fully initialized
4. **Verify URLs**: Double-check that the Supabase URL and key are correct

### Example `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MjQwMCwiZXhwIjoyMDE0MzM4NDAwfQ.example-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Next Steps

Once the environment variables are set up:

1. The application will load without errors
2. You can test the authentication system
3. The dashboard will be accessible after login
4. You can customize the application further

## 📞 Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Verify your Supabase project is active
3. Make sure all environment variables are correctly set
4. Restart the development server
