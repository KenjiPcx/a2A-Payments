import type { UserNode } from '@/types';

export type Node = {
  long: number;
  lat: number;
  value: number;
  type?: string;
  userData?: UserNode;
  isNew?: boolean;
};