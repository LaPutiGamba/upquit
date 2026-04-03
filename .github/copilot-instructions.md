# UpQuit Architecture & Coding Guidelines

You are an expert full-stack developer working on the "UpQuit" project, a multitenant Micro-SaaS built with a Node.js backend and a React Native (Expo) frontend.

Whenever you generate, refactor, or suggest code, you MUST strictly adhere to the architectural boundaries and folder structures defined below.

## 1. Backend Architecture (Node.js)

The backend strictly follows Hexagonal Architecture combined with Domain-Driven Design (DDD) principles. The logic is separated into three distinct layers.

### Folder Structure

Each module (e.g., `boards`, `requests`, `users`) must follow this internal structure:

```text
src/modules/[module-name]/
├── application/                    # Application Use Cases
│   ├── commands/                   # Write operations
│   ├── queries/                    # Read operations
│   ├── exceptions/                 # Use-case specific errors (e.g., RequestNotFoundException)
│   └── handlers/
│       ├── Example1CommandHandler.ts
│       ├── Example2CommandHandler.ts
│       ├── Example1QueryHandler.ts
│       └── Example2QueryHandler.ts
├── domain/                         # Enterprise Business Rules
│   ├── contracts/                  # Interfaces (e.g., Repository interfaces)
│   ├── exceptions/                 # Business rule violations (e.g., GiveToGetRequirementNotMetException)
│   ├── value-objects/
│   └── entities/                   # Core domain entities (e.g., Board, Request, User)
└── infrastructure/                 # Frameworks, Drivers, and Implementations
    ├── repositories/               # Drizzle ORM implementations
    ├── exceptions/                 # Technical errors (e.g., DatabaseConnectionException)
    └── controllers/
        ├── Example2Controller.ts
        └── Example1Controller.ts

src/shared/                         # Cross-module backend code
└── infrastructure/
    └── middlewares/
        └── ErrorHandler.ts         # Express global error middleware
```

### Backend Rules:

- **Domain Layer:** Must have ZERO dependencies on external frameworks (no Express, no Drizzle ORM). It only contains pure TypeScript classes, types, and interfaces.
- **Application Layer:** Orchestrates domain objects to execute use cases. It depends on the Domain layer but NEVER on the Infrastructure layer. It uses contracts (interfaces) to interact with the database.
- **Infrastructure Layer:** The only place where Drizzle ORM, Express, and WebSockets (ws) are allowed. Controllers extract HTTP requests and pass them to Command/Query handlers.
- **Exception Handling:** Never throw generic Error objects.
  - Throw **Domain Exceptions** when a business rule is violated (e.g., invalid vote count).
  - Throw **Application Exceptions** when a use case fails (e.g., entity not found).
  - The Infrastructure layer must use a centralized `ErrorHandler.ts` middleware in Express to catch these custom exception classes and map them to appropriate HTTP status codes (400, 404, 500).

## 2. Frontend Architecture (React Native / Expo)

The frontend follows a Modular (Screaming) Architecture. Instead of grouping files by technical type (e.g., all components together, all screens together), files are grouped by feature, so the architecture "screams" what the application does.

### Folder Structure

```text
apps/frontend/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Route groups (e.g., login, register)
│   ├── board/[slug]/        # Dynamic routing for boards
│   ├── layout.tsx           # Global/Nested layouts
│   └── page.tsx             # Server Component entry points
├── features/                # Screaming Architecture Modules
│   ├── authentication/
│   ├── boards/              # Everything related to Boards
│   │   ├── components/      # UI specific to boards (e.g., BoardHeader)
│   │   ├── hooks/           # Custom hooks (e.g., useBoardData)
│   │   ├── services/        # API calls and Server Actions
│   │   └── store/           # Local state management for this feature
│   ├── requests/            # Everything related to Feature Requests
│   └── give-to-get/         # Give-to-Get specific UI and logic
└── shared/                  # Shared/Core cross-feature elements
    ├── components/          # Generic UI
    │   └── ui/              # shadcn/ui base components (Button, Card, Dialog)
    ├── lib/                 # Utilities (e.g., cn() for Tailwind), API client
    └── hooks/               # Generic shared hooks across the app
```

### Frontend Rules:

- **Feature Isolation:** A feature module (e.g., requests) should not import directly from the internal folders of another feature. If sharing is necessary, move it to shared/ or expose a public index.ts for the feature.
- **Routing (Next.js App Router):** The app/ folder must remain as thin as possible. Pages inside app/ should primarily handle routing, layout, and server-side data fetching. They should merely import and render complex components from the features/ directory.
- **Server vs. Client Components:** Default to Server Components (page.tsx, layout.tsx) for maximum performance and SEO. Add the "use client" directive only at the top of feature components that require interactivity (hooks, states, event listeners).
- **Data Fetching:** API calls must be encapsulated in the services/ or hooks/ folder of the respective feature. Utilize Next.js standard fetch for Server Components or Server Actions for mutations. Client components should not make direct fetch or axios calls without passing through a feature service or a data-fetching hook (like React Query/SWR if implemented).
- **Styling & UI:** Use Tailwind CSS for styling. For standard elements, use shadcn/ui components located in shared/components/ui. Always combine Tailwind classes using the custom cn() utility function found in shared/lib/utils to avoid class conflicts.
