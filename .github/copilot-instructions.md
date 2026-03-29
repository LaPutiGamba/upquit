# UpQuit Architecture & Coding Guidelines

You are an expert full-stack developer working on the "UpQuit" project, a multitenant Micro-SaaS built with a Node.js backend and a React Native (Expo) frontend.

Whenever you generate, refactor, or suggest code, you MUST strictly adhere to the architectural boundaries and folder structures defined below.

## 1. Backend Architecture (Node.js)
The backend strictly follows Hexagonal Architecture combined with Domain-Driven Design (DDD) principles. The logic is separated into three distinct layers.

### Folder Structure
Each module (e.g., `boards`, `requests`, `users`) must follow this internal structure:

```text
src/modules/[module-name]/
├── application/             # Application Use Cases
│   ├── commands/            # Write operations
│   ├── queries/             # Read operations
│   ├── exceptions/          # Use-case specific errors (e.g., RequestNotFoundException)
│   ├── CommandHandler.ts    
│   └── QueryHandler.ts      
├── domain/                  # Enterprise Business Rules
│   ├── contracts/           # Interfaces (e.g., Repository interfaces)
│   ├── exceptions/          # Business rule violations (e.g., GiveToGetRequirementNotMetException)
│   ├── value-objects/       
│   └── domain-entities.ts   
└── infrastructure/          # Frameworks, Drivers, and Implementations
    ├── repositories/        # Drizzle ORM implementations
    ├── exceptions/          # Technical errors (e.g., DatabaseConnectionException)
    └── Controller.ts        # Express route handlers

src/shared/                  # Cross-module backend code
└── infrastructure/
    └── middlewares/
        └── ErrorHandler.ts  # Express global error middleware
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
apps/frontend/src/
├── app/                     # Expo Router file-system routing (Screens only)
│   ├── (auth)/
│   ├── board/[slug]/
│   └── index.tsx
├── features/                # Screaming Architecture Modules
│   ├── authentication/
│   ├── boards/              # Everything related to Boards
│   │   ├── components/      # UI specific to boards (e.g., BoardHeader)
│   │   ├── hooks/           # Custom hooks (e.g., useBoardData)
│   │   ├── services/        # API calls to the backend
│   │   └── store/           # Local state management for this feature
│   ├── requests/            # Everything related to Feature Requests
│   └── give-to-get/         # Give-to-Get specific UI and logic
└── shared/                  # Shared/Core cross-feature elements
    ├── components/          # Generic UI (Button, Card, Input)
    ├── lib/                 # Utilities, API client (Axios/Fetch setup)
    └── theme/               # Colors, typography, spacing
```

### Frontend Rules:
- **Feature Isolation:** A feature module (e.g., `requests`) should not import directly from the internal folders of another feature. If sharing is necessary, move it to `shared/` or expose a public `index.ts` for the feature.
- **Routing (Expo Router):** The `app/` folder must remain as thin as possible. Screens inside `app/` should merely import and render complex components from the `features/` directory.
- **Data Fetching:** API calls must be encapsulated in the `services/` or `hooks/` folder of the respective feature. Components should not make direct `fetch` or `axios` calls inline.