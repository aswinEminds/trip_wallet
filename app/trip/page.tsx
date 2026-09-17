"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import MoneyDisplay from "@/components/MoneyDisplay";
import ProgressBar from "@/components/ProgressBar";
import { StarBurst, WavyLine } from "@/components/Vectors";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import * as Icons from "lucide-react";

interface DashboardData {
  trip: { name: string; startDate: string; endDate: string; currency: string };
  collection: {
    totalExpected: number; totalCollected: number; totalPending: number;
    collectionPercentage: number; everyonePaid: boolean;
  };
  budget: {
    totalBudget: number; totalExpenses: number; remainingBudget: number; budgetUsedPercentage: number;
  };
  cash: { cashInHand: number };
  categoryOverview: {
    _id: string; name: string; icon: string; currentBudget: number;
    totalSpent: number; remaining: number; spentPercentage: number;
  }[];
  stats: { peopleCount: number; pendingPeople: number; categoryCount: number; expenseCount: number };
}

interface ActivityItem {
  type: "payment" | "expense" | "transfer";
  data: Record<string, unknown>;
  createdAt: string;
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardData & { error?: string }>("/api/dashboard", fetcher, { refreshInterval: 30000 });
  const { data: activityData } = useSWR<{ activities: ActivityItem[], error?: string }>("/api/activity", fetcher, { refreshInterval: 30000 });
  const router = useRouter();

  useEffect(() => {
    if (data?.error === "No active trip") {
      signOut({ callbackUrl: "/" });
    }
  }, [data]);

