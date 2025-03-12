import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env";
import type { UserRole } from "@/server/db/enums";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUrl = () => {
  const isDev = env.NODE_ENV === "development";

  return isDev ? "http://localhost:3000" : `https://${"flat-mates-2-vercel.app"}`; // tohle je nejhorsi fix ale good enough
};

export const isNewListing = (creationDate: Date): boolean => {
  const now = new Date();
  const timeDiff = now.getTime() - creationDate.getTime(); // Difference in milliseconds
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24); // Convert milliseconds to days
  return daysDiff < 5;
};

export const capitalizer = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isAdmin = (role: UserRole) => {
  return role === "ADMIN" || role === "SUPERADMIN";
};
