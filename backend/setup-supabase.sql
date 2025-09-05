-- Supabase Database Setup for Tourist KYC System
-- Run this in your Supabase SQL Editor

-- Create the tourist_identity table
CREATE TABLE IF NOT EXISTS "TouristIdentity" (
    "id" TEXT NOT NULL,
    "subjectAddr" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "didUri" TEXT NOT NULL,
    "anchorHash" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "registerTx" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encPIIRef" TEXT NOT NULL,
    "contactsMin" TEXT NOT NULL,
    "fullName" TEXT,
    "destination" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "TouristIdentity_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for wallet + trip combination
CREATE UNIQUE INDEX IF NOT EXISTS "TouristIdentity_subjectAddr_tripId_key" 
ON "TouristIdentity"("subjectAddr", "tripId");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "TouristIdentity_anchorHash_idx" ON "TouristIdentity"("anchorHash");
CREATE INDEX IF NOT EXISTS "TouristIdentity_subjectAddr_idx" ON "TouristIdentity"("subjectAddr");

-- Enable Row Level Security (optional but recommended)
ALTER TABLE "TouristIdentity" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on TouristIdentity" ON "TouristIdentity"
    FOR ALL USING (true) WITH CHECK (true);

-- Create a function to generate CUID-like IDs (Prisma compatibility)
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
    RETURN 'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24);
END;
$$ LANGUAGE plpgsql;

-- Set default value for id column to use our CUID function
ALTER TABLE "TouristIdentity" ALTER COLUMN "id" SET DEFAULT generate_cuid();

-- Create a trigger to automatically update the updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tourist_identity_updated_at
    BEFORE UPDATE ON "TouristIdentity"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'TouristIdentity'
ORDER BY ordinal_position;