  if (isLoading || !data || data.error) {
    return (
      <div className="px-4 pt-6 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 w-full" />)}
      </div>
    );
  }

  const { trip, collection, budget, cash, categoryOverview, stats } = data;
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: trip.currency, minimumFractionDigits: 0 }).format(n);

  return (
    <div className="px-4 pt-6 pb-4 space-y-6 animate-fade-in">
      {/* Trip Header */}
      <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_black] text-center relative ">
        <div className="absolute -top-4 -right-4">
          <StarBurst className="text-neon-pink" size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase text-black">
          {trip.name}
        </h1>
        <div className="bg-neon-cyan inline-block px-3 py-1 border-2 border-black mt-2 font-bold text-black text-xs uppercase">
          {format(new Date(trip.startDate), "dd MMM")} → {format(new Date(trip.endDate), "dd MMM yyyy")}
        </div>
      </div>

      {/* Budget Card */}
      <div className="brutal-card brutal-card-lime p-5 ">
        <div className="flex items-center justify-between mb-3">
          <p className="bg-black text-white px-2 py-1 text-xs uppercase font-black border-2 border-white">Total Budget</p>
          <StarBurst className="text-black" size={24} />
        </div>
        <MoneyDisplay amount={budget.totalBudget} size="lg" currency={trip.currency} color="default" />
        <div className="mt-4 grid grid-cols-2 gap-4 bg-white border-4 border-black p-3">
          <div>
            <p className="text-[10px] text-black uppercase tracking-wider font-black mb-0.5">Spent</p>
            <p className="text-neon-pink font-black text-lg text-shadow-sm">{fmt(budget.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-[10px] text-black uppercase tracking-wider font-black mb-0.5">Remaining</p>
            <p className="text-neon-green font-black text-lg text-shadow-sm">{fmt(budget.remainingBudget)}</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar percentage={budget.budgetUsedPercentage} color="pink" />
        </div>
      </div>

      {/* Collection Card */}
      <div className="brutal-card brutal-card-cyan p-5">
        <p className="bg-black text-white px-2 py-1 text-xs uppercase font-black border-2 border-white inline-block mb-4">Collection</p>
        <div className="flex items-baseline gap-2 mb-3 bg-white border-4 border-black p-3">
          <p className="text-3xl font-black text-black">{fmt(collection.totalCollected)}</p>
          <span className="text-gray-500 text-sm font-bold">/ {fmt(collection.totalExpected)}</span>
        </div>
        <ProgressBar percentage={collection.collectionPercentage} color="yellow" />
        <div className="mt-3 flex justify-between text-xs font-black uppercase bg-black text-white p-2">
          <span>{stats.peopleCount} people</span>
          {collection.everyonePaid ? (
            <span className="text-neon-green">ALL PAID</span>
          ) : (
            <span className="text-neon-yellow">{stats.pendingPeople} PENDING</span>
          )}
        </div>
      </div>

      {/* Cash in Hand */}
      <div className="brutal-card brutal-card-pink p-5 text-center ">
        <p className="text-white text-sm uppercase font-black mb-2 tracking-widest bg-black inline-block px-4 py-1 border-2 border-white">Cash in Hand</p>
        <div className="my-2">
           <MoneyDisplay
            amount={cash.cashInHand}
            size="xl"
            color="default"
            currency={trip.currency}
          />
        </div>
        <p className="text-xs text-white mt-2 font-bold bg-black/30 p-2 inline-block">
          Collected ({fmt(collection.totalCollected)}) − Spent ({fmt(budget.totalExpenses)})
        </p>
      </div>

      {/* Category Overview */}
      {categoryOverview.length > 0 && (
        <div>
          <div className="bg-black text-white text-center font-black uppercase py-2 border-y-4 border-black mb-4">
             Categories
          </div>
          <div className="space-y-4">
            {categoryOverview.map((cat, i) => {
              const bgColors = ["bg-neon-lime", "bg-neon-cyan", "bg-neon-yellow", "bg-white"];
              
              // Fallback to Folder if the icon string isn't a valid Lucide component (e.g. if it was an emoji in DB)
              // @ts-ignore
              const IconComp = Icons[cat.icon] || Icons.Folder;

              return (
                <div key={cat._id} className={`brutal-card ${bgColors[i % 4]} p-4 flex flex-col`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-white border-2 border-black rounded-full p-2 shadow-[2px_2px_0px_black] text-black">
                        <IconComp size={24} strokeWidth={2.5} />
                      </span>
                      <span className="text-lg font-black text-black uppercase">{cat.name}</span>
                    </div>
                    <span className="text-sm text-black font-black bg-white px-2 py-1 border-2 border-black">
                      {fmt(cat.totalSpent)} / {fmt(cat.currentBudget)}
                    </span>
                  </div>
                  <ProgressBar percentage={cat.spentPercentage} size="md" color="pink" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activityData?.activities && activityData.activities.length > 0 && (
        <div>
           <div className="bg-black text-white text-center font-black uppercase py-2 border-y-4 border-black mb-4 mt-6">
             Recent Activity
          </div>
          <div className="space-y-3">
            {activityData.activities.slice(0, 5).map((activity, idx) => (
              <ActivityRow key={idx} activity={activity} currency={trip.currency} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: stats.peopleCount, label: "People", color: "bg-neon-lime" },
          { value: stats.categoryCount, label: "Budgets", color: "bg-neon-pink text-white" },
          { value: stats.expenseCount, label: "Expenses", color: "bg-neon-cyan" },
        ].map((stat) => (
          <div key={stat.label} className={`border-4 border-black p-3 text-center shadow-[6px_6px_0px_black] ${stat.color}`}>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-[10px] uppercase font-black tracking-wider border-t-2 border-black mt-1 pt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ activity, currency }: { activity: ActivityItem; currency: string }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
  const time = format(new Date(activity.createdAt), "hh:mm a");

  const wrapperClass = "flex items-center gap-3 px-3 py-3 bg-white border-4 border-black shadow-[4px_4px_0px_black]";

  if (activity.type === "payment") {
    const d = activity.data as Record<string, unknown>;
    const person = d.personId as Record<string, unknown> | undefined;
    return (
      <div className={wrapperClass}>
        <span className="bg-neon-lime border-2 border-black p-1 text-black">
          <ArrowDownLeft size={20} strokeWidth={3} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-black font-black truncate">
            {(person?.name as string) || "Someone"} paid {fmt(d.amount as number)}
          </p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{time}</p>
        </div>
      </div>
    );
  }

  if (activity.type === "expense") {
    const d = activity.data as Record<string, unknown>;
    const cat = d.categoryId as Record<string, unknown> | undefined;
    
    // @ts-ignore
    const IconComp = cat?.icon && Icons[cat.icon] ? Icons[cat.icon] : Icons.Receipt;

    return (
      <div className={wrapperClass}>
        <span className="bg-neon-pink border-2 border-black p-1 text-white">
          <ArrowUpRight size={20} strokeWidth={3} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-black font-black truncate flex items-center gap-1">
            <IconComp size={14} strokeWidth={3} className="text-black inline-block"/> {d.description as string} — {fmt(d.amount as number)}
          </p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{time}</p>
        </div>
      </div>
    );
  }

  if (activity.type === "transfer") {
    const d = activity.data as Record<string, unknown>;
    const from = d.fromCategoryId as Record<string, unknown> | undefined;
    const to = d.toCategoryId as Record<string, unknown> | undefined;
    return (
      <div className={wrapperClass}>
        <span className="bg-neon-cyan border-2 border-black p-1 text-black">
          <RefreshCw size={20} strokeWidth={3} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-black font-black truncate">
            {fmt(d.amount as number)} moved {(from?.name as string) || "?"} → {(to?.name as string) || "?"}
          </p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{time}</p>
        </div>
      </div>
    );
  }

  return null;
}
