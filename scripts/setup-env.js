const fs = require('fs')
const path = require('path')

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
  console.log('📝 Please update the Supabase credentials in .env.local')
  console.log('🔗 Get your credentials from: https://supabase.com/dashboard')
} else {
  console.log('⚠️  .env.local already exists')
  console.log('📝 Please check if your Supabase credentials are set correctly')
}

console.log('\n📋 Next steps:')
console.log('1. Go to https://supabase.com and create a new project')
console.log('2. Copy your Project URL and anon key from Settings > API')
console.log('3. Update the values in .env.local')
console.log('4. Restart your development server: npm run dev')
