# FocusFlow

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-live%20%26%20stable-success.svg)

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
- [x] **Drag and Drop:** Move tasks between columns to automatically update status
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
- [x] **Analytics Dashboard**: Complete analytics with study insights and progress tracking
- [x] **Study Session Timer**: Interactive timer with pause/resume and automatic tracking
- [x] **Global Timer with Minimized State**: Continue timing while using other app features
- [x] **Timer Persistence**: Timer state survives page refreshes and browser sessions
- [x] **Draggable Timer**: Position and save minimized timer anywhere on screen
- [x] **Session Records Export**: Download data as CSV or PDF with customizable date ranges
- [x] **Customizable Analytics Table**: Toggle column visibility for personalized data view
- [x] **Auto-Save Settings**: All preferences automatically saved and persisted
- [x] **Reminders & Notifications:** Optional reminders for due tasks and upcoming events

A modern productivity dashboard built with Next.js 15, TypeScript, and Better Auth.

## 🚀 What's New in v0.11.0

### 🎯 Major Features
- **🎵 Background Music System**: Complete ambient sound integration with Supabase storage
  - **5 Audio Tracks**: Rain, Ocean Waves, Forest, Fireplace, and White Noise
  - **Supabase Storage Integration**: Fast, reliable CDN delivery for audio files
  - **Persistent Playback**: Music continues playing across page navigation and timer state changes
  - **Volume Control**: Adjustable volume with visual feedback and mute functionality
  - **Smart Loading**: Loading states and error handling for seamless user experience
  - **Visual Sound Selector**: Beautiful emoji icons and smooth transitions between tracks
  - **Auto-Resume**: Music automatically resumes when returning to the app
  - **Lightweight Repository**: No large audio files in git - uses cloud storage
- **📱 Fully Responsive Layout System**: Complete mobile-to-desktop optimization
  - **Dynamic Container Sizing**: All pages automatically adapt to screen width
  - **No Horizontal Overflow**: Content fits perfectly within viewport boundaries
  - **Responsive Grid Systems**: Smart column adjustments based on screen size
  - **Mobile-First Design**: Optimized for phones, tablets, and desktops
  - **Fluid Width Containers**: Uses full available space instead of fixed constraints
  - **Height Constraints**: Calendar and tasks containers prevent vertical overflow
  - **Scrollable Content**: Proper scrolling for long content within containers
- **🖥️ Enhanced Timer Page Layout**: Improved full-screen timer experience
  - **Smart Layout Switching**: Timer takes full screen when calendar/tasks disabled
  - **2-Column Design**: Timer on left, calendar/tasks on right when enabled
  - **No Overlap Issues**: Proper spacing and container constraints
  - **Responsive Behavior**: Adapts from mobile (stacked) to desktop (side-by-side)
  - **Full Width Utilization**: Maximizes use of available screen real estate
- **⏱️ Improved Mini Timer**: Enhanced draggable timer with better positioning
  - **Viewport Boundary Constraints**: Timer stays within visible screen area
  - **Smart Corner Snapping**: Intuitive positioning with 20px margins
  - **Responsive Hiding**: Timer hidden on full-screen timer page to prevent overlap
  - **Smooth Dragging**: Improved cursor feedback and visual states
  - **Persistent Positioning**: Timer position saved and restored across sessions
  - **Auto-Reposition on Resize**: Timer adjusts position when screen size changes
- **📋 Enhanced Task Cards**: Improved task management interface
  - **Tag Wrapping**: Priority and subject tags wrap to next line when needed
  - **Overflow Prevention**: Task cards prevent content from spilling outside boundaries
  - **Fixed Dropdown Positioning**: Dropdowns appear exactly where clicked, not constrained by containers
  - **Better Visual Hierarchy**: Clear separation between title, tags, and actions
  - **Responsive Design**: Cards adapt to different screen sizes and content lengths
- **🎨 UI/UX Polish**: Comprehensive design improvements
  - **Consistent Spacing**: Unified padding and margins throughout app
  - **Better Visual Hierarchy**: Clear content organization and flow
  - **Smooth Transitions**: Enhanced animations and state changes
  - **Error Boundaries**: Better error handling and user feedback
  - **Loading States**: Consistent loading indicators across all features

### 🔧 Technical Improvements
- **Supabase Integration**: Moved from GitHub Releases to dedicated Supabase storage
- **Performance Optimization**: Reduced bundle size and improved loading times
- **Code Organization**: Better component structure and state management
- **Type Safety**: Enhanced TypeScript types and error handling
- **Accessibility**: Improved ARIA labels and keyboard navigation

## 🚀 What's New in v0.10.0

### 🎯 Major Features
- **📊 Session Records Export System**: Complete data export functionality with multiple formats
  - **CSV Export**: Download study session data as comma-separated values for spreadsheet analysis
  - **PDF Export**: Generate formatted PDF reports with professional layout
  - **Date Range Selection**: Export data for Last Week, Last Month, or All Time
  - **Complete Column Support**: All 13 columns included in exports (Start Time, End Time, Duration, Event, Subject, Tasks Completed, Actions, Study Efficiency, Session Type, Break Duration, Break Amounts, Focus Score, Productivity Rating)
  - **Smart Data Processing**: Automatic task completion counting and duration calculations
  - **Professional File Naming**: Format `focusflow-sessions-{range}-{date}.csv/pdf`
- **⚙️ Enhanced Settings Panel**: Comprehensive session records customization
  - **Column Visibility Controls**: Toggle any of the 13 columns on/off in analytics table
  - **Auto-Save Settings**: All preferences automatically saved to localStorage
  - **Settings Persistence**: Column preferences survive page refreshes and browser sessions
  - **Clean UI Design**: Modern toggle switches with descriptive labels
  - **Organized Categories**: Display Options and Data Management sections
