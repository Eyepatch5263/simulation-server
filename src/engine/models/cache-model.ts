import { SimEventType, type SimEvent, type CacheNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class CacheModel extends ComponentModel {
  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as CacheNodeProps;
    this.state.totalProcessed++;
    const processingTime = this.getProcessingTime();

    if (Math.random() < config.hitRate) {
      // Cache hit — respond immediately
      this.state.completedLatencies.push(processingTime);
      return [{
        id: `evt_cache_hit_${event.requestId}`,
        type: SimEventType.REQUEST_COMPLETE,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { cacheHit: true },
      }];
    }

    // Cache miss — route to downstream (usually database)
    return this.routeToDownstream(event.requestId, event.timestamp + processingTime);
  }
}
