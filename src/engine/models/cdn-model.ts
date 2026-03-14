import { SimEventType, type SimEvent, type CDNNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class CDNModel extends ComponentModel {
  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as CDNNodeProps;
    this.state.totalProcessed++;
    const processingTime = this.getProcessingTime();

    if (Math.random() < config.cacheHitRate) {
      this.state.completedLatencies.push(processingTime);
      return [{
        id: `evt_cdn_hit_${event.requestId}`,
        type: SimEventType.REQUEST_COMPLETE,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { cacheHit: true },
      }];
    }

    // Cache miss — route to origin
    return this.routeToDownstream(event.requestId, event.timestamp + processingTime);
  }
}
