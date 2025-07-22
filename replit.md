# SQL Assistant - Natural Language to SQL Converter

## Overview

This application is a comprehensive SQL Assistant that converts natural language queries into SQL using AI. It's built as a full-stack web application with a React frontend and Express backend, featuring real-time WebSocket communication for interactive query generation and execution.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket server for live query generation
- **AI Integration**: OpenAI GPT-4o for SQL generation and explanation

### Database Schema
The application uses a PostgreSQL database with the following key tables:
- `users`: User profiles and authentication data
- `database_schemas`: User-defined database schemas for query generation
- `queries`: Generated SQL queries with metadata
- `shared_queries`: Shareable query links
- `sessions`: Session management for user authentication

## Key Components

### Chat Interface
- Natural language input with AI-powered SQL generation
- Real-time WebSocket communication for streaming responses
- Support for multiple SQL dialects (MySQL, PostgreSQL, SQLite, SQL Server)
- Interactive SQL code blocks with execution capabilities

### Query Management
- Query history with search and filtering
- Favorites system for frequently used queries
- Query sharing with temporary links
- Export functionality for query results

### Schema Management
- Custom database schema definition and storage
- Schema-aware query generation
- Support for multiple database dialects
- Visual schema representation

### Data Visualization
- Chart generation from query results
- Multiple chart types (bar, line, pie, etc.)
- Interactive data exploration
- Export capabilities for visualizations

## Data Flow

1. **User Input**: Natural language query entered through chat interface
2. **WebSocket Communication**: Query sent to backend via WebSocket
3. **AI Processing**: OpenAI GPT-4o processes the query with schema context
4. **SQL Generation**: Generated SQL returned with explanation
5. **Query Execution**: Optional execution against simulated database
6. **Result Display**: Results shown in interactive table/chart format
7. **Persistence**: Queries saved to database for history and sharing

## External Dependencies

### Core Dependencies
- **OpenAI API**: For natural language to SQL conversion
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle ORM**: Type-safe database access

### Development Dependencies
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Vite development server for frontend hot reload
- tsx for TypeScript execution in development
- WebSocket server runs alongside Express server

### Production Build
- Vite builds optimized frontend bundle
- ESBuild bundles backend with external dependencies
- Single Node.js process serves both frontend and API
- Database migrations handled via Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `NODE_ENV`: Environment mode (development/production)

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 07, 2025. Korean localization implemented with Oracle database optimization
  - Updated interface language to Korean for better user experience
  - Set Oracle as default database dialect
  - Added Oracle-specific SQL formatting and syntax support
  - Enhanced sample queries with Korean language examples
  - Optimized AI prompts for Oracle database features
  - Removed database selection from main screen and top bar for cleaner UX
  - Updated OpenAI service to generate SQL explanations in Korean language
  - Fixed duplicate message issue when executing queries - results now show inline only
  - Enhanced query execution flow to prevent redundant assistant messages
  - Fixed query results disappearing when asking additional questions - results now persist permanently
  - Implemented persistent query result storage using Map-based caching system
  - Enhanced SQL formatter with comprehensive formatting options and improved UX
  - Added smart formatting with intelligent indentation and keyword placement
  - Implemented color palette interface for keyword customization (12 color options)
  - Restructured formatter layout from 3-column to efficient 2-column design
  - Added real-time format statistics (line count, character count, SQL clauses)
  - Transformed SQL formatter into system-wide settings management interface
  - Added tabbed interface with 4 sections: Basic, Advanced, Colors, Presets
  - Implemented 8 advanced formatting options (comment preservation, column alignment, etc.)
  - Added 3 preset styles (Oracle, PostgreSQL, Compact) with one-click application
  - Integrated localStorage persistence for settings with unsaved changes detection
  - Created modal dialog for SQL formatting testing with current settings
  - Implemented system-wide SQL formatting with centralized formatting engine
  - Applied consistent formatting across all SQL display components
  - Created centralized formatting utility (sqlFormatter.ts) with localStorage persistence
  - Updated SQLCodeBlock, message bubbles, query cards to use unified formatting
  - Ensured all SQL queries display with user's custom formatting preferences
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Primary language: Korean interface preferred for ease of use.
Primary database: Oracle database - optimize for Oracle-specific syntax and features.
```