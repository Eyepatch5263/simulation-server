import { SimEventType, type SimEvent, type APIGatewayNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class GatewayModel extends ComponentModel {
  private requestsThisSec = 0;
  private currentSecond = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as APIGatewayNodeProps;
    const sec = Math.floor(event.timestamp / 1000);

    if (sec !== this.currentSecond) {
      this.currentSecond = sec;
      this.requestsThisSec = 0;
    }
    this.requestsThisSec++;

    // Rate limiting
    if (this.requestsThisSec > config.rateLimitRPS) {
      this.state.totalFailed++;
      return [{
        id: `evt_gw_ratelimit_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { reason: 'rate_limited' },
      }];
    }

    this.state.totalProcessed++;
    const processingTime = this.getProcessingTime();

    if (this.shouldFail()) {
      this.state.totalFailed++;
      return [{
        id: `evt_gw_fail_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
      }];
    }

    return this.routeToDownstream(event.requestId, event.timestamp + processingTime);
  }
}
