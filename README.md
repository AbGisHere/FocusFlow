# FocusFlow

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Status](https://img.shields.io/badge/status-development-orange)

> A lightweight productivity dashboard to manage tasks and calendar events in one place.

---

## 💡 About the Project

**FocusFlow** is designed to solve **“keeping tasks and events organized without juggling multiple tools”** for **students, indie builders, and busy professionals**.

Currently, users have to **track todos in one app and events in another (or rely on scattered notes)**. FocusFlow simplifies that workflow by **combining a task list + upcoming events + a quick dashboard view, all behind Google sign-in**.

### Key Features (Planned)

- [x] **User Authentication:** Secure Google OAuth via Better Auth.
- [x] **Dashboard:** At-a-glance stats for tasks and upcoming events.
- [x] **Task Management:** Create tasks with priority, due date, and status.
- [ ] **Calendar Experience:** Improve events UI into a full calendar view (month/week/day).
- [ ] **Reminders & Notifications:** Optional reminders for due tasks and upcoming events.

A modern productivity dashboard built with Next.js 15, TypeScript, and Better Auth.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Better Auth with Google OAuth
- **Icons**: Lucide React

## Features

- 🎯 Task management with priorities and due dates
- 📅 Calendar events scheduling
- 🔐 Secure Google OAuth authentication
- 📊 Dashboard with statistics and insights
- 🎨 Modern, responsive UI with Tailwind CSS
- 🚀 Production-ready with proper error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd focusflow
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Better Auth Configuration
BETTER_AUTH_SECRET="YOUR-SECRET-HERE"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Configuration
AUTH_GOOGLE_ID="YOUR-GOOGLE-CLIENT-ID"
AUTH_GOOGLE_SECRET="YOUR-GOOGLE-CLIENT-SECRET"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # Better Auth endpoints
│   ├── dashboard/        # Protected dashboard pages
│   ├── sign-in/          # Authentication page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client config
│   └── prisma.ts        # Prisma client
└── types/               # TypeScript type definitions

prisma/
└── schema.prisma        # Database schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env` file

## Supabase Setup

1. Create a new Supabase project
2. Go to Settings > Database
3. Copy the connection string to your `.env` file
4. Run `npx prisma db push` to create tables

## Deployment

### Environment Variables for Production

Update these URLs for production:

```env
BETTER_AUTH_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
