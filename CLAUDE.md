# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sui:AIdol³ is a web3-based virtual idol discovery platform built with React, TypeScript, and Vite. Users can find their ideal AI-generated idol through personality tests and interactive games, collect photocards, and grow with their chosen idols.

## Essential Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:8080
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Installation
```bash
npm install  # Install dependencies
```

## Architecture Overview

### Core Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations and glass morphism effects
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query) for server state
- **Form Handling**: React Hook Form with Zod validation

### Application Flow

The app follows a "Pick · Vault · Rise" three-phase journey:

1. **PICK Phase** (`/pick` → `/mbti` → `/appearance` → `/worldcup` → `/final-pick`)
   - Gender selection (male/female idols)
   - MBTI personality test
   - Appearance preferences test
   - Tournament-style idol selection
   - Final idol selection from 101 candidates

2. **VAULT Phase** (`/collection`, `/photocard`, `/gallery`)
   - Profile card management
   - Photocard collection and storage
   - Gallery viewing

3. **RISE Phase** (`/progress`, `/growth`)
   - Idol growth tracking
   - Interaction history
   - Achievement system

### Key Architectural Patterns

- **Component Structure**: All UI components are in `src/components/ui/` using shadcn/ui patterns
- **Page Components**: Main pages in `src/pages/` handle routing and business logic
- **Wallet Integration**: Mock wallet connection stored in localStorage (`walletAddress`)
- **Path Aliasing**: `@/` resolves to `./src/` for clean imports
- **Asset Management**: Images stored in `src/assets/`

### TypeScript Configuration

The project uses relaxed TypeScript settings for rapid development:
- `noImplicitAny`: false
- `strictNullChecks`: false
- `noUnusedLocals`: false
- `noUnusedParameters`: false

### Styling Architecture

- Glass morphism design with backdrop blur effects
- Custom gradient utilities defined in Tailwind config
- Animation classes including `animate-float` and `animate-pulse`
- Responsive design with mobile-first approach
- Dark mode support through CSS variables

## Important Implementation Details

### Wallet Connection
The app uses a mock wallet system for development. Real wallet integration (e.g., MetaMask) would replace the mock implementation in `src/pages/Index.tsx`.

### Data Persistence
Currently uses localStorage for:
- Wallet address
- Gender selection
- User preferences and test results

### Navigation Guards
Pages like `/pick` require wallet connection and redirect to home if not connected.

### Image Assets
The app uses pre-loaded image assets for idol faces and UI elements. These are imported as ES modules for optimal bundling.

## Development Server Configuration

Vite is configured to:
- Run on port 8080
- Accept connections from all network interfaces (host: "::")
- Use React SWC plugin for faster HMR
- Include Lovable tagger in development mode

## Code Style Guidelines

- Use existing shadcn/ui components from `src/components/ui/`
- Follow the glass morphism design pattern with `glass-dark` classes
- Use gradient text with `gradient-text` class for emphasis
- Implement smooth transitions with Tailwind's transition utilities
- Keep component files focused and single-responsibility