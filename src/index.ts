import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { registerSimulationHandlers } from './handlers/simulation-handler.js';
import { registerFlowHandlers } from './handlers/flow-handler.js';
import { handleTrafficInjection, getSimulationStatus } from './handlers/traffic-injection-handler.js';

const PORT = Number(process.env.SIMULATION_SERVER_PORT || 3001);
const HOST = process.env.SIMULATION_SERVER_HOST || '0.0.0.0';

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // Reflect request origin so websocket clients from any port can connect.
    origin: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// REST API endpoints for Locust
app.post('/api/traffic/inject', handleTrafficInjection);
app.get('/api/simulation/:simulationId/status', getSimulationStatus);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  registerSimulationHandlers(io, socket);
  registerFlowHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Simulation server running on ${HOST}:${PORT}`);
  console.log(`- WebSocket: ws://localhost:${PORT}`);
  console.log(`- HTTP API: http://localhost:${PORT}/api/traffic/inject`);
  console.log(`- Health: http://localhost:${PORT}/health`);
});
