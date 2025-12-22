# Project Structure and TypeScript Configuration

This document outlines the project structure and TypeScript configuration implemented for the Descope Trust Center project.

## Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components (shadcn/ui)
├── lib/
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # Global type definitions
├── App.tsx              # Main React application
├── frontend.tsx         # React entry point
├── index.ts             # Bun server entry point
└── index.html           # HTML template
styles/
└── globals.css          # Global styles with Tailwind CSS
```

## TypeScript Configuration

### Enhanced tsconfig.json

The TypeScript configuration includes:

- **Strict mode** enabled for better type safety
- **Path aliases** configured for clean imports (`@/*`, `@/components/*`, etc.)
- **Modern module resolution** with bundler mode
- **React JSX support** with `react-jsx` transform
- **Comprehensive library support** including DOM and ESNext
- **Type checking optimizations** for better development experience

### Type Declarations

Enhanced `bun-env.d.ts` with declarations for:
- SVG imports
- CSS module imports
- Image file imports (PNG, JPG, GIF, WebP, ICO)
- JSON imports
- Global environment variables

### Global Types

Created `src/types/index.ts` with project-specific types:
- API response types
- HTTP method types
- Component props interfaces
- Theme and environment configuration
- Error handling types
- Form validation types

## Build Configuration

The project uses Bun's build system with:
- **Hot module replacement** in development
- **Production optimizations** with minification
- **Source maps** for debugging
- **Asset handling** for images and styles
- **Tailwind CSS integration** via bun-plugin-tailwind

## Development Workflow

1. **Install dependencies**: `bun install`
2. **Development server**: `bun run dev`
3. **Production build**: `bun run build`
4. **Type checking**: `bun x tsc --noEmit`

## Key Features

- ✅ **TypeScript strict mode** for type safety
- ✅ **Path aliases** for clean imports
- ✅ **Comprehensive type declarations** for all file types
- ✅ **React 19** with latest features
- ✅ **Tailwind CSS v4** with modern styling
- ✅ **shadcn/ui** components integration
- ✅ **Hot module replacement** for development
- ✅ **Production optimizations** for deployment

The project structure and TypeScript configuration provide a solid foundation for building a scalable, type-safe React application with modern tooling.