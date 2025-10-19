# Image Processor 265

## Overview

Image Processor 265 is a professional web-based image processing utility that enables users to upload, transform, and download images with various processing options. The application supports JPG, PNG, and WebP formats and provides features including format conversion, resizing with aspect ratio control, and background removal. Built with a modern tech stack, it emphasizes workflow clarity and real-time visual feedback through a clean, dark-mode interface inspired by Linear and Figma's technical aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with hot module replacement
- Wouter for lightweight client-side routing
- React Query (@tanstack/react-query) for server state management and API interactions

**UI Component System:**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme system supporting dark mode with electric blue accents (#00D9FF)
- Form handling via React Hook Form with Zod validation resolvers

**State Management:**
- Local component state for UI interactions (file uploads, processing controls)
- React Query for caching and synchronizing server-processed images
- File handling through browser File API and Blob URLs for image previews

**Design System:**
- Typography: Inter font family from Google Fonts
- Color palette: Dark mode foundation (HSL-based) with electric blue primary accent
- Spacing: Tailwind's standardized units (2, 4, 6, 8, 12, 16)
- Layout: Responsive two-column grid (40% controls / 60% preview on desktop)

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and middleware handling
- TypeScript throughout for consistency with frontend
- Custom logging middleware for API request tracking

**Image Processing Pipeline:**
- Multer for multipart form data and file upload handling
- Sharp library for high-performance image transformations (resize, format conversion)
- File system-based storage with automatic cleanup of processed files (30-minute TTL)

**API Design:**
- RESTful endpoint structure (`/api/process` for image processing)
- FormData-based uploads with JSON-encoded processing options
- Streaming binary responses for processed images
- File size limits (10MB max) and MIME type validation

**File Management:**
- Temporary storage in `/uploads` and `/outputs` directories
- Unique filename generation using timestamps and random suffixes
- Automatic cleanup mechanism to prevent disk space accumulation

### Data Storage Solutions

**Current Implementation:**
- In-memory storage via `MemStorage` class for user data (if authentication is added)
- File system storage for uploaded and processed images
- No persistent database currently configured

**Database Configuration:**
- Drizzle ORM configured for PostgreSQL integration
- Schema defined in `shared/schema.ts` for potential future use
- Connection via Neon Database serverless driver (@neondatabase/serverless)
- Migration system configured through drizzle-kit

### Authentication & Authorization

**Current State:**
- No authentication system currently implemented
- User schema defined in shared types (username-based)
- Session management infrastructure in place (connect-pg-simple for future use)

**Prepared Infrastructure:**
- User model with ID and username fields
- Storage interface ready for user CRUD operations
- Session store configuration for Express sessions

### Design Patterns

**Validation & Type Safety:**
- Zod schemas for runtime validation of image processing options
- Shared types between frontend and backend via `@shared` alias
- Drizzle-zod integration for database schema validation

**Error Handling:**
- Custom error middleware with status code and message extraction
- Client-side toast notifications for user feedback
- File type and size validation before processing

**Code Organization:**
- Monorepo structure with clear separation: `client/`, `server/`, `shared/`
- Path aliases for clean imports (@/, @shared/, @assets/)
- Modular component architecture with separation of concerns

## External Dependencies

### Third-Party Services

**Potential Integration Points:**
- Neon Database: PostgreSQL serverless database (configured but not actively used)
- Google Fonts: Inter font family for typography

### Core Libraries

**Image Processing:**
- Sharp: High-performance Node.js image processing library for transformations

**UI Framework:**
- Radix UI: Headless component primitives for accessibility
- Tailwind CSS: Utility-first CSS framework
- Lucide React: Icon library

**Backend Services:**
- Express.js: Web application framework
- Multer: File upload middleware

**Development Tools:**
- TypeScript: Type safety across full stack
- Drizzle ORM: Type-safe database toolkit
- Vite: Build tool with Replit-specific plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)

### Database Schema

**Configured (Not Currently Active):**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for migrations and queries
- Schema location: `shared/schema.ts`
- Migration output: `./migrations` directory

### API Integrations

**Image Processing API:**
- Endpoint: `POST /api/process`
- Accepts: `multipart/form-data` with image file and JSON options
- Returns: Binary image data as Blob
- Processing options: format conversion, width/height, aspect ratio maintenance, background removal