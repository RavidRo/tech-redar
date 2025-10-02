# Project Structure

## Root Level

```
├── backend/           # FastAPI Python backend
├── frontend/          # React TypeScript frontend
├── docker-compose.yml # Multi-service development setup
├── Taskfile.yml       # Task runner configuration
└── .kiro/            # Kiro AI assistant configuration
```

## Backend Structure (`backend/`)

```
backend/
├── tech_radar/           # Main application package
│   ├── __init__.py
│   ├── main.py          # FastAPI app entry point & lifespan
│   ├── models.py        # Beanie document models
│   ├── settings.py      # Pydantic settings configuration
│   └── routes/          # API route modules
│       ├── ping.py      # Health check endpoint
│       └── technologies.py # Technology CRUD operations
├── tests/               # Test suite
│   ├── conftest.py     # Pytest configuration & fixtures
│   ├── test_models.py  # Model validation tests
│   ├── test_setup.py   # Application setup tests
│   └── routes/         # Route-specific tests
│       └── technologies/ # Technology endpoint tests
├── pyproject.toml      # Poetry dependencies & tool config
└── Dockerfile          # Container configuration
```

## Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # React entry point
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── libraries/      # Utility libraries (API, etc.)
│   └── assets/         # Static assets
├── public/             # Public static files
├── package.json        # NPM dependencies & scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
├── eslint.config.js    # ESLint rules
└── Dockerfile          # Container configuration
```

## Key Architectural Patterns

### Backend Patterns

-   **Document-based Models**: Beanie ODM with MongoDB for flexible schema
-   **Router Organization**: Separate route modules by domain (technologies, ping)
-   **Async/Await**: Full async pattern throughout the application
-   **Settings Management**: Centralized configuration with pydantic-settings
-   **Lifespan Management**: Database initialization in FastAPI lifespan context

### Frontend Patterns

-   **Component Organization**: Separate folders for components, hooks, and libraries
-   **State Management**: Zustand for global state, React Query for server state
-   **Type Safety**: Full TypeScript with Zod for runtime validation
-   **API Layer**: Centralized API functions in `libraries/api/`
-   **Custom Hooks**: Reusable logic in dedicated hook files

### Testing Structure

-   **Backend**: pytest with async support, mongomock for database mocking
-   **Route Testing**: Dedicated test files per route module
-   **Model Testing**: Separate validation and business logic tests
-   **Fixtures**: Centralized test configuration in conftest.py

### Configuration Files

-   **Backend**: `pyproject.toml` for dependencies, linting, and testing config
-   **Frontend**: Multiple TypeScript configs for different build targets
-   **Docker**: Multi-service setup with MongoDB and mongo-express
-   **Tasks**: Centralized command definitions in Taskfile.yml
