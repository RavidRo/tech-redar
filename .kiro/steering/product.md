# Product Overview

Tech Radar 380 is a technology assessment and tracking application that helps organizations manage their technology adoption lifecycle. The application allows teams to categorize technologies into different stages (Hold, Assess, Trial, Adopt) and track their evolution over time.

## Key Features

-   **Technology Management**: Add, edit, and delete technologies with detailed metadata
-   **Stage Tracking**: Categorize technologies into adoption stages (Hold, Assess, Trial, Adopt)
-   **Category Organization**: Group technologies by type (Observability, Development Tools, Frameworks, Data Management)
-   **Historical Tracking**: Maintain history of stage transitions with ADR links and discovery dates
-   **Tag System**: Flexible tagging for cross-cutting technology concerns
-   **Interactive UI**: Modern React-based interface with Ant Design components

## Architecture

The application follows a modern full-stack architecture:

-   **Backend**: FastAPI with MongoDB for data persistence
-   **Frontend**: React with TypeScript and Vite for development
-   **Database**: MongoDB with Beanie ODM for document modeling
-   **Deployment**: Docker Compose for local development and containerization
