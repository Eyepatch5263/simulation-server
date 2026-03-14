import { SimEventType, type SimEvent, type DatabaseNodeProps } from '@system-vis/shared';
import { ComponentModel, sampleNormal } from '../component-model.js';

export class DatabaseModel extends ComponentModel {
  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      if (event.type === SimEventType.REQUEST_PROCESS_END) {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalProcessed++;
        this.updateUtilization();
        return this.routeToDownstream(event.requestId, event.timestamp);
      }
      if (event.type === SimEventType.REQUEST_FAIL) {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalFailed++;
        this.updateUtilization();
        return [];
      }
      return [];
    }

    const config = this.config as DatabaseNodeProps;
    if (this.state.activeRequests >= config.maxConnections) {
      this.state.queueDepth++;
      this.state.totalFailed++;
      return [{
        id: `evt_db_connlimit_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { reason: 'connection_limit_exceeded' },
      }];
    }

    this.state.activeRequests++;
    this.updateUtilization();
    const queryTime = sampleNormal(config.avgQueryLatencyMs, config.avgQueryLatencyMs * 0.3);
    this.state.completedLatencies.push(queryTime);

    if (this.shouldFail()) {
      return [{
        id: `evt_db_fail_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp + queryTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
      }];
    }

    return [{
      id: `evt_db_done_${event.requestId}`,
      type: SimEventType.REQUEST_PROCESS_END,
      timestamp: event.timestamp + queryTime,
      requestId: event.requestId,
      nodeId: event.nodeId,
    }];
  }
}
