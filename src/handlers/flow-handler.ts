import type { Server, Socket } from 'socket.io';
import type { Architecture } from '@system-vis/shared';

export function registerFlowHandlers(io: Server, socket: Socket): void {
  socket.on('flow:trace', async ({ architecture, entryNodeId, scenario }: { architecture: Architecture; entryNodeId: string; scenario: string }) => {
    const requestId = `flow_${Date.now()}`;
    let currentNodeId = entryNodeId;
    const path: string[] = [currentNodeId];
    let totalLatencyMs = 0;

    const visited = new Set<string>();

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      const node = architecture.nodes.find((n) => n.id === currentNodeId);
      if (!node) break;

      const latencyMs = node.data.baseLatencyMs;
      totalLatencyMs += latencyMs;

      // Find downstream edges
      const downstreamEdges = architecture.edges.filter((e) => e.source === currentNodeId);
      const nextEdge = downstreamEdges[0]; // Take first downstream for trace

      if (nextEdge) {
        socket.emit('flow:step', {
          requestId,
          fromNodeId: currentNodeId,
          toNodeId: nextEdge.target,
          edgeId: nextEdge.id,
          latencyMs,
          status: 'processing',
          processingDetail: `${node.data.label}: ${latencyMs.toFixed(1)}ms`,
        });

        // Simulate delay for animation
        await new Promise((resolve) => setTimeout(resolve, Math.min(latencyMs * 2, 500)));

        currentNodeId = nextEdge.target;
        path.push(currentNodeId);
      } else {
        // Terminal node
        socket.emit('flow:step', {
          requestId,
          fromNodeId: currentNodeId,
          toNodeId: currentNodeId,
          edgeId: '',
          latencyMs,
          status: 'completed',
          processingDetail: `${node.data.label}: ${latencyMs.toFixed(1)}ms (terminal)`,
        });
        break;
      }
    }

    socket.emit('flow:complete', {
      requestId,
      totalLatencyMs,
      path,
      success: true,
    });
  });
}
