import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { ENV } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { verificationRouter } from './routes/verification.routes.js';
import { mfaRouter } from './routes/mfa.routes.js';
import { securityRouter } from './routes/security.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { registerValidatorSocket } from './services/duress.service.js';

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-latitude', 'x-longitude', 'x-jurisdiction-code']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routers
app.use('/api/auth', authRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/mfa', mfaRouter);
app.use('/api/security', securityRouter);
app.use('/api', healthRouter);

// WebSocket Server for Silent Duress Event Bus to Independent Validator
const wss = new WebSocketServer({ server, path: '/ws/duress-bus' });
wss.on('connection', (ws) => {
  registerValidatorSocket(ws);
});

export function startServer(port = ENV.PORT) {
  if (!server.listening) {
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`ℹ️  Server already running on port ${port}. Using active instance.`);
      } else {
        console.error('Server error:', err);
      }
    });
    server.listen(port, () => {
      console.log(`=======================================================`);
      console.log(`🛡️  NYAYAKASHA Backend Authentication Stack Online`);
      console.log(`🚀  HTTP API Server listening on port ${port}`);
      console.log(`📡  WebSocket Duress Event Bus active at /ws/duress-bus`);
      console.log(`=======================================================`);
    });
  }
  return server;
}

// Auto start if executed directly
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  startServer();
}

export { app, server };
