"use client";

import { formatCurrency } from "@/lib/calculations";

interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "lime" | "pink" | "cyan" | "yellow" | "default";
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "money-lg",
  xl: "money-xl",
};

const colorMap = {
  lime: "text-neon-lime",
  pink: "text-neon-pink",
  cyan: "text-neon-cyan",
  yellow: "text-neon-yellow",
  default: "text-text-white",
};

export default function MoneyDisplay({
  amount,
  currency = "INR",
  size = "md",
  color = "default",
}: MoneyDisplayProps) {
  return (
    <span className={`money-value ${sizeMap[size]} ${colorMap[color]}`}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
