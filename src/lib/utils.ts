import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " MMK"
  );
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "ယနေ့";
  if (diffDays === 1) return "မနေ့က";
  if (diffDays < 7) return `${diffDays} ရက် ကြာပြီ`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} ပတ် ကြာပြီ`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} လ ကြာပြီ`;
  return `${Math.floor(diffDays / 365)} နှစ် ကြာပြီ`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
