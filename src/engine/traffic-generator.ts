import { SimEventType, type SimEvent, type TrafficPattern } from '@system-vis/shared';
import type { Architecture } from '@system-vis/shared';
import { ArchNodeType } from '@system-vis/shared';

let requestCounter = 0;

function poissonSample(lambda: number): number {
  if (lambda <= 0) return 0;
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function getCurrentRPS(pattern: TrafficPattern, timeSec: number): number {
  switch (pattern.type) {
    case 'constant':
      return pattern.rps;
    case 'ramp': {
      const progress = Math.min(timeSec / pattern.rampDurationSec, 1);
      return pattern.startRps + (pattern.endRps - pattern.startRps) * progress;
    }
    case 'spike': {
      if (timeSec >= pattern.spikeStartSec && timeSec < pattern.spikeStartSec + pattern.spikeDurationSec) {
        return pattern.spikeRps;
      }
      return pattern.baseRps;
    }
    case 'wave': {
      const mid = (pattern.minRps + pattern.maxRps) / 2;
      const amp = (pattern.maxRps - pattern.minRps) / 2;
      return mid + amp * Math.sin((2 * Math.PI * timeSec) / pattern.periodSec);
    }
  }
}

export function generateArrivals(
  pattern: TrafficPattern,
  tickStartMs: number,
  tickDurationMs: number,
  entryNodeId: string
): SimEvent[] {
  const timeSec = tickStartMs / 1000;
  const dtSec = tickDurationMs / 1000;
  const lambda = getCurrentRPS(pattern, timeSec) * dtSec;
  const count = poissonSample(lambda);

  const events: SimEvent[] = [];
  for (let i = 0; i < count; i++) {
    const arrivalTime = tickStartMs + Math.random() * tickDurationMs;
    events.push({
      id: `evt_${++requestCounter}`,
      type: SimEventType.REQUEST_ARRIVE,
      timestamp: arrivalTime,
      requestId: `req_${requestCounter}`,
      nodeId: entryNodeId,
    });
  }
  return events;
}

/**
 * Internal Traffic Generator
 * Generates realistic traffic based on the architecture topology
 * by identifying entry points (Frontend, API Gateway, WebSocket) and
 * distributing load across them.
 */
export class InternalTrafficGenerator {
  private entryPointNodeIds: string[] = [];

  constructor(architecture: Architecture) {
    this.entryPointNodeIds = this.identifyEntryPoints(architecture);
  }

  private identifyEntryPoints(architecture: Architecture): string[] {
    const entryPoints = architecture.nodes
      .filter((node) => {
        const nodeType = node.data.nodeType;
        return (
          nodeType === ArchNodeType.FRONTEND ||
          nodeType === ArchNodeType.API_GATEWAY ||
          nodeType === ArchNodeType.WEBSOCKET_SERVER
        );
      })
      .map((node) => node.id);
    return entryPoints;
  }

  generateArrivals(
    pattern: TrafficPattern,
    tickStartMs: number,
    tickDurationMs: number
  ): SimEvent[] {
    if (this.entryPointNodeIds.length === 0) {
      return [];
    }

    // Distribute target RPS equally across all entry points
    const timeSec = tickStartMs / 1000;
    const dtSec = tickDurationMs / 1000;
    const totalRPS = getCurrentRPS(pattern, timeSec);
    const rpsPerEntryPoint = totalRPS / this.entryPointNodeIds.length;

    const events: SimEvent[] = [];

    for (const entryPointId of this.entryPointNodeIds) {
      const lambda = rpsPerEntryPoint * dtSec;
      const count = poissonSample(lambda);

      for (let i = 0; i < count; i++) {
        const arrivalTime = tickStartMs + Math.random() * tickDurationMs;
        events.push({
          id: `evt_${++requestCounter}`,
          type: SimEventType.REQUEST_ARRIVE,
          timestamp: arrivalTime,
          requestId: `req_${requestCounter}`,
          nodeId: entryPointId,
        });
      }
    }

    return events;
  }
}

export { getCurrentRPS };
