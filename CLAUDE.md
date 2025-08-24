# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The App Cloner is an AI-powered full-stack application that converts app screenshots into production-ready code. It uses computer vision and GPT-4 Vision API to analyze UI components, detect platforms, and generate complete application code with backend APIs and database schemas.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, React 19
- **UI Components**: Shadcn/ui with Tailwind CSS for modern, accessible design
- **Authentication**: NextAuth.js with Prisma adapter for Google, GitHub, Email providers
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **State Management**: Zustand for client-side state with persistence
- **AI Integration**: OpenAI GPT-4 Vision API for screenshot analysis
- **File Handling**: React Dropzone, Multer, Sharp for image processing

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend functionality
│   ├── auth/              # Authentication pages
│   ├── create/            # Project creation page
│   └── dashboard/         # Project management dashboard
├── components/            # React components
│   ├── ui/               # Shadcn/ui base components
│   ├── auth/             # Authentication components
│   ├── upload/           # File upload components
│   ├── analysis/         # AI analysis display components
│   └── layout/           # Layout and navigation components
├── lib/                   # Utility libraries and configurations
│   ├── auth.ts           # NextAuth.js configuration
│   ├── db.ts             # Prisma client instance
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Common utility functions
└── types/                # TypeScript type definitions
    └── index.ts          # All application types
```

## Development Commands

### Core Development
```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check   # Note: Add this script if needed
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply database migrations
npx prisma migrate dev --name [migration_name]

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio for database GUI
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

### Code Quality
```bash
# Run ESLint
pnpm lint

# Run ESLint with auto-fix
pnpm lint --fix
```

## Key Features Implementation

### 1. Screenshot Analysis Pipeline
- **Upload Processing**: React Dropzone handles drag-and-drop with validation
- **Image Analysis**: GPT-4 Vision API processes screenshots for UI component detection
- **Platform Detection**: Custom algorithms identify React Native, Flutter, Web, Native patterns
- **Component Extraction**: AI identifies buttons, inputs, layouts, navigation patterns

### 2. Code Generation System
- **Template Engine**: Framework-specific code templates for React, React Native, Flutter
- **Full-Stack Generation**: Creates frontend components, API routes, database schemas
- **Project Structure**: Generates complete project with package.json, deployment configs
- **Best Practices**: Generated code follows modern development patterns

### 3. State Management Architecture
```typescript
// Zustand store structure
interface AppState {
  currentProject: Project | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisProgress: number;
  projects: Project[];
}
```

### 4. Database Schema
Key models include:
- **User**: Authentication and project ownership
- **Project**: Core project metadata and status
- **UploadedImage**: File storage and preview data
- **Analysis**: AI analysis results with component data
- **GeneratedCode**: Code generation results and files

## Environment Configuration

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/appcloner"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Component Patterns

### Authentication
- **AuthProvider**: Wraps app with NextAuth.js session provider
- **SignInButton**: Standardized sign-in component
- **UserMenu**: Dropdown menu with user actions
- **Protected Routes**: Check authentication status before rendering

### File Upload
- **ImageUpload**: Drag-and-drop interface with preview and validation
- **Progress Tracking**: Real-time upload progress with error handling
- **File Validation**: Type checking, size limits, format validation

### State Updates
Always use Zustand store methods for state updates:
```typescript
// Good
const { setCurrentProject, addProject } = useAppStore();

// Update project status
updateProject(projectId, { status: 'analyzing' });
```

## API Route Patterns

### Structure
```typescript
// API route example
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Process request
    const result = await processData(data);
    
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Development Guidelines

### Type Safety
- All API responses use `ApiResponse<T>` interface
- Components use proper TypeScript props interfaces
- Database operations use Prisma generated types

### Error Handling
- Use try-catch blocks in API routes
- Display user-friendly error messages via toast notifications
- Log detailed errors for debugging

### Performance
- Use React.memo for expensive components
- Implement proper loading states during async operations
- Optimize image processing with Sharp library

## Testing Strategy

### Test Coverage Priority
1. **API Routes**: Authentication, file upload, analysis endpoints
2. **Components**: Upload interface, authentication flows
3. **State Management**: Zustand store actions and selectors
4. **Database**: Prisma schema validation and queries

### Running Tests
```bash
# Add these scripts to package.json if implementing tests
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
pnpm test:e2e    # End-to-end tests
```

## Deployment

### Prerequisites
- PostgreSQL database (Vercel Postgres, Railway, etc.)
- OpenAI API key with GPT-4 Vision access
- OAuth provider credentials (Google, GitHub)

### Production Checklist
- [ ] Set all environment variables
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Build and deploy: `pnpm build`
- [ ] Verify authentication providers work with production URLs
- [ ] Test file upload functionality
- [ ] Monitor API rate limits (OpenAI)

## Extension Points

### Adding New Platforms
1. Update `PlatformType` and `FrameworkType` enums in types
2. Add platform detection logic in analysis algorithms
3. Create code generation templates for new platform
4. Update UI components to support new platform options

### Custom Analysis Features
1. Extend `AnalysisResult` interface with new data
2. Update GPT-4 Vision prompts for additional analysis
3. Modify analysis dashboard to display new insights
4. Add corresponding database schema changes

This architecture supports rapid iteration and scaling while maintaining type safety and modern development practices.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
