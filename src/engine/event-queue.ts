import type { SimEvent } from '@system-vis/shared';

export class EventQueue {
  private heap: SimEvent[] = [];

  get length(): number {
    return this.heap.length;
  }

  push(event: SimEvent): void {
    this.heap.push(event);
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): SimEvent | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  peek(): SimEvent | undefined {
    return this.heap[0];
  }

  clear(): void {
    this.heap = [];
  }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].timestamp <= this.heap[i].timestamp) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private _sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].timestamp < this.heap[smallest].timestamp) smallest = left;
      if (right < n && this.heap[right].timestamp < this.heap[smallest].timestamp) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}
