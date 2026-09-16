# FarmDirect - Fresh Farm Investment Platform

A production-ready farm investment platform built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and Resend.

## Features

- **Public Marketing Site**: Home, How It Works, Terms, Privacy, Risk Disclosure, Contact
- **Investment Calculator**: Live share calculator with real-time projections
- **Google OAuth Authentication**: Supabase Auth with role-based access (USER/ADMIN)
- **User Dashboard**: Portfolio overview, holdings, payout history, notifications, profile
- **Admin Dashboard**: User management, payment verification, daily payout console, bank details, audit log
- **Email Notifications**: Resend integration for all transactional emails
- **Secure File Upload**: Supabase Storage for payment screenshots
- **Row Level Security**: Database-level access control

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- Supabase account
- Resend account (for emails)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAILS=admin@yourdomain.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` or apply the schema from `prisma/schema.prisma`
3. Enable Google OAuth in Supabase Auth settings
4. Create a storage bucket named `payment-screenshots` (private)
5. Set up RLS policies as defined in the migration

### Installation

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run development server
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Creating Admin User

1. Sign in with Google OAuth
2. In Supabase dashboard, go to Table Editor > users
3. Find your user record and change `role` from `USER` to `ADMIN`
4. Or run this SQL:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
   ```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public marketing pages
│   │   ├── page.tsx       # Home page
│   │   ├── how-it-works/  # Investment calculator
│   │   ├── terms/         # Terms & Conditions
│   │   ├── privacy/       # Privacy Policy
│   │   ├── risk-disclosure/
│   │   └── contact/       # Contact form
│   ├── (auth)/            # Authentication routes
│   │   └── login/
│   ├── (dashboard)/       # Protected user routes
│   │   ├── page.tsx       # Overview
│   │   ├── buy-shares/    # Purchase shares
│   │   ├── portfolio/     # Holdings
│   │   ├── payouts/       # Payout history
│   │   ├── notifications/
│   │   └── profile/
│   ├── (admin)/           # Protected admin routes
│   │   ├── page.tsx       # Admin overview
│   │   ├── users/         # User directory
│   │   ├── verification/  # Payment verification queue
│   │   ├── payouts/       # Daily payout console
│   │   ├── bank-details/  # Bank account management
│   │   └── audit/         # Audit log
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── calculator/        # ShareCalculator component
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── emails/            # Email templates
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── auth/              # Auth utilities
│   ├── calculations/      # Investment math (server-side)
│   ├── email/             # Resend + templates
│   └── utils/             # Helpers (currency, validation)
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## Investment Model

- **1 Share = ₹10,000**
- **Daily Return**: 1% of invested amount (₹100 per share/day)
- **Payout Days**: Weekdays only (Monday-Friday)
- **Total Period**: 249 weekdays (~1 calendar year)
- **Total Return per Share**: ₹24,900
- **Each purchase creates a new holding** with its own 249-day cycle

## Key Security Features

- All monetary calculations done server-side
- RLS policies on all database tables
- Input validation with Zod schemas
- Signed URLs for file uploads
- Admin-only routes protected server-side
- Audit logging for all admin actions

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Connect repository
2. Build command: `bun run build`
3. Output directory: `.next`
3. Add environment variables
4. Deploy

## License

MIT License - see LICENSE file for details.

## Support

For questions, email: farmdirect.ind@gmail.com