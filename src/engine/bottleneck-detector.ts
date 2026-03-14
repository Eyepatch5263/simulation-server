import type { ComponentMetrics, BottleneckInfo } from '@system-vis/shared';

export function detectBottlenecks(
  metrics: Record<string, ComponentMetrics>
): BottleneckInfo[] {
  const bottlenecks: BottleneckInfo[] = [];

  for (const [nodeId, m] of Object.entries(metrics)) {
    if (m.cpuUtilization > 95) {
      bottlenecks.push({
        nodeId,
        severity: 'critical',
        reason: `CPU utilization at ${m.cpuUtilization.toFixed(1)}%`,
        metric: 'cpuUtilization',
        value: m.cpuUtilization,
        threshold: 95,
      });
    } else if (m.cpuUtilization > 80) {
      bottlenecks.push({
        nodeId,
        severity: 'warning',
        reason: `CPU utilization at ${m.cpuUtilization.toFixed(1)}%`,
        metric: 'cpuUtilization',
        value: m.cpuUtilization,
        threshold: 80,
      });
    }

    if (m.errorRate > 0.2) {
      bottlenecks.push({
        nodeId,
        severity: 'critical',
        reason: `Error rate at ${(m.errorRate * 100).toFixed(1)}%`,
        metric: 'errorRate',
        value: m.errorRate * 100,
        threshold: 20,
      });
    } else if (m.errorRate > 0.05) {
      bottlenecks.push({
        nodeId,
        severity: 'warning',
        reason: `Error rate at ${(m.errorRate * 100).toFixed(1)}%`,
        metric: 'errorRate',
        value: m.errorRate * 100,
        threshold: 5,
      });
    }

    if (m.queueDepth > 100) {
      bottlenecks.push({
        nodeId,
        severity: m.queueDepth > 500 ? 'critical' : 'warning',
        reason: `Queue depth at ${m.queueDepth}`,
        metric: 'queueDepth',
        value: m.queueDepth,
        threshold: 100,
      });
    }

    if (m.latencyP99Ms > 1000) {
      bottlenecks.push({
        nodeId,
        severity: m.latencyP99Ms > 5000 ? 'critical' : 'warning',
        reason: `P99 latency at ${m.latencyP99Ms.toFixed(0)}ms`,
        metric: 'latencyP99',
        value: m.latencyP99Ms,
        threshold: 1000,
      });
    }
  }

  return bottlenecks;
}
