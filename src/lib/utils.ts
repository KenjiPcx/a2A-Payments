import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserNode } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mapUserNodesToGlobeNodes = (userNodes: UserNode[]) => {
  return userNodes.map(node => ({
    long: node.longitude,
    lat: node.latitude,
    value: 5, // Default size for visualization
    type: node.type,
    userData: node,
    isNew: false // Can be set based on registration time if needed
  }));
};