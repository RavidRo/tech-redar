# Technology Stack

## Backend

-   **Framework**: FastAPI (>=0.118.0)
-   **Language**: Python 3.11 (strict version requirement)
-   **Database**: MongoDB with Beanie ODM (^2.0.0)
-   **Validation**: Pydantic v2 (^2.11.9) with pydantic-settings
-   **ASGI Server**: Uvicorn with standard extras

## Frontend

-   **Framework**: React 19.1.1 with TypeScript
-   **Build Tool**: Vite 7.1.7
-   **UI Library**: Ant Design (^5.27.4)
-   **State Management**: Zustand (^5.0.8)
-   **Data Fetching**: TanStack React Query (^5.90.1)
-   **Validation**: Zod (^4.1.11)
-   **Notifications**: React Hot Toast, SweetAlert2

## Development Tools

-   **Task Runner**: Task (Taskfile.yml)
-   **Containerization**: Docker & Docker Compose
-   **Backend Linting**: Ruff (>=0.13.2) with strict configuration
-   **Backend Type Checking**: MyPy with strict mode
-   **Frontend Linting**: ESLint 9.x with TypeScript support
-   **Frontend Formatting**: Prettier 3.x
-   **Testing**: pytest with asyncio support, pytest-mock, mongomock-motor

## Common Commands

### Development

```bash
# Start full development environment
task dev

# Run backend only (requires MongoDB)
cd backend && poetry run fastapi dev tech_radar/main.py

# Run frontend only
cd frontend && npm run dev
```

### Testing

```bash
# Run all tests
task test

# Backend tests only
task test:backend

# Backend tests with coverage
task test:backend:cov
```

### Code Quality

```bash
# Format all code
task format

# Lint all code
task lint

# Run full CI pipeline (format + lint + test)
task ci
```

### Docker

```bash
# Start services with hot reload
docker compose up --build

# Start specific service
docker compose up backend
```

## Code Quality Standards

-   **Line Length**: 100 characters (Ruff configuration)
-   **Python Version**: Strict 3.11 requirement
-   **Type Checking**: MyPy strict mode enabled
-   **Import Sorting**: isort with known-first-party configuration
-   **Quote Style**: Double quotes (Ruff format)
-   **Async**: Full async/await pattern with proper typing

## Development Workflow

-   **After Every Change**: Run `task ci` to ensure code quality (format + lint + test)
-   **Before Commits**: All CI checks must pass
-   **Code Reviews**: Focus on business logic, CI handles style and basic quality
-   **Steering Updates**: Update steering documents when adding new dependencies, changing structure, or modifying workflows
