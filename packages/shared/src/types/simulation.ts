export type TrafficPattern =
  | { type: 'constant'; rps: number }
  | { type: 'ramp'; startRps: number; endRps: number; rampDurationSec: number }
  | { type: 'spike'; baseRps: number; spikeRps: number; spikeStartSec: number; spikeDurationSec: number }
  | { type: 'wave'; minRps: number; maxRps: number; periodSec: number };

export interface InternalTrafficConfig {
  enabled: boolean;
  entryPointRPS: number;
  loadPattern: TrafficPattern;
}

export interface TrafficGenerationConfig {
  internal?: InternalTrafficConfig;
  external?: {
    enabled: boolean;
  };
}

export interface SimulationConfig {
  architectureId: string;
  trafficPattern: TrafficPattern;
  durationSec: number;
  tickIntervalMs: number;
  entryNodeId: string;
  requestScenario: string;
  trafficGeneration?: TrafficGenerationConfig;
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface SimulationState {
  status: SimulationStatus;
  currentTimeSec: number;
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  activeRequests: number;
}

export interface SimulationTickResult {
  tick: number;
  timeSec: number;
  componentMetrics: Record<string, import('./metrics').ComponentMetrics>;
  activePackets: PacketPosition[];
  bottlenecks: BottleneckInfo[];
  globalMetrics: {
    totalRPS: number;
    avgLatencyMs: number;
    p99LatencyMs: number;
    errorRate: number;
  };
}

export interface PacketPosition {
  packetId: string;
  edgeId: string;
  progress: number;
  status: 'in_flight' | 'processing' | 'completed' | 'failed';
}

export interface BottleneckInfo {
  nodeId: string;
  severity: 'warning' | 'critical';
  reason: string;
  metric: string;
  value: number;
  threshold: number;
}

export enum SimEventType {
  REQUEST_ARRIVE = 'REQUEST_ARRIVE',
  REQUEST_ROUTE = 'REQUEST_ROUTE',
  REQUEST_PROCESS_START = 'REQUEST_PROCESS_START',
  REQUEST_PROCESS_END = 'REQUEST_PROCESS_END',
  REQUEST_ENQUEUE = 'REQUEST_ENQUEUE',
  REQUEST_DEQUEUE = 'REQUEST_DEQUEUE',
  REQUEST_FAIL = 'REQUEST_FAIL',
  REQUEST_COMPLETE = 'REQUEST_COMPLETE',
  CACHE_HIT = 'CACHE_HIT',
  CACHE_MISS = 'CACHE_MISS',
}

export interface SimEvent {
  id: string;
  type: SimEventType;
  timestamp: number;
  requestId: string;
  nodeId: string;
  nextNodeId?: string;
  metadata?: Record<string, unknown>;
}

export interface FlowStep {
  requestId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeId: string;
  latencyMs: number;
  status: string;
  processingDetail: string;
}

export interface FlowComplete {
  requestId: string;
  totalLatencyMs: number;
  path: string[];
  success: boolean;
}
