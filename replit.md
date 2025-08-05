# Overview

Rigel is a comprehensive learning management system (LMS) built as a full-stack web application with custom authentication. The platform enables course creation, management, and delivery with distinct user roles for administrators and students. Administrators can create user accounts, upload courses with materials, and manage the learning platform. Students can access enrolled courses and track their progress. The system features the Rigel brand identity with orange and blue color scheme and is designed to provide a seamless educational experience.

# Recent Changes (January 2025)

- **Custom Authentication System**: Replaced Replit Auth with custom username/password authentication
- **Admin Account**: Created initial admin user (username: admin, password: admin123) 
- **User Management**: Admins can create and manage student accounts with custom credentials
- **Course Upload**: Integrated file upload system for educational materials (PDF, DOC, PPT, MP4, MP3)
- **Rigel Branding**: Applied orange (#ff6b35) and blue (#4a90e2) color scheme throughout interface
- **Session Management**: PostgreSQL session storage for authentication persistence

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 using TypeScript and follows a component-based architecture. The application uses Wouter for lightweight client-side routing and TanStack Query (React Query) for server state management and caching. The UI is constructed using shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements.

The styling system uses Tailwind CSS with CSS variables for theming, supporting both light and dark modes. The application implements a custom design system with Rigel brand colors (orange and blue variants) and maintains consistent spacing and typography throughout.

State management is handled through React Query for server state and React's built-in state management for local component state. The application follows a hooks-based pattern for reusable logic, including custom hooks for authentication and mobile detection.

## Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The architecture separates concerns into distinct layers: routing, business logic (storage), database access, and authentication middleware.

The authentication system integrates with Replit's OpenID Connect (OIDC) provider using Passport.js, providing secure user authentication and session management. Sessions are stored in PostgreSQL using connect-pg-simple for persistence across server restarts.

File handling is implemented using Multer middleware with configurable limits and file type validation. The system supports various educational content formats including PDFs, videos, and documents with a 100MB upload limit.

The API design follows REST conventions with proper HTTP status codes and error handling. Request logging middleware provides detailed API usage tracking with response time monitoring.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema supports user management, course creation, enrollment tracking, and progress monitoring.

Key entities include:
- Users with role-based access (admin/student)
- Courses with metadata (title, description, category, level, duration)
- Course materials for file attachments
- Enrollments linking users to courses with progress tracking
- Sessions table for authentication persistence

The schema uses UUID primary keys for security and includes proper relationships with foreign key constraints. Timestamps are automatically managed for audit trails.

## Build and Development System
The project uses Vite as the build tool for fast development and optimized production builds. TypeScript configuration supports path mapping for clean imports and includes both client and server code in type checking.

The development setup includes hot module replacement (HMR) for instant feedback during development. The build process creates separate bundles for client-side and server-side code, with the server bundle using ESBuild for optimal performance.

Environment-specific configurations handle development vs production differences, including database connections and authentication providers.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database provider used for data persistence
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider for user management
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type system for JavaScript
- **ESBuild**: JavaScript bundler for server-side builds
- **Drizzle Kit**: Database migration and schema management tools

## File Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **File Type Validation**: Built-in filtering for educational content formats

## State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form state management with validation

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **class-variance-authority**: Component variant management
- **zod**: Schema validation for forms and API data