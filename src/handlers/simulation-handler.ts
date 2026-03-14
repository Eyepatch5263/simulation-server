import type { Server, Socket } from 'socket.io';
import type { Architecture, SimulationConfig } from '@system-vis/shared';
import { SimulationEngine } from '../engine/simulation-engine.js';
import { setActiveSimulation, removeActiveSimulation } from './traffic-injection-handler.js';

const simulationIntervals = new Map<string, NodeJS.Timeout>();

export function registerSimulationHandlers(io: Server, socket: Socket): void {
  socket.on('sim:start', ({ architecture, config }: { architecture: Architecture; config: SimulationConfig }) => {
    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const engine = new SimulationEngine(architecture, config);
      socket.emit('sim:initialized', { simulationId });

      // Register simulation for traffic injection
      setActiveSimulation(simulationId, engine);

      const interval = setInterval(() => {
        if (engine.isComplete()) {
          clearInterval(interval);
          simulationIntervals.delete(simulationId);
          removeActiveSimulation(simulationId);
          socket.emit('sim:completed', { simulationId, summary: {} });
          return;
        }

        try {
          const tickResult = engine.tick();
          socket.emit('sim:tick', tickResult);

          if (tickResult.bottlenecks.length > 0) {
            socket.emit('sim:bottleneck', tickResult.bottlenecks);
          }
        } catch (err) {
          console.error('Simulation tick error:', err);
          clearInterval(interval);
          simulationIntervals.delete(simulationId);
          removeActiveSimulation(simulationId);
          socket.emit('sim:error', { simulationId, error: String(err) });
        }
      }, config.tickIntervalMs);

      simulationIntervals.set(simulationId, interval);
    } catch (err) {
      socket.emit('sim:error', { simulationId, error: String(err) });
    }
  });

  socket.on('sim:stop', ({ simulationId }: { simulationId: string }) => {
    const interval = simulationIntervals.get(simulationId);
    if (interval) {
      clearInterval(interval);
      simulationIntervals.delete(simulationId);
      removeActiveSimulation(simulationId);
    }
  });

  socket.on('disconnect', () => {
    // Clean up all simulations for this socket
    for (const [id, interval] of simulationIntervals) {
      clearInterval(interval);
      simulationIntervals.delete(id);
      removeActiveSimulation(id);
    }
  });
}