- **📋 Analytics Table Improvements**: Enhanced session records display
  - **Conditional Column Rendering**: Only show columns enabled in settings
  - **Rightmost Action Columns**: Tasks and Actions always positioned as last columns
  - **Horizontal Scrolling**: Smooth scroll when table width exceeds container
  - **Responsive Layout**: Minimum width ensures proper table display
  - **Smart Data Display**: Shows actual values or "N/A" for missing data
- **🎨 Themed Export Controls**: Consistent visual design throughout
  - **Primary Button Styling**: Export buttons match website's primary theme
  - **Loading States**: Visual feedback during export processing
  - **Error Handling**: User-friendly error messages for failed exports
  - **Disabled States**: Prevent multiple simultaneous exports
- **📅 Enhanced Timer Page Layout**: Dynamic responsive layout with conditional calendar and tasks display
  - **Adaptive Grid System**: Timer occupies left half, calendar and tasks stack vertically on right
  - **Settings-Based Visibility**: Toggle calendar and tasks independently via settings panel
  - **Flexible Layouts**: Full-width timer when sidebars hidden, split-view when both visible
  - **Responsive Design**: Optimized for desktop, tablet, and mobile experiences
- **🗓️ Mini Calendar Integration**: Full calendar functionality within timer page
  - **Month Navigation**: Previous/next month controls with smooth transitions
  - **Day Selection**: Click any day to view events and tasks for that date
  - **Event Display**: Subject-colored events with recurring indicators and time display
  - **Task Integration**: Shows both TODO and IN_PROGRESS tasks with colored dots
  - **Visual Indicators**: Blue dots for ongoing tasks, orange dots for pending tasks
  - **Smart Filtering**: Tasks without due dates appear in today's view
  - **Aesthetic Grid**: Compact, properly proportioned calendar with clean design
- **⚡ Interactive Task Management**: Real-time status updates from timer page
  - **Dropdown Controls**: Beautiful status dropdowns with color-coded themes
  - **Subject Preservation**: Tasks maintain subject associations when updated from timer
  - **Instant Updates**: Optimistic UI updates without page refresh delays
  - **Cross-Section Sync**: Status changes reflect in both related tasks and calendar items
  - **API Optimization**: Separate data fetching for active vs. all tasks including completed
  - **Error Handling**: Robust error handling with fallback states
- **🎨 Enhanced Visual Design**: Modern, aesthetic interface matching website style
  - **Color-Coded Status**: Orange for TODO, blue for IN_PROGRESS, green for DONE
  - **Custom Dropdowns**: Styled selects with hover states and custom chevron arrows
  - **Smooth Transitions**: 200ms duration animations for all interactive elements
  - **Consistent Theming**: Matches app's green accent color throughout
  - **Proper Spacing**: Optimized padding and margins for clean layout
  - **Typography**: Improved font weights and sizing for better readability
- **📋 Drag and Drop Task Management**: Interactive Kanban board functionality
  - Drag tasks between columns to automatically update status
  - Optimistic updates for instant UI response
  - Smooth animations matching timer drag behavior
  - Visual feedback with hover states and drop zones

### 📄 Export Features
- **CSV Format**: 
  - Properly formatted with quoted values
  - Compatible with Excel, Google Sheets, and data analysis tools
  - Includes all session metadata and calculated metrics
- **PDF Format**:
  - Landscape orientation for optimal column display
  - Professional layout with title and date range
  - Summary statistics (total sessions, study hours)
  - Paginated table with headers on each page
  - Compact font sizing for maximum data visibility
  - Up to 30 sessions per page with overflow indication

### 🛠 Technical Improvements
- **New API Endpoints**: `/api/export/csv` and `/api/export/pdf`
- **Enhanced Data Fetching**: Optimized queries with proper relationships
- **Type Safety**: Extended interfaces for all export data fields
- **Performance**: Efficient data processing and file generation
- **Dependencies**: Added jsPDF and html2canvas for PDF generation
- **Error Recovery**: Robust error handling with user feedback
- **File Management**: Automatic file download with proper MIME types
- **Enhanced State Management**: Timer context now uses localStorage for persistence
- **Better Time Accuracy**: Improved elapsed time calculations across page refreshes
- **Clean State Cleanup**: Proper localStorage cleanup when timer sessions end
- **Drag System**: Custom drag implementation with mouse event handling
- **Optimistic Updates**: Instant UI updates with background API synchronization
- **Cross-browser Compatibility**: Webkit prefixes and fallbacks for Safari

### 🎯 User Experience
- **Seamless Integration**: Export controls directly in settings panel
- **Instant Feedback**: Loading spinners and status updates
- **Data Privacy**: All processing done client-side with secure API calls
- **Cross-Platform**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Better Auth with Google OAuth
- **Icons**: Lucide React
- **State Management**: React Hooks with proper SSR handling
- **PDF Generation**: jsPDF
- **Canvas Rendering**: html2canvas
- **Export Processing**: Client-side file generation with API integration

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

### Data Export & Analytics
- 📊 **CSV Export**: Download session data for spreadsheet analysis
- 📄 **PDF Export**: Generate professional reports with landscape layout
- 📅 **Date Range Selection**: Export Last Week, Last Month, or All Time
- 📋 **Customizable Tables**: Toggle column visibility in analytics view
- 💾 **Auto-Save Settings**: Preferences automatically saved to localStorage
- 📈 **Complete Analytics**: Study hours, task completion, and progress tracking

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
