import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to mock the API
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use('/api/properties', (req, res) => {
      const authHeader = req.headers['x-trore-auth'];
      if (authHeader !== 'v1-alpha') {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        { id: 1, title: 'Downtown Studio', price: 1200, location: 'City Center' },
        { id: 2, title: 'Suburban 2BR', price: 1800, location: 'North Hills' },
        { id: 3, title: 'Luxury Loft', price: 2500, location: 'West End' },
        { id: 4, title: 'Cozy 1BR', price: 950, location: 'East Side' }
      ]));
    });
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
})
