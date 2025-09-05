# Complete Supabase Setup Guide

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### 1.2 Create New Project
1. Once logged in, click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `police-portal` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait for setup to complete (usually 1-2 minutes)

## Step 2: Get Your Credentials

### 2.1 Access Project Settings
1. In your Supabase dashboard, click the **Settings** icon (gear) in the left sidebar
2. Click **"API"** from the settings menu

### 2.2 Copy Your Credentials
You'll see two important values:

**Project URL** (looks like):
```
https://abcdefghijklmnop.supabase.co
```

**anon public key** (long string starting with `eyJ`):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MjQwMCwiZXhwIjoyMDE0MzM4NDAwfQ.example-key-here
```

## Step 3: Configure Your Application

### 3.1 Create Environment File
Run this command in your project directory:
```bash
npm run setup
```

Or manually create a file named `.env.local` in your project root.

### 3.2 Add Your Credentials
Open `.env.local` and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace:**
- `https://your-actual-project-url.supabase.co` with your Project URL
- `your-actual-anon-key-here` with your anon public key

## Step 4: Configure Authentication

### 4.1 Set Up Site URL
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. In the **Site URL** field, add:
   ```
   http://localhost:3000
   ```
3. Click **"Save"**

### 4.2 Add Redirect URLs
1. In the same Authentication Settings page
2. In **Redirect URLs** section, add:
   ```
   http://localhost:3000/auth/callback
   ```
3. Click **"Save"**

### 4.3 Configure Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the templates if desired
3. The default templates work fine for testing

## Step 5: Test Your Setup

### 5.1 Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 5.2 Check Status
1. Visit `http://localhost:3000`
2. You should see a **green status box** saying "Supabase Configured"
3. If you see red, check your environment variables

### 5.3 Test Registration
1. Go to `/auth/register`
2. Try registering with an email from allowed domains:
   - `yourname@nic.gov.in`
   - `yourname@police.gov.in`
   - `yourname@gmail.com`
3. Check your email for verification link

### 5.4 Test Login
1. Go to `/auth/login`
2. Use your registered email and password
3. Or try the OTP login feature

## Step 6: Production Setup (When Ready)

### 6.1 Update Environment Variables
For production, update your environment variables:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 6.2 Update Supabase Settings
1. Add your production domain to **Site URL**
2. Add production callback URL to **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   ```

## Troubleshooting

### Common Issues:

**1. "Supabase Not Configured" Error**
- Check that `.env.local` exists and has correct values
- Restart your development server
- Verify the URL and key are copied correctly

**2. "Invalid API Key" Error**
- Double-check your anon key is correct
- Make sure there are no extra spaces or characters

**3. "Site URL not allowed" Error**
- Add `http://localhost:3000` to Site URL in Supabase
- Add `http://localhost:3000/auth/callback` to Redirect URLs

**4. Email Not Sending**
- Check your email spam folder
- Verify email templates are enabled in Supabase
- Check Supabase logs for errors

### Getting Help:
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- View your project logs in Supabase dashboard
- Check browser console for error messages

## Security Notes

- Never commit `.env.local` to version control
- Use strong database passwords
- Regularly rotate your API keys
- Monitor your Supabase usage and billing
