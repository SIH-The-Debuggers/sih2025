## Get Correct Supabase Connection String

Since we're having connection issues, let's get the exact connection string from Supabase:

### Step 1: Get Connection String from Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/xmvdjtlyfazgudrmaojr
2. Click **Settings** > **Database** 
3. Scroll down to **Connection string**
4. Select **Nodejs** tab
5. Copy the connection string that looks like:

```
postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### Step 2: Alternative - Use Connection Pooling

Or try the **Session mode** connection:

```
postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

### Step 3: URL Encode Your Password

Your password `Bedinagar@297` needs to be URL-encoded:
- `@` becomes `%40` 
- So: `Bedinagar%40297`

### Step 4: Test Connection

Replace the DATABASE_URL in your `.env` with the exact string from Supabase dashboard.

### Common Supabase Connection Formats:

**Transaction Mode (Port 6543):**
```
postgresql://postgres.xmvdjtlyfazgudrmaojr:Bedinagar%40297@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Session Mode (Port 5432):**
```
postgresql://postgres.xmvdjtlyfazgudrmaojr:Bedinagar%40297@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

**Direct Connection:**
```
postgresql://postgres:Bedinagar%40297@db.xmvdjtlyfazgudrmaojr.supabase.co:5432/postgres
```

Please copy the exact connection string from your Supabase dashboard and update the `.env` file.
