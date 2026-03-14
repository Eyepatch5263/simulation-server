import { ArchNode } from './node-types';
import { ArchEdge } from './edge-types';

export interface Architecture {
  id: string;
  name: string;
  description?: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
