# Police Department Portal

A secure web application for police department management with domain-restricted authentication and OTP verification using Supabase.

## Features

- 🔐 **Domain-Restricted Authentication**: Only allows login from authorized domains (nic.gov.in, police.gov.in, gmail.com)
- 📧 **OTP Email Verification**: Secure OTP-based authentication via Supabase
- 🛡️ **Secure Dashboard**: Protected police management interface
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- 🔒 **Real Authentication**: Full Supabase integration for production use

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Supabase Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Add your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### 4. Set up Email Templates (Optional)

For custom OTP emails, go to Authentication > Email Templates in Supabase and customize the templates.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Features

### Domain Restrictions

The application only allows authentication from these domains:
- `nic.gov.in`
- `police.gov.in`
- `gmail.com`

### Authentication Flow

1. **Email/Password Login**: Traditional login for registered users
2. **OTP Login**: Passwordless authentication via email OTP
3. **Domain Validation**: All login attempts are validated against allowed domains
4. **Session Management**: Secure session handling with automatic logout

### Protected Routes

- `/dashboard/*` - Requires authentication
- `/auth/*` - Redirects authenticated users to dashboard

## Project Structure

```
├── app/
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   ├── register/page.tsx   # Registration page
│   │   └── callback/route.ts   # OTP callback handler
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   └── supabase.ts             # Supabase configuration
├── middleware.ts               # Route protection
└── package.json
```

## Usage

### For Users

1. **Access Request**: Visit the registration page to request access
2. **Login**: Use either email/password or OTP authentication
3. **Dashboard**: Access the secure police management interface

### For Administrators

1. **User Management**: Approve/reject access requests in Supabase dashboard
2. **Domain Management**: Modify allowed domains in `lib/supabase.ts`
3. **Security Monitoring**: Monitor authentication logs in Supabase

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Set up environment variables
4. Configure your domain in Supabase

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=your_app_url

# Optional (for custom email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Security Considerations

- All authentication is handled by Supabase with industry-standard security
- Domain restrictions prevent unauthorized access
- All routes are protected with middleware
- Session management is handled securely
- All user activities are logged

## Support

For issues or questions:
1. Check the Supabase documentation
2. Review the Next.js documentation
3. Check the application logs in Supabase dashboard

## License

This project is for authorized police department use only.
