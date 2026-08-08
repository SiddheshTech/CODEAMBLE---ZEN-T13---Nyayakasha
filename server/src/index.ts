import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { ENV } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { verificationRouter } from './routes/verification.routes.js';
import { mfaRouter } from './routes/mfa.routes.js';
import { securityRouter } from './routes/security.routes.js';
import { validatorRouter } from './routes/validator.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { casesRouter } from './routes/cases.routes.js';
import { evidenceRouter } from './routes/evidence.routes.js';
import { consensusRouter } from './routes/consensus.routes.js';
import { forgeryRouter } from './routes/forgery.routes.js';
import { identityRouter } from './routes/identity.routes.js';
import { precedentsRouter } from './routes/precedents.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { deviceRouter } from './routes/device.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { registerValidatorSocket } from './services/duress.service.js';

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-latitude', 'x-longitude', 'x-jurisdiction-code', 'x-duress-session', 'X-Duress-Session', 'x-user-email']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register Routers
app.use('/api/auth', authRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/mfa', mfaRouter);
app.use('/api/security/device', deviceRouter);
app.use('/api/security', securityRouter);
app.use('/api/cases', casesRouter);
app.use('/api/evidence', evidenceRouter);
app.use(['/api/consensus', '/api/consensus/'], consensusRouter);
app.use('/api/forgery', forgeryRouter);
app.use('/api/identity', identityRouter);
app.use('/api/precedents', precedentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/validator', validatorRouter);
app.use('/api/audit-log', auditRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/profile', profileRoutes);
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
      console.log(`🛡️  NYAYAKASHA Backend Authentication & Docket System Online`);
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
