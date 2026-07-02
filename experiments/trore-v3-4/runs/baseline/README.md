# Trore Lodging Marketplace

Trore is a locally runnable, full-stack lodging marketplace prototype for short-term rental discovery and host operations.

## Tech Stack
- **Backend:** Node.js Express Server
- **Database:** SQLite (node:sqlite built-in module)
- **Frontend:** HTML, CSS, JavaScript (Vanilla styling & Outfit typography)

## Local Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize & Seed the Database:**
   This command creates/resets the database schema and seeds it with deterministic data:
   ```bash
   npm run db:reset
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```
   The application will be running on http://localhost:3000.

## Running Tests
Run the built-in automated test suite:
   ```bash
   npm test
   ```
