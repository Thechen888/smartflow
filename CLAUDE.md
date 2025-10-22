# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server on port 8080
- `pnpm build` - Build for production
- `pnpm build:dev` - Build for development
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Project Architecture

This is a React + TypeScript application using Vite as the build tool, focused on industrial communication protocol configuration. The application is designed around a multi-step wizard interface for configuring industrial protocols.

### Core Structure

- **Entry Point**: `src/App.tsx` - Contains React Router setup with QueryClient and TooltipProvider
- **Main Page**: Routes to `IndustrialConfig` component (both `/` and `/industrial-config`)
- **Configuration Wizard**: 4-step process in `IndustrialConfig.tsx`:
  1. 节点配置 (Node Configuration)
  2. 输入点位 (Input Points)
  3. 输出点位 (Output Points)  
  4. 变量逻辑 (Variable Logic)

### Component Organization

```
src/components/
├── industrial/           # Main industrial protocol components
│   ├── NodeConfig.tsx           # Node configuration management
│   ├── InputPointConfig.tsx     # Input point configuration
│   ├── OutputPointConfig.tsx    # Output point configuration
│   ├── VariableLogicConfig.tsx  # Variable logic configuration
│   ├── nodes/                   # Protocol-specific node forms
│   ├── input-points/            # Protocol-specific input forms
│   ├── output-points/           # Protocol-specific output forms
│   └── variable-logic/          # Variable logic sub-components
└── ui/                   # shadcn/ui components
```

### Supported Protocols

The application supports these industrial communication protocols:
- **MODBUS**: TCP/RTU (both Client and Server)
- **IEC104**: Client/Server
- **IEC61850**: Client/Server  
- **DLT645**: RTU/TCP

### Key Libraries

- **UI Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner for toasts

### Special Configuration

- **Path Aliases**: `@/*` maps to `./src/*`
- **Development Server**: Runs on `::` (all interfaces) port 8080
- **TypeScript**: Configured with relaxed settings (no implicit any warnings, unused variables allowed)
- **ESLint**: React hooks and refresh plugins enabled, unused vars disabled

### Development Notes

- Uses pnpm as package manager
- Includes Dyad component tagger plugin for development
- All components should use shadcn/ui patterns
- Industrial components are organized by protocol type
- The main configuration flow is wizard-based with step validation