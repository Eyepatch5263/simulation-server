import type { ComponentMetrics } from '@system-vis/shared';
import { REQUEST_RESPONSE_TEMPLATES } from '@system-vis/shared';
import type { ComponentModel } from './component-model.js';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, idx)];
}

export function collectMetrics(
  models: Map<string, ComponentModel>,
  tickTimeSec: number,
  tickDurationSec: number
): Record<string, ComponentMetrics> {
  const result: Record<string, ComponentMetrics> = {};

  for (const [nodeId, model] of models) {
    const state = model.state;
    const latencies = [...state.completedLatencies].sort((a, b) => a - b);

    const metrics: ComponentMetrics = {
      nodeId,
      timestamp: tickTimeSec,
      requestsPerSecond: state.totalProcessed / Math.max(tickTimeSec, 0.1),
      activeRequests: state.activeRequests,
      queueDepth: state.queueDepth,
      cpuUtilization: state.cpuUtilization,
      memoryUtilization: Math.min(state.cpuUtilization * 0.6, 100),
      latencyP50Ms: percentile(latencies, 0.5),
      latencyP95Ms: percentile(latencies, 0.95),
      latencyP99Ms: percentile(latencies, 0.99),
      errorCount: state.totalFailed,
      errorRate: state.totalProcessed > 0 ? state.totalFailed / (state.totalProcessed + state.totalFailed) : 0,
      connectionPoolUsage: state.activeRequests / 100,
      cacheHitRate: 0,
      throughput: state.totalProcessed / Math.max(tickTimeSec, 0.1),
    };

    // Add request/response template for data observability
    // Prefer node-specific custom template (from AI-generated designs) over generic type-based template
    const config = model.getConfig();
    const nodeType = config.nodeType;
    if (config.requestResponseTemplate) {
      metrics.requestTemplate = {
        componentType: nodeType,
        ...config.requestResponseTemplate,
      };
    } else if (nodeType && REQUEST_RESPONSE_TEMPLATES[nodeType]) {
      metrics.requestTemplate = REQUEST_RESPONSE_TEMPLATES[nodeType];
    }
    metrics.recentRequests = model.getRecentRequests();

    result[nodeId] = metrics;
    model.resetTickCounters();
  }

  return result;
}
