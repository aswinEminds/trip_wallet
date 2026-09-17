"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format } from "date-fns";
import { StarBurst } from "@/components/Vectors";
import { ClipboardList, PartyPopper, Hourglass, AlertTriangle } from "lucide-react";
import * as Icons from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the entire PDF Wrapper to completely bypass Next.js SSR
const PDFWrapper = dynamic(
  () => import("@/components/PDFWrapper"),
  { ssr: false, loading: () => <button className="brutal-btn brutal-btn-ghost px-4 py-4 w-full text-center">Loading PDF Generator...</button> }
);

interface DashboardData {
  trip: { name: string; startDate: string; endDate: string; currency: string };
  collection: {
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    collectionPercentage: number;
    everyonePaid: boolean;
  };
  budget: {
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
  };
  cash: { cashInHand: number };
  categoryOverview: {
    _id: string; name: string; icon: string;
    currentBudget: number; totalSpent: number; remaining: number;
  }[];
  stats: { peopleCount: number; pendingPeople: number };
}

interface PersonData {
  _id: string; name: string; dueAmount: number; totalPaid: number; remaining: number;
}

export default function SettlementPage() {
  const { data } = useSWR<DashboardData>("/api/dashboard", fetcher);
  const { data: peopleData } = useSWR<{ people: PersonData[] }>("/api/people", fetcher);

  if (!data) {
    return (
      <div className="px-4 pt-6 space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}
      </div>
    );
  }

  const { trip, collection, budget, cash, categoryOverview, stats } = data;
  const people = peopleData?.people || [];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="px-4 pt-8 pb-4 animate-fade-in relative">
      <div className="absolute top-6 left-4 animate-float opacity-50"><StarBurst className="text-neon-pink" size={32} /></div>
      <div className="absolute top-10 right-4 animate-float opacity-50"><StarBurst className="text-neon-cyan" size={40} /></div>
      
      <div className="bg-white border-4 border-black p-4 mb-8 shadow-[8px_8px_0px_black] text-center transform relative z-10">
        <h1 className="text-3xl font-black uppercase flex items-center justify-center gap-2">
          <ClipboardList size={36} strokeWidth={3} /> SETTLEMENT
        </h1>
        <p className="bg-black text-white inline-block px-3 py-1 font-bold uppercase mt-2 border-2 border-black">{trip.name}</p>
      </div>

      {/* PDF Export Button (Client Side Only) */}
      <div className="mb-6 transform ">
        <PDFWrapper data={data} people={people} />
      </div>

      {/* Trip Info */}
      <div className="bg-neon-lime border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_black] transform ">
        <p className="text-xs text-black uppercase font-black mb-3 bg-white inline-block px-2 border-2 border-black">Trip Info</p>
        <div className="space-y-2 text-sm font-bold uppercase">
          <div className="flex justify-between border-b-2 border-black border-dashed pb-1"><span>Dates</span><span>{format(new Date(trip.startDate), "dd MMM")} → {format(new Date(trip.endDate), "dd MMM")}</span></div>
          <div className="flex justify-between border-b-2 border-black border-dashed pb-1"><span>Currency</span><span>{trip.currency}</span></div>
          <div className="flex justify-between"><span>People</span><span>{stats.peopleCount}</span></div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-white border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_black]">
        <p className="text-xs text-black uppercase font-black mb-3 bg-neon-pink text-white inline-block px-2 border-2 border-black transform ">Budget</p>
        <div className="space-y-2 text-sm font-black uppercase">
          <div className="flex justify-between"><span>Total</span><span>{fmt(budget.totalBudget)}</span></div>
          <div className="flex justify-between text-neon-pink"><span>Spent</span><span>{fmt(budget.totalExpenses)}</span></div>
          <div className="border-t-4 border-black pt-2 flex justify-between text-lg mt-2">
            <span>Remaining</span>
            <span className={`bg-black text-white px-2 py-0.5 border-2 border-black transform  ${budget.remainingBudget >= 0 ? "text-neon-lime" : "text-neon-red"}`}>{fmt(budget.remainingBudget)}</span>
          </div>
        </div>
      </div>

      {/* Collection Summary */}
      <div className="bg-white border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_black]">
        <p className="text-xs text-black uppercase font-black mb-3 bg-neon-cyan inline-block px-2 border-2 border-black transform ">Collection</p>
        <div className="space-y-2 text-sm font-black uppercase">
          <div className="flex justify-between"><span>Expected</span><span>{fmt(collection.totalExpected)}</span></div>
          <div className="flex justify-between text-neon-cyan text-shadow-sm"><span>Collected</span><span>{fmt(collection.totalCollected)}</span></div>
          <div className="border-t-4 border-black pt-2 flex justify-between text-lg mt-2">
            <span>Pending</span>
            <span className={`bg-black text-white px-2 py-0.5 border-2 border-black transform  ${collection.totalPending === 0 ? "text-neon-lime" : "text-neon-yellow"}`}>{fmt(collection.totalPending)}</span>
          </div>
        </div>
      </div>

      {/* Cash Position */}
      <div className="bg-neon-yellow border-4 border-black p-5 mb-6 shadow-[8px_8px_0px_black] transform ">
        <p className="text-sm text-black uppercase font-black mb-3 bg-white inline-block px-3 py-1 border-2 border-black">Cash Position</p>
        <div className="space-y-2 text-sm font-black uppercase">
          <div className="flex justify-between"><span>Collected</span><span>{fmt(collection.totalCollected)}</span></div>
          <div className="flex justify-between"><span>− Spent</span><span className="text-neon-pink bg-white px-1 border-2 border-black">{fmt(budget.totalExpenses)}</span></div>
          <div className="border-t-4 border-black pt-3 flex justify-between text-2xl mt-2">
            <span>In Hand</span>
            <span className={`bg-black text-white px-3 py-1 border-2 border-white transform  ${cash.cashInHand >= 0 ? "text-neon-cyan" : "text-neon-red"}`}>{fmt(cash.cashInHand)}</span>
          </div>
        </div>
      </div>

      {/* Person-wise Summary */}
      {people.length > 0 && (
        <div className="bg-white border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_black]">
          <p className="text-xs text-black uppercase font-black mb-3 bg-black text-white inline-block px-2 border-2 border-black">Person-wise</p>
          <div className="space-y-3">
            {people.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm font-black uppercase border-b-2 border-black border-dashed pb-2 last:border-0">
                <span className="flex items-center gap-2">
                  <span className={`w-3 h-3 border-2 border-black ${p.remaining === 0 ? "bg-neon-lime" : "bg-neon-pink"}`} />
                  {p.name}
                </span>
                <span>
                  <span className="text-neon-cyan text-shadow-sm">{fmt(p.totalPaid)}</span> / {fmt(p.dueAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-wise Summary */}
      {categoryOverview.length > 0 && (
        <div className="bg-white border-4 border-black p-8 mb-8 shadow-[6px_6px_0px_black]">
          <p className="text-xs text-black uppercase font-black mb-3 bg-black text-white inline-block px-2 border-2 border-black">Category-wise</p>
          <div className="space-y-3">
            {categoryOverview.map((cat) => {
              // @ts-ignore
              const IconComp = cat.icon && Icons[cat.icon] ? Icons[cat.icon] : Icons.Folder;
              return (
              <div key={cat._id} className="flex items-center justify-between text-sm font-black uppercase border-b-2 border-black border-dashed pb-2 last:border-0">
                <span className="flex items-center gap-2">
                  <span className="bg-gray-100 border-2 border-black p-1 text-black"><IconComp size={16} strokeWidth={2.5}/></span>
                  {cat.name}
                </span>
                <span>
                  <span className="text-neon-pink text-shadow-sm">{fmt(cat.totalSpent)}</span> / {fmt(cat.currentBudget)}
                </span>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Final Status */}
      <div className="bg-white border-4 border-black p-6 text-center mb-6 shadow-[10px_10px_0px_black] transform ">
        {collection.everyonePaid && budget.remainingBudget >= 0 ? (
          <div>
            <div className="flex justify-center mb-4 text-neon-green">
               <PartyPopper size={64} strokeWidth={2} />
            </div>
            <p className="text-2xl font-black text-black uppercase bg-neon-lime inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_black] transform ">All Settled!</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-4 text-neon-orange animate-pulse">
               <Hourglass size={64} strokeWidth={2} />
            </div>
            <p className="text-xl font-black text-black uppercase bg-neon-yellow inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_black] transform ">In Progress</p>
            <div className="mt-4 space-y-2 text-sm font-black uppercase">
              {!collection.everyonePaid && (
                 <p className="text-black bg-neon-pink text-white px-2 py-1 inline-block border-2 border-black flex items-center justify-center gap-2 mx-auto max-w-fit">
                   <AlertTriangle size={16} strokeWidth={3} /> {fmt(collection.totalPending)} PENDING ({stats.pendingPeople} left)
                 </p>
              )}
              {budget.remainingBudget < 0 && (
                <p className="text-white bg-neon-red px-2 py-1 inline-block border-2 border-black mt-1 flex items-center justify-center gap-2 mx-auto max-w-fit">
                  <AlertTriangle size={16} strokeWidth={3} /> BUDGET BROKEN BY {fmt(Math.abs(budget.remainingBudget))}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
