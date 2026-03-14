import { TrafficPattern } from '../types/simulation';

export interface SimulationPreset {
  name: string;
  description: string;
  trafficPattern: TrafficPattern;
  durationSec: number;
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    name: 'Light Load',
    description: '100 requests/sec constant',
    trafficPattern: { type: 'constant', rps: 100 },
    durationSec: 30,
  },
  {
    name: 'Moderate Load',
    description: '1,000 requests/sec constant',
    trafficPattern: { type: 'constant', rps: 1000 },
    durationSec: 60,
  },
  {
    name: 'Heavy Load',
    description: '10,000 requests/sec constant',
    trafficPattern: { type: 'constant', rps: 10000 },
    durationSec: 60,
  },
  {
    name: 'Massive Scale',
    description: '100,000 requests/sec constant',
    trafficPattern: { type: 'constant', rps: 100000 },
    durationSec: 60,
  },
  {
    name: 'Gradual Ramp',
    description: 'Ramp from 100 to 10,000 RPS',
    trafficPattern: { type: 'ramp', startRps: 100, endRps: 10000, rampDurationSec: 60 },
    durationSec: 60,
  },
  {
    name: 'Black Friday',
    description: 'Traffic spike: 1K base, 10K spike for 20s',
    trafficPattern: {
      type: 'spike',
      baseRps: 1000,
      spikeRps: 10000,
      spikeStartSec: 15,
      spikeDurationSec: 20,
    },
    durationSec: 60,
  },
  {
    name: 'Periodic Wave',
    description: 'Sine wave between 500 and 5,000 RPS',
    trafficPattern: { type: 'wave', minRps: 500, maxRps: 5000, periodSec: 20 },
    durationSec: 60,
  },
];
