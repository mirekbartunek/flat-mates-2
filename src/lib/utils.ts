import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUrl = () => {
  const isDev = env.NODE_ENV === "development";
  return isDev ? "http://localhost:3000" : `https://${env.VERCEL_URL}`;
};
