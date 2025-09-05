# Blockchain Integration Setup Guide

## Step 1: Set Up Database Schema

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content from `supabase-schema.sql`**
4. **Click "Run" to execute the schema**

This will create:
- `blockchain_profiles` table for storing blockchain IDs and wallet addresses
- `police_officers` table for officer information
- `cases` table for case management with blockchain integration
- Automatic triggers to create officer profiles when users register
- Row Level Security (RLS) policies for data protection

## Step 2: Verify Tables Created

1. **Go to Table Editor in Supabase**
2. **You should see these new tables:**
   - `blockchain_profiles`
   - `police_officers` 
   - `cases`

## Step 3: Test the Integration

1. **Register a new user** at `/auth/register`
2. **Check the `police_officers` table** - a record should be automatically created
3. **Check the `blockchain_profiles` table** - a blockchain ID should be generated
4. **Login and go to `/dashboard/users`** to see the user with their blockchain ID

## Step 4: Features Available

### Dashboard Features:
- **Blockchain Statistics**: Total and verified blockchain IDs
- **User Management**: View all officers with their blockchain IDs
- **Copy Functionality**: Click to copy blockchain IDs and wallet addresses
- **Search & Filter**: Find users by name, email, badge number, or blockchain ID

### Database Features:
- **Automatic Blockchain ID Generation**: Each user gets a unique blockchain ID
- **Wallet Address Generation**: Mock Ethereum wallet addresses
- **Verification Status**: Track which blockchain IDs are verified
- **Case Integration**: Link cases to blockchain IDs for evidence tracking

## Step 5: Customize Blockchain Integration

### Modify Blockchain ID Format:
Edit the schema in `supabase-schema.sql`:
```sql
-- Change this line in the sample data section:
'BLOCKCHAIN_' || SUBSTRING(u.id::TEXT, 1, 8) || '_' || EXTRACT(EPOCH FROM NOW())::TEXT
```

### Add Real Blockchain Integration:
1. **Replace mock wallet addresses** with real blockchain wallet integration
2. **Add blockchain verification** using smart contracts
3. **Implement evidence hashing** for case files
4. **Add transaction tracking** for audit trails

## Step 6: Admin Features

### Manual User Management:
1. **Go to Supabase → Authentication → Users**
2. **Click on any user to view/edit their profile**
3. **Go to Table Editor → `blockchain_profiles`** to manage blockchain IDs
4. **Go to Table Editor → `police_officers`** to manage officer information

### Bulk Operations:
- **Update verification status** for multiple users
- **Generate new blockchain IDs** for existing users
- **Export user data** with blockchain information

## Troubleshooting

### If tables don't appear:
1. **Check SQL Editor for errors**
2. **Ensure you have proper permissions**
3. **Try running the schema in smaller chunks**

### If blockchain IDs aren't generated:
1. **Check the trigger function** in SQL Editor
2. **Verify the trigger is attached** to auth.users table
3. **Manually run the sample data insertion**

### If users page shows no data:
1. **Check RLS policies** are correctly set
2. **Verify user authentication** is working
3. **Check browser console** for API errors

## Next Steps

1. **Customize blockchain ID format** for your needs
2. **Integrate with real blockchain networks** (Ethereum, Polygon, etc.)
3. **Add smart contract verification**
4. **Implement evidence file hashing**
5. **Add audit trail functionality**

The system is now ready to manage police officers with blockchain IDs! 🚔⛓️
