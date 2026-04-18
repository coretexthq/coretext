import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockProperties = [
  { id: 1, title: 'Sunny Studio in Downtown', price: 1200, district: 'D1' },
  { id: 2, title: 'Modern 1BR with Balcony', price: 1500, district: 'D2' },
  { id: 3, title: 'Spacious 2BR Family Home', price: 2200, district: 'D1' },
  { id: 4, title: 'Cozy Loft near Station', price: 1100, district: 'D3' }
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use('/api/properties', (req, res, next) => {
          if (req.url === '/' || req.url === '/api/properties') {
            if (req.headers['x-trore-auth'] !== 'v1-alpha') {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Unauthorized' }));
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mockProperties));
            return;
          }
          next();
        });
        server.middlewares.use('/api/saved-searches', (req, res, next) => {
          if (req.method === 'POST') {
            if (req.headers['x-trore-auth'] !== 'v1-alpha') {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Unauthorized' }));
              return;
            }
            
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            
            req.on('end', () => {
              try {
                const parsedBody = JSON.parse(body);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, savedFilters: parsedBody }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
})
