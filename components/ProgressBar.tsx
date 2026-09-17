"use client";

interface ProgressBarProps {
  percentage: number;
  color?: "lime" | "pink" | "cyan" | "yellow" | "green" | "auto";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ProgressBar({
  percentage,
  color = "auto",
  size = "md",
  showLabel = false,
}: ProgressBarProps) {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  let barColor: string;
  if (color === "auto") {
    barColor = clampedPct >= 90 ? "bg-neon-red" : clampedPct >= 70 ? "bg-neon-orange" : "bg-neon-lime";
  } else {
    const colorMap: Record<string, string> = {
      lime: "bg-neon-lime",
      pink: "bg-neon-pink",
      cyan: "bg-neon-cyan",
      yellow: "bg-neon-yellow",
      green: "bg-neon-green",
    };
    barColor = colorMap[color] || "bg-neon-lime";
  }

  const heightMap = { sm: "h-3", md: "h-4", lg: "h-6" };

  return (
    <div className="w-full">
      <div className={`w-full bg-white border-[3px] border-black overflow-hidden ${heightMap[size]} shadow-[2px_2px_0px_black]`}>
        <div
          className={`h-full transition-all border-r-[3px] border-black duration-1000 ease-out ${barColor}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-[11px] font-black text-black mt-1 text-right uppercase">{clampedPct}%</p>
      )}
    </div>
  );
}
