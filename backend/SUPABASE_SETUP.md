# Supabase Database Setup Instructions

## Step 1: Get Your Database Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/xmvdjtlyfazgudrmaojr
2. Go to **Settings** > **Database**
3. Find your **Database Password** (you created this when setting up the project)
4. Copy the connection string or password

## Step 2: Update DATABASE_URL

In your `.env` file, replace `[YOUR_DB_PASSWORD]` with your actual password:

```
DATABASE_URL=postgresql://postgres.xmvdjtlyfazgudrmaojr:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Step 3: Set Up Database Tables

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy the entire contents of `setup-supabase.sql` 
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

## Step 4: Test the Connection

Run these commands in the backend directory:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Test database connection
npx prisma db pull

# Start the server
npm run dev
```

## Step 5: Verify Everything Works

1. Open: http://localhost:4000/kyc-form.html
2. Submit a KYC form
3. Check your Supabase dashboard > **Table Editor** > **TouristIdentity** to see the data

## What This Setup Does:

✅ **Creates TouristIdentity table** with all required columns  
✅ **Adds indexes** for fast queries on wallet addresses and anchor hashes  
✅ **Sets up unique constraints** for wallet + trip combinations  
✅ **Enables auto-updating timestamps** for createdAt/updatedAt  
✅ **Generates CUID-like IDs** compatible with Prisma  
✅ **Configures Row Level Security** (optional security layer)  

Your KYC data will now be stored in Supabase and anchored to the blockchain!
