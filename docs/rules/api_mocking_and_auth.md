# API Mocking and Isolation

**Trigger:** Rental Properties Feature Design (2026-04-17)

## Context
Building frontend features against an isolated mock API without modifying the core mock data directly from the UI.

## Axiom
The core mock data array must remain unmodified and isolated from the UI components. Mock data should be served via a Vite dev server middleware (e.g., `/api/properties`). Frontend code must fetch data over HTTP. The UI only filters the fetched responses locally. Additionally, requests to the mock API must include the custom authentication header `X-Trore-Auth: v1-alpha`.