# Image Processor 265

## Overview
Image Processor 265 is a professional-grade image processing web application built with a stunning dark mode interface and vibrant electric blue (#00D9FF) accents. The application allows users to upload images, apply various transformations, and download the processed results.

## Features
- **Drag-and-drop Image Upload**: Intuitive upload interface with visual feedback
- **Format Conversion**: Convert between JPG, JPEG, PNG, and WebP formats
- **Image Resizing**: Custom width/height adjustments with aspect ratio locking
- **Background Removal**: Remove image backgrounds (basic implementation)
- **Real-time Preview**: Side-by-side comparison of original and processed images
- **One-click Download**: Download processed images with appropriate file extensions
- **Auto-cleanup**: Automatic deletion of temporary files after 30 minutes of inactivity

## Project Structure

### Frontend (`client/`)
- **pages/home.tsx**: Main application page with upload, processing controls, and preview
- **components/image-upload-zone.tsx**: Drag-and-drop upload component with file validation
- **components/processing-controls.tsx**: Format conversion, resize options, and background removal controls
- **components/image-preview.tsx**: Side-by-side image preview with download functionality
- **index.css**: Dark mode color system with electric blue accents
- **App.tsx**: Main application component with routing

### Backend (`server/`)
- **routes.ts**: Express API routes for image processing
  - POST /api/process - Process uploaded images with Sharp library
  - GET /api/health - Health check endpoint
- **storage.ts**: Minimal storage interface (not used for image processing)

### Shared (`shared/`)
- **schema.ts**: TypeScript types and Zod schemas for image processing options

## Technology Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query
- **Backend**: Express.js, Sharp (image processing), Multer (file uploads)
- **Styling**: Tailwind CSS with custom dark mode theme
- **UI Components**: Shadcn/ui component library

## Design System
- **Primary Color**: Electric Blue (#00D9FF / hsl(191, 100%, 50%))
- **Background**: Deep charcoal (hsl(222, 14%, 8%))
- **Cards**: Elevated surfaces (hsl(222, 10%, 16%))
- **Text**: High contrast white (95% lightness) with secondary and tertiary levels
- **Font**: Inter for clean, technical readability
- **Borders**: Subtle divisions (hsl(222, 8%, 24%))

## File Handling
- **Accepted Formats**: JPG, JPEG, PNG, WebP
- **Maximum File Size**: 10MB
- **Upload Directory**: `/uploads` (auto-created)
- **Output Directory**: `/outputs` (auto-created)
- **Cleanup Interval**: Every 5 minutes
- **File Retention**: 30 minutes

## Image Processing Features

### Format Conversion
- Convert images between JPG, JPEG, PNG, and WebP formats
- Quality setting: 90% for all formats
- Automatic file extension handling

### Resize
- Custom width and height inputs
- Aspect ratio locking (optional)
- Fit mode: 'inside' (proportional scaling) or 'fill' (exact dimensions)

### Background Removal
- Basic background removal using Sharp's alpha channel manipulation
- Flattens image to white background after alpha removal

## Memory Management
- Proper object URL cleanup for original and processed images
- URLs revoked when:
  - Uploading a new image
  - Processing a new version
  - Resetting the form
  - Component unmounts
- Prevents memory leaks in long-running sessions

## Error Handling
- File type validation with user-friendly toast notifications
- File size validation (10MB maximum)
- Processing error feedback
- Download error handling
- Network error recovery

## Recent Changes (October 19, 2025)
- Implemented complete MVP with all core features
- Added dark mode design system with electric blue accents
- Implemented proper object URL cleanup to prevent memory leaks
- Added comprehensive error handling with toast notifications
- Created responsive layout for desktop, tablet, and mobile devices
- Integrated Sharp library for high-quality image processing
- Added automatic cleanup system for temporary files

## User Experience
- Beautiful loading states during image processing
- Success and error toast notifications for all operations
- Responsive design that works flawlessly across all breakpoints
- Smooth transitions and hover effects
- Intuitive drag-and-drop interface
- Clear visual hierarchy with professional design

## Running the Application
The application runs on port 5000 with:
- Express server handling API requests
- Vite dev server for frontend development
- Hot module replacement for rapid development
- Automatic workflow restart on file changes

## API Documentation

### POST /api/process
Process an uploaded image with specified options.

**Request:**
- Content-Type: multipart/form-data
- Fields:
  - `image`: Image file (required)
  - `options`: JSON string with processing options (required)

**Processing Options:**
```typescript
{
  format?: 'jpg' | 'jpeg' | 'png' | 'webp',
  width?: number,
  height?: number,
  maintainAspectRatio?: boolean,
  removeBackground?: boolean
}
```

**Response:**
- Content-Type: image/jpeg | image/png | image/webp
- Body: Processed image blob

**Error Responses:**
- 400: Invalid file type or missing file
- 500: Image processing failed

## Architecture Decisions
- **Horizontal batching**: Built frontend and backend in layers for consistency
- **Schema-first development**: Defined data models before implementation
- **Component modularity**: Reusable components outside of App.tsx
- **Memory safety**: Proper cleanup of object URLs and temporary files
- **User feedback**: Toast notifications for all user actions
- **Responsive design**: Mobile-first approach with desktop enhancements
