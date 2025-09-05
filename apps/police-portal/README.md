# Police Department Portal

A secure web application for police department management with domain-restricted authentication and blockchain integration.

## Features

- 🔐 **Domain-Restricted Authentication**: Only allows login from authorized domains (nic.gov.in, police.gov.in, gmail.com)
- 📧 **OTP Email Verification**: Secure OTP-based authentication via Supabase
- 🛡️ **Secure Dashboard**: Protected police management interface
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- 🔒 **Real Authentication**: Full Supabase integration for production use
- ⛓️ **Blockchain Integration**: Unique blockchain IDs for police officers

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your Supabase credentials
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Database Setup

Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor to set up the blockchain integration.

## Security

- Domain restrictions prevent unauthorized access
- All authentication is handled securely through Supabase
- Row Level Security (RLS) policies protect data
- Session management with automatic logout
