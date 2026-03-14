import { SimEventType, type SimEvent, type QueueNodeProps } from '@system-vis/shared';
import { ComponentModel, sampleNormal } from '../component-model.js';

export class QueueModel extends ComponentModel {
  private messageQueue: { requestId: string; enqueuedAt: number }[] = [];

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      if (event.type === SimEventType.REQUEST_DEQUEUE) {
        return this._processDequeue(event);
      }
      return [];
    }

    const config = this.config as QueueNodeProps;

    if (this.messageQueue.length >= config.maxQueueDepth) {
      this.state.totalFailed++;
      return [{
        id: `evt_q_full_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { reason: 'queue_full' },
      }];
    }

    // Enqueue
    this.messageQueue.push({ requestId: event.requestId, enqueuedAt: event.timestamp });
    this.state.queueDepth = this.messageQueue.length;
    this.state.totalProcessed++;

    // Schedule dequeue if consumers available
    const results: SimEvent[] = [];
    const availableConsumers = Math.min(config.consumerCount, this.messageQueue.length);
    for (let i = 0; i < availableConsumers && this.messageQueue.length > 0; i++) {
      const msg = this.messageQueue.shift()!;
      this.state.queueDepth = this.messageQueue.length;
      const processingTime = sampleNormal(config.consumerProcessingMs, config.consumerProcessingMs * 0.2);
      results.push({
        id: `evt_deq_${msg.requestId}`,
        type: SimEventType.REQUEST_DEQUEUE,
        timestamp: event.timestamp + processingTime,
        requestId: msg.requestId,
        nodeId: event.nodeId,
        metadata: { enqueuedAt: msg.enqueuedAt },
      });
    }

    return results;
  }

  private _processDequeue(event: SimEvent): SimEvent[] {
    // Compute actual latency: time-in-queue + consumer processing time
    const enqueuedAt = (event.metadata?.enqueuedAt as number) ?? event.timestamp;
    const latency = event.timestamp - enqueuedAt;
    this.state.completedLatencies.push(latency);
    return this.routeToDownstream(event.requestId, event.timestamp);
  }
}
