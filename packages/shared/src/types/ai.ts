import { Architecture } from './architecture';
import type { BottleneckInfo } from './simulation';
import type { ComponentMetrics } from './metrics';

export interface AISuggestRequest {
  description: string;
  constraints?: string;
  existingArchitecture?: Architecture;
}

export interface AISuggestResponse {
  architecture: Architecture;
  explanation: string;
  scalingStrategy: {
    recommendations: string[];
    estimatedCapacity: string;
  };
  warnings: string[];
}

// --- Bottleneck Analysis (AI Optimize) ---

export interface AIBottleneckAnalysisRequest {
  architecture: Architecture;
  bottlenecks: BottleneckInfo[];
  globalMetrics: {
    totalRPS: number;
    avgLatencyMs: number;
    p99LatencyMs: number;
    errorRate: number;
  };
  componentMetrics: Record<string, ComponentMetrics>;
}

export interface BottleneckInsight {
  nodeId: string;
  nodeName: string;
  issue: string;
  rootCause: string;
  suggestion: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface AIBottleneckAnalysisResponse {
  insights: BottleneckInsight[];
  summary: string;
  optimizedArchitecture: Architecture;
  changes: string[];
}
