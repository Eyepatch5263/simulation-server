import type { RequestResponseTemplate } from './request-response-templates';

export interface ComponentMetrics {
  nodeId: string;
  timestamp: number;
  requestsPerSecond: number;
  activeRequests: number;
  queueDepth: number;
  cpuUtilization: number;
  memoryUtilization: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorCount: number;
  errorRate: number;
  connectionPoolUsage: number;
  cacheHitRate: number;
  throughput: number;

  // Data observability fields
  requestTemplate?: RequestResponseTemplate;
  recentRequests?: Array<{
    requestId: string;
    stage: 'arriving' | 'processing' | 'completing';
    data: Record<string, any>;
    timestamp: number;
  }>;
}

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface ComponentTimeSeries {
  nodeId: string;
  rps: TimeSeriesPoint[];
  latencyP50: TimeSeriesPoint[];
  latencyP99: TimeSeriesPoint[];
  errorRate: TimeSeriesPoint[];
  cpuUtilization: TimeSeriesPoint[];
  queueDepth: TimeSeriesPoint[];
}
