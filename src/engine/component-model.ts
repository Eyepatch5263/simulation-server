import type { SimEvent, ArchNodeData } from '@system-vis/shared';
import { SimEventType } from '@system-vis/shared';

function sampleNormal(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, mean + z * stdDev);
}

export interface ComponentState {
  activeRequests: number;
  queueDepth: number;
  totalProcessed: number;
  totalFailed: number;
  completedLatencies: number[];
  cpuUtilization: number;
}

export abstract class ComponentModel {
  public state: ComponentState;
  protected config: ArchNodeData;
  protected downstreamNodeIds: string[];
  protected recentRequests: Array<{
    requestId: string;
    stage: 'arriving' | 'processing' | 'completing';
    sampleData: Record<string, any>;
    timestamp: number;
  }> = [];
  protected maxRecentRequests = 5;

  constructor(config: ArchNodeData, downstreamNodeIds: string[]) {
    this.config = config;
    this.downstreamNodeIds = downstreamNodeIds;
    this.state = {
      activeRequests: 0,
      queueDepth: 0,
      totalProcessed: 0,
      totalFailed: 0,
      completedLatencies: [],
      cpuUtilization: 0,
    };
  }

  abstract handleEvent(event: SimEvent): SimEvent[];

  protected getProcessingTime(): number {
    return sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
  }

  protected shouldFail(): boolean {
    return Math.random() < this.config.failureRate;
  }

  protected routeToDownstream(requestId: string, timestamp: number): SimEvent[] {
    return this.downstreamNodeIds.map((nodeId) => ({
      id: `evt_route_${requestId}_${nodeId}`,
      type: SimEventType.REQUEST_ROUTE,
      timestamp: timestamp + 1, // 1ms network overhead
      requestId,
      nodeId,
    }));
  }

  /**
   * Add a sample request to the tracking list for observability
   * Keeps only the most recent N requests to avoid memory bloat
   */
  protected addSampleRequest(
    requestId: string,
    stage: 'arriving' | 'processing' | 'completing',
    sampleData: Record<string, any>,
    timestamp: number
  ): void {
    this.recentRequests.push({ requestId, stage, sampleData, timestamp });
    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.shift();
    }
  }

  /**
   * Get recent sample requests for data observability tooltips
   */
  getRecentRequests(): Array<{
    requestId: string;
    stage: 'arriving' | 'processing' | 'completing';
    data: Record<string, any>;
    timestamp: number;
  }> {
    return this.recentRequests.map((req) => ({
      requestId: req.requestId,
      stage: req.stage,
      data: req.sampleData,
      timestamp: req.timestamp,
    }));
  }

  /**
   * Get the component configuration
   */
  getConfig(): ArchNodeData {
    return this.config;
  }

  updateUtilization(): void {
    this.state.cpuUtilization =
      (this.state.activeRequests / Math.max(this.config.maxConcurrentRequests, 1)) * 100;
  }

  resetTickCounters(): void {
    if (this.state.completedLatencies.length > 1000) {
      this.state.completedLatencies = this.state.completedLatencies.slice(-500);
    }
  }
}

export { sampleNormal };
