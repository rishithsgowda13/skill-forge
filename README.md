# Skill Forge (mem-drive-ivc)

A modern, full-stack application built with Next.js and Supabase for interactive learning and research.

## Features

- **Authentication**: Secure login and registration powered by Supabase Auth.
- **User Dashboard**: A centralized workspace for users to manage their activities.
- **Interactive Quiz System**:
  - **Admin Panel**: Create and manage quizzes.
  - **Live Hosting**: Host interactive quiz sessions.
  - **Real-time Play**: Participate in quizzes with instant feedback.
- **Secondary Research Tool**: Specialized dashboard for deep-dive research tasks.
- **Dynamic Routing**: Seamless navigation and session management.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:9090`.

## Project Structure

- `src/app`: Next.js pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Supabase clients and utility functions.
- `src/context`: React Context providers for state management.
