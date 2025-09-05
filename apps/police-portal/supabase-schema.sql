-- Police Department Portal Database Schema
-- Run these commands in your Supabase SQL Editor

-- Create blockchain_profiles table
CREATE TABLE IF NOT EXISTS blockchain_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blockchain_id VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255),
  blockchain_type VARCHAR(50) DEFAULT 'ethereum',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create police_officers table (extends user data)
CREATE TABLE IF NOT EXISTS police_officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_number VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  rank VARCHAR(50),
  station VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_officer_id UUID REFERENCES police_officers(id),
  blockchain_id VARCHAR(255) REFERENCES blockchain_profiles(blockchain_id),
  evidence_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE blockchain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policies for blockchain_profiles
CREATE POLICY "Users can view their own blockchain profile" ON blockchain_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own blockchain profile" ON blockchain_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blockchain profile" ON blockchain_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for police_officers
CREATE POLICY "Officers can view their own profile" ON police_officers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Officers can update their own profile" ON police_officers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Officers can insert their own profile" ON police_officers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for cases (officers can view assigned cases)
CREATE POLICY "Officers can view assigned cases" ON cases
  FOR SELECT USING (
    assigned_officer_id IN (
      SELECT id FROM police_officers WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blockchain_profiles_user_id ON blockchain_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_profiles_blockchain_id ON blockchain_profiles(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_police_officers_user_id ON police_officers(user_id);
CREATE INDEX IF NOT EXISTS idx_police_officers_badge_number ON police_officers(badge_number);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_officer ON cases(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- Create function to automatically create police_officer record on user signup
CREATE OR REPLACE FUNCTION create_police_officer_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO police_officers (user_id, badge_number, department, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'badgeNumber', 'TEMP-' || EXTRACT(EPOCH FROM NOW())::TEXT),
    COALESCE(NEW.raw_user_meta_data->>'department', 'unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'officer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create police_officer profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_police_officer_profile();

-- Insert sample data (optional)
INSERT INTO blockchain_profiles (user_id, blockchain_id, wallet_address, blockchain_type, is_verified)
SELECT 
  u.id,
  'BLOCKCHAIN_' || SUBSTRING(u.id::TEXT, 1, 8) || '_' || EXTRACT(EPOCH FROM NOW())::TEXT,
  '0x' || ENCODE(gen_random_bytes(20), 'hex'),
  'ethereum',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM blockchain_profiles bp WHERE bp.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;
