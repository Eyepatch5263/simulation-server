import { SimEventType, type SimEvent, type LoadBalancerNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class LoadBalancerModel extends ComponentModel {
  private roundRobinIndex = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as LoadBalancerNodeProps;
    this.state.totalProcessed++;
    const processingTime = this.getProcessingTime();

    if (this.shouldFail() || this.downstreamNodeIds.length === 0) {
      this.state.totalFailed++;
      return [{
        id: `evt_lb_fail_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
      }];
    }

    // Pick downstream node
    let targetIdx = 0;
    switch (config.algorithm) {
      case 'round_robin':
        targetIdx = this.roundRobinIndex % this.downstreamNodeIds.length;
        this.roundRobinIndex++;
        break;
      case 'least_connections':
      case 'ip_hash':
      case 'weighted':
      default:
        targetIdx = this.roundRobinIndex % this.downstreamNodeIds.length;
        this.roundRobinIndex++;
        break;
    }

    return [{
      id: `evt_lb_route_${event.requestId}`,
      type: SimEventType.REQUEST_ROUTE,
      timestamp: event.timestamp + processingTime,
      requestId: event.requestId,
      nodeId: this.downstreamNodeIds[targetIdx],
    }];
  }
}
