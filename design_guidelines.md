# Design Guidelines: Image Processor 265

## Design Approach
**System Selected:** Modern Utility Application inspired by Linear and Figma's technical interfaces
**Justification:** This is a utility-focused image processing tool requiring efficiency, clear controls, and professional aesthetics. The design prioritizes workflow clarity and visual feedback over decorative elements.

## Core Design Elements

### A. Color Palette

**Dark Mode Foundation:**
- Background Primary: 222 14% 8% (deep charcoal)
- Background Secondary: 222 12% 12% (elevated surfaces)
- Background Tertiary: 222 10% 16% (cards, panels)
- Border: 222 8% 24% (subtle divisions)

**Electric Blue Accents:**
- Primary: 191 100% 50% (#00D9FF - vibrant electric blue)
- Primary Hover: 191 100% 45%
- Primary Muted: 191 60% 30% (backgrounds, subtle highlights)

**Text & Content:**
- Text Primary: 0 0% 95% (high contrast white)
- Text Secondary: 0 0% 65% (muted labels)
- Text Tertiary: 0 0% 45% (disabled states)

**Status Colors:**
- Success: 142 71% 45% (green for processing complete)
- Warning: 38 92% 50% (amber for validation)
- Error: 0 84% 60% (red for errors)

### B. Typography

**Font Stack:** Inter (Google Fonts) for clean, technical readability
- Heading Primary: 32px / font-bold / tracking-tight
- Heading Secondary: 24px / font-semibold
- Body Large: 16px / font-medium (controls, labels)
- Body: 14px / font-normal (descriptions)
- Caption: 12px / font-normal / text-secondary (hints, metadata)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component gaps: gap-4, gap-6
- Section padding: p-6, p-8
- Container margins: m-4, m-6, m-8

**Grid Structure:**
- Main container: max-w-7xl mx-auto
- Two-column layout for desktop: 40% controls / 60% preview
- Single column stack for mobile (< 768px)

### D. Component Library

**Upload Zone:**
- Large dropzone area (min-h-80) with dashed electric blue border
- Hover state: border-solid with subtle blue glow effect
- Drag-active state: background-primary-muted with pulsing border
- Center-aligned upload icon (cloud upload), heading, and supported formats text

**Control Panel:**
- Grouped sections with clear headings: "Format Conversion", "Resize Options", "Advanced"
- Button group for format selection (JPG, PNG, WebP) using toggle buttons
- Number inputs for width/height with aspect ratio lock toggle
- Prominent "Process Image" button (w-full, electric blue background)
- "Remove Background" as secondary action button

**Preview Area:**
- Side-by-side comparison: Original (left) vs Processed (right)
- Image containers with subtle border and slight background elevation
- Labels "Original" and "Preview" in caption text above each
- Download button pinned to bottom-right of processed preview
- Processing spinner overlay with "Processing..." text during operations

**Status Indicators:**
- Toast notifications for upload success/errors (top-right corner)
- Progress bar with electric blue fill for processing operations
- File info display: filename, dimensions, size in caption text

**Navigation Header:**
- App name "Image Processor 265" in heading secondary size
- Subtle electric blue accent on "265"
- Minimal, clean header with py-4 padding

### E. Interactions & Feedback

**Animations:** Minimal and purposeful only
- Fade-in for preview images (duration-200)
- Slide-up for toast notifications (duration-300)
- Pulse animation for dropzone during drag-active state
- No excessive hover effects or decorative animations

**Button States:**
- Primary buttons: electric blue background, white text, subtle shadow
- Outline buttons on images: backdrop-blur-md with border-white/30
- Disabled state: opacity-50 with cursor-not-allowed

## Responsive Behavior

**Desktop (≥1024px):**
- Two-column layout with controls on left, preview on right
- Full feature visibility with expanded controls

**Tablet (768px - 1023px):**
- Maintain two-column but adjust ratios to 50/50
- Slightly reduced padding (p-6 instead of p-8)

**Mobile (<768px):**
- Single column stack: Upload → Controls → Preview
- Full-width buttons and inputs
- Reduced spacing (p-4) for better mobile efficiency
- Collapsible sections for format/resize options

## Visual Hierarchy

1. Upload zone draws immediate attention (largest visual element)
2. Control panel provides clear workflow progression
3. Preview area shows results with clear before/after context
4. Download action is prominent but only when relevant
5. Status feedback is non-intrusive but visible

**Critical Design Principles:**
- Maintain dark backgrounds consistently across all components
- Use electric blue sparingly for primary actions and highlights only
- Prioritize clarity of controls over visual decoration
- Ensure processing feedback is immediate and clear
- Keep UI clean and technical-feeling for professional credibility