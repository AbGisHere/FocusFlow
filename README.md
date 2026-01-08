# FocusFlow

![Version](https://img.shields.io/badge/version-0.5.0-green.svg)
![Status](https://img.shields.io/badge/status-under%20development-yellow.svg)

> A modern productivity dashboard to manage tasks and calendar events in one place.

🔗 **Live Demo:** [https://FocusFlow-AbG.vercel.app](https://FocusFlow-AbG.vercel.app)

---

## 💡 About the Project

**FocusFlow** is designed to solve **"keeping tasks and events organized without juggling multiple tools"** for **students, indie builders, and busy professionals**.

Currently, users have to **track todos in one app and events in another (or rely on scattered notes)**. FocusFlow simplifies that workflow by **combining a task list + upcoming events + a quick dashboard view, all behind Google sign-in**.

### ✨ Key Features

- [x] **User Authentication:** Secure Google OAuth via Better Auth
- [x] **Dashboard:** At-a-glance stats for tasks and upcoming events
- [x] **Task Management:** Create tasks with priority, due date, and status
- [x] **Kanban Board:** Three-column task organization (Pending, In Progress, Completed)
- [x] **Real-time Updates:** Instant task status changes with dropdown menus
- [x] **Dark/Light Theme:** Complete theme support with automatic switching
- [x] **Responsive Design:** Works perfectly on desktop, tablet, and mobile
- [x] **Modern UI:** Beautiful green-themed hover states and transitions
- [x] **Calendar Experience**: Full calendar view with month/week/day options
- [x] **Subject Management**: Create and organize subjects with custom colors
- [x] **Expandable Subject Views**: Click subjects to see related tasks and events
- [x] **In-line Task Status Updates**: Change task status directly from subject view
- [x] **Glassmorphism Design**: Modern frosted glass effects throughout UI
- [x] **Enhanced Task Display**: Shows due dates, priority badges, and status indicators
- [x] **Event Integration**: View all events related to specific subjects
- [ ] **Reminders & Notifications:** Optional reminders for due tasks and upcoming events

A modern productivity dashboard built with Next.js 15, TypeScript, and Better Auth.

## 🚀 What's New in v0.5.0

### Major Features
- **📚 Subject Management System**: Create and organize subjects with custom colors
- **🔍 Expandable Subject Views**: Click any subject to see all related tasks and events
- **⚡ In-line Task Status Updates**: Change task status directly from subject view with dropdown menus
- **🎨 Glassmorphism Design**: Modern frosted glass effects throughout the UI
- **📋 Enhanced Task Display**: Shows due dates, priority badges, and status indicators
- **📅 Event Integration**: View all events related to specific subjects

### UI/UX Enhancements
- **Frosted Glass Effects**: Beautiful backdrop blur effects on headers and content containers
- **Improved Dropdown Menus**: Fixed visibility issues with portal-based dropdowns
- **Better Visual Hierarchy**: Clear separation between containers and content items
- **Enhanced Color Coding**: Consistent status indicators and priority badges
- **Smooth Animations**: Improved transitions and hover effects throughout

### Subject Tab Features
- **Expandable Cards**: Click subjects to reveal related tasks and events
- **Real-time Status Updates**: Change task status without leaving the subject view
- **Due Date Display**: See task due dates directly in the expanded view
- **Priority Badges**: Visual priority indicators (High/Medium/Low)
- **Event Integration**: View all events associated with each subject
- **Smart Caching**: Efficient data loading with caching for better performance

### Technical Improvements
- **Portal-based Dropdowns**: Fixed dropdown visibility issues across all containers
- **Enhanced State Management**: Improved caching and data flow
- **Better Error Handling**: More robust API error management
- **Performance Optimizations**: Reduced unnecessary re-renders and API calls
- **Type Safety**: Enhanced TypeScript interfaces for better development experience

## 🚀 What's New in v0.4.0

### Major Improvements
- **🎨 Enhanced UI Components**: Refined form inputs and buttons with consistent green theme
- **🔒 Improved Authentication Flow**: Better session management and error handling
- **📅 Calendar Integration**: Seamless event management with the task system
- **🌓 Theme Refinements**: Better contrast and accessibility in both light and dark modes
- **✨ UI Polish**: Consistent styling across all interactive elements
- **� Responsive Improvements**: Better mobile experience for forms and dropdowns

### UI/UX Enhancements
- **Form Inputs**: Consistent styling for all form elements with green focus states
- **Dropdown Menus**: Improved frosted glass effect matching the header
- **Button States**: Hover and active states refined for better feedback
- **Accessibility**: Improved contrast ratios and focus indicators
- **Loading States**: Smoother transitions and better visual feedback

### Technical Improvements
- **Code Quality**: Improved component organization and reusability
- **Performance**: Optimized re-renders and state management
- **Dependencies**: Updated to latest stable versions
- **Type Safety**: Enhanced TypeScript types and interfaces

### UI/UX Enhancements
- **Green Hover Effects**: All interactive elements use brand-consistent green colors
- **Task Cards**: Redesigned with inline priority badges and better layout
- **Profile Dropdown**: Theme-aware styling with green hover states
- **Navigation**: Improved hover states and visual feedback
- **Loading States**: Better error handling and loading indicators

### Technical Improvements
- **Authentication**: Fixed server-side session validation
- **API Optimization**: Proper credential handling for all API calls
- **Theme System**: Resolved SSR hydration issues
- **Version Management**: Centralized version system from package.json
- **Code Quality**: Better error handling and logging

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Better Auth with Google OAuth
- **Icons**: Lucide React
- **State Management**: React Hooks with proper SSR handling

## 🌟 Features

### Task Management
- 🎯 **Create Tasks**: Add tasks with title, description, priority, and due dates
- � **Priority Levels**: High (Red), Medium (Yellow), Low (Green) color coding
- 🔄 **Status Management**: Pending, In Progress, Completed with visual indicators
- � **Kanban Board**: Three-column drag-and-drop ready layout
- ⚡ **Real-time Updates**: Instant status changes via dropdown menus

### Dashboard
- 📈 **Statistics**: Total tasks, completed, in-progress, and upcoming events
- 🎨 **Visual Cards**: Beautiful card-based layout with proper theming
- � **Live Updates**: Dashboard reflects real-time task changes
- 📱 **Responsive**: Works perfectly on all device sizes

### User Experience
- 🌙 **Dark/Light Theme**: Automatic system preference detection
- 🎨 **Brand Consistency**: Green-themed hover states throughout
- 📱 **Mobile First**: Responsive design for all screen sizes
- ⚡ **Fast Performance**: Optimized loading and interactions
- 🛡️ **Secure**: Google OAuth with proper session management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### 1. Clone and Install

```bash
git clone https://github.com/AbGisHere/FocusFlow.git
cd FocusFlow
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

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Better Auth endpoints
│   │   ├── tasks/        # Task management API
│   │   ├── events/       # Events API
│   │   └── subjects/     # Subject management API
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── page.tsx      # Main dashboard
│   │   ├── tasks/        # Kanban task board
│   │   ├── subjects/     # Subject management with expandable views
│   │   └── layout.tsx    # Dashboard layout
│   ├── sign-in/          # Authentication page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   ├── theme-toggle.tsx  # Theme switcher
│   ├── profile-dropdown.tsx # User profile menu
│   └── frosted-header.tsx # Header component
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth client config
│   ├── prisma.ts        # Prisma client
│   └── version.ts       # Centralized version management
└── contexts/             # React contexts
    └── theme-context.tsx # Theme management

prisma/
└── schema.prisma        # Database schema
```

## 🎮 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env` file

## 🗄️ Supabase Setup

1. Create a new Supabase project
2. Go to Settings > Database
3. Copy the connection string to your `.env` file
4. Run `npx prisma db push` to create tables

## 🚀 Deployment

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

## 🎨 Theme System

FocusFlow features a comprehensive theme system:

- **Light Mode**: Clean, bright interface with proper contrast
- **Dark Mode**: Easy-on-the-eyes dark theme
- **System Preference**: Automatically detects user's OS preference
- **Green Branding**: Consistent green hover states throughout
- **Smooth Transitions**: Elegant animations and hover effects

## 📋 Task Status System

### Status Types
- **🔴 Pending** (TODO): New tasks that need attention
- **🟡 In Progress** (IN_PROGRESS): Currently being worked on
- **🟢 Completed** (DONE): Finished tasks

### Priority Levels
- **🔴 High**: Urgent tasks requiring immediate attention
- **🟡 Medium**: Normal priority tasks
- **🟢 Low**: Lower priority tasks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Use TypeScript strictly
- Ensure proper error handling
- Test in both light and dark themes
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) for the excellent authentication solution
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Prisma](https://prisma.io) for the modern ORM
- [Supabase](https://supabase.com) for the backend-as-a-service platform

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/AbGisHere">Abhishek Gupta</a></p>
  <p>⭐ If you like this project, please give it a star!</p>
</div>
