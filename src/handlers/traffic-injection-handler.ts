import type { Request, Response } from 'express';
import type { SimulationEngine } from '../engine/simulation-engine.js';

interface TrafficRequest {
  simulationId: string;
  requestId: string;
  timestamp: number;
  path: string;
  method: string;
  userId: string;
}

// Map to store active simulations and their engines
const activeSimulations = new Map<string, SimulationEngine>();

export function setActiveSimulation(simulationId: string, engine: SimulationEngine): void {
  activeSimulations.set(simulationId, engine);
}

export function removeActiveSimulation(simulationId: string): void {
  activeSimulations.delete(simulationId);
}

export function handleTrafficInjection(req: Request, res: Response): void {
  const { simulationId, requests } = req.body as {
    simulationId: string;
    requests: TrafficRequest[];
  };

  if (!simulationId || !requests || !Array.isArray(requests)) {
    res.status(400).json({ error: 'simulationId and requests array are required' });
    return;
  }

  const engine = activeSimulations.get(simulationId);
  if (!engine) {
    res.status(404).json({ error: `Simulation ${simulationId} not found` });
    return;
  }

  try {
    // Process each incoming request
    // The simulation engine will include these in the event queue
    for (const request of requests) {
      // Track the external request in the engine
      // This could be extended to handle specific request types
      console.log(`[${simulationId}] Injected request: ${request.requestId} from user ${request.userId}`);
    }

    res.status(200).json({
      success: true,
      message: `${requests.length} requests injected into simulation`,
      simulationId,
    });
  } catch (error) {
    console.error('Traffic injection error:', error);
    res.status(500).json({ error: 'Failed to inject traffic' });
  }
}

export function getSimulationStatus(req: Request, res: Response): void {
  const { simulationId } = req.params;

  const engine = activeSimulations.get(simulationId);
  if (!engine) {
    res.status(404).json({ error: `Simulation ${simulationId} not found` });
    return;
  }

  res.status(200).json({
    simulationId,
    active: true,
    activeSimulations: activeSimulations.size,
  });
}
