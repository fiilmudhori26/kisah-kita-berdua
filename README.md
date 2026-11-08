# Shared Couple Gallery

Private photo gallery for two people. Built with React, Vite, Tailwind CSS v4, Supabase, and React Router.

## Requirements
- Node.js 20.19+ or 22.12+
- A Supabase project

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase Project URL and **publishable key** to `.env.local`. Find both in Supabase Dashboard → Project Settings → API Keys.

Never put a `service_role` or secret key in a Vite environment variable. `VITE_*` values are exposed to the browser.

## Supabase Auth
In Supabase Dashboard → Authentication → Providers → Email:
- Enable Email provider.
- For quick local testing, email confirmation can be disabled; for production, keep confirmation enabled and configure SMTP.
- Add your deployed domain to Authentication → URL Configuration → Redirect URLs.

The current setup supports email/password sign-in and registration. It does not yet link two users into a shared couple space; that belongs to the next database/RLS phase.

## Scripts
- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Current scope
- Supabase client
- Auth context and protected route
- Login/register page
- Empty authenticated gallery page
- React Router foundation

Photo upload, gallery queries, couple linking, RLS policies, and storage policies are intentionally not implemented in this phase.