
import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    console.error("ERROR:", error);
    throw error; // IMPORTANT → rethrow EXACT original error
  }

  console.error("UNKNOWN ERROR:", error);
  throw new Error(String(error)); // fallback
};
