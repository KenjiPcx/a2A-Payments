import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserNode } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
