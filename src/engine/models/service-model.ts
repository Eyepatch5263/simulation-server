import { SimEventType, type SimEvent } from '@system-vis/shared';
import { ComponentModel, sampleNormal } from '../component-model.js';
import type { ServiceNodeProps } from '@system-vis/shared';

export class ServiceModel extends ComponentModel {
  private waitQueue: { requestId: string; arrivalTime: number }[] = [];

  handleEvent(event: SimEvent): SimEvent[] {
    const config = this.config as ServiceNodeProps;
    const totalCapacity = config.instances * config.maxConcurrentRequests;

    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE:
      case SimEventType.REQUEST_ROUTE: {
        if (this.state.activeRequests < totalCapacity) {
          this.state.activeRequests++;
          this.updateUtilization();
          const processingTime = this.getProcessingTime();

          if (this.shouldFail()) {
            return [{
              id: `evt_fail_${event.requestId}`,
              type: SimEventType.REQUEST_FAIL,
              timestamp: event.timestamp + processingTime,
              requestId: event.requestId,
              nodeId: event.nodeId,
            }];
          }

          return [{
            id: `evt_end_${event.requestId}`,
            type: SimEventType.REQUEST_PROCESS_END,
            timestamp: event.timestamp + processingTime,
            requestId: event.requestId,
            nodeId: event.nodeId,
          }];
        } else {
          this.waitQueue.push({ requestId: event.requestId, arrivalTime: event.timestamp });
          this.state.queueDepth = this.waitQueue.length;
          if (this.waitQueue.length > config.maxConcurrentRequests * 2) {
            this.waitQueue.shift();
            this.state.queueDepth = this.waitQueue.length;
            return [{
              id: `evt_overflow_${event.requestId}`,
              type: SimEventType.REQUEST_FAIL,
              timestamp: event.timestamp,
              requestId: event.requestId,
              nodeId: event.nodeId,
              metadata: { reason: 'queue_overflow' },
            }];
          }
          return [];
        }
      }

      case SimEventType.REQUEST_PROCESS_END: {
        this.state.activeRequests--;
        this.state.totalProcessed++;
        const latency = event.timestamp - (event.metadata?.arrivalTime as number || event.timestamp - this.config.baseLatencyMs);
        this.state.completedLatencies.push(latency);
        this.updateUtilization();

        const results: SimEvent[] = [];
        // Process waiting request
        if (this.waitQueue.length > 0) {
          const next = this.waitQueue.shift()!;
          this.state.queueDepth = this.waitQueue.length;
          this.state.activeRequests++;
          const processingTime = this.getProcessingTime();
          results.push({
            id: `evt_dequeue_${next.requestId}`,
            type: SimEventType.REQUEST_PROCESS_END,
            timestamp: event.timestamp + processingTime,
            requestId: next.requestId,
            nodeId: event.nodeId,
            metadata: { arrivalTime: next.arrivalTime },
          });
        }

        // Route downstream
        results.push(...this.routeToDownstream(event.requestId, event.timestamp));
        return results;
      }

      case SimEventType.REQUEST_FAIL: {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalFailed++;
        this.updateUtilization();
        return [{
          id: `evt_complete_fail_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE,
          timestamp: event.timestamp,
          requestId: event.requestId,
          nodeId: event.nodeId,
          metadata: { success: false },
        }];
      }

      default:
        return [];
    }
  }
}
