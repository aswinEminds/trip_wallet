"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { TripIllustration, StarBurst } from "@/components/Vectors";
import { Wallet, Rocket } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading } = useSWR("/api/trip", fetcher);

  if (data?.trip) {
    router.push(`/trip`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutal-bg">
        <Wallet className="w-24 h-24 animate-pulse-slow text-black" />
      </div>
    );
  }

  return <LandingPage onTripCreated={() => router.push("/trip")} showToast={showToast} />;
}

function LandingPage({
  onTripCreated,
  showToast,
}: {
  onTripCreated: () => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    currency: "INR",
    adminUsername: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate || !form.adminUsername || !form.adminPassword) {
      showToast("Please fill all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/api/trip", form);
      showToast("Trip created! Let's go!", "success");
      onTripCreated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create trip", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-brutal-bg relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute top-12 left-6 animate-float">
          <StarBurst className="text-neon-pink" size={48} />
        </div>
        <div className="absolute top-32 right-8 animate-float" style={{ animationDelay: "1s" }}>
          <StarBurst className="text-neon-cyan" size={64} />
        </div>
        <div className="absolute bottom-40 left-10 animate-float" style={{ animationDelay: "2s" }}>
          <StarBurst className="text-black" size={40} />
        </div>
        
        <div className="text-center animate-fade-in relative z-10 max-w-sm mt-10 bg-white border-4 border-black p-6 shadow-[12px_12px_0px_black] transform ">
          {/* Illustration */}
          <div className="mb-6 animate-pop bg-neon-cyan border-4 border-black p-4 shadow-[6px_6px_0px_black] transform ">
            <TripIllustration className="w-56 h-40 mx-auto" />
          </div>

          {/* App name */}
          <h1 className="text-6xl font-black mb-2 tracking-tighter leading-none">
            <span className="gradient-text-lime block">TRIP</span>
            <span className="gradient-text-pink block">WALLET</span>
          </h1>

          {/* Gang name */}
          <div className="inline-block bg-black text-white px-4 py-2 border-2 border-neon-lime mb-8 transform ">
            <p className="text-xs font-bold tracking-[0.2em] uppercase">
              Rain Raiders ⚡
            </p>
          </div>

          {/* Tagline */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {["Plan it.", "Spend it.", "Track it.", "Settle it."].map((text, i) => {
              const bgColors = ["bg-neon-lime", "bg-neon-pink", "bg-neon-cyan", "bg-neon-yellow"];
              return (
                <span
                  key={text}
                  className={`brutal-tag ${bgColors[i]} transform `}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  {text}
                </span>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowForm(true)}
            className="brutal-btn brutal-btn-lime px-12 py-5 text-xl animate-bounce-in w-full bg-neon-green flex items-center justify-center gap-2"
            style={{ animationDelay: "0.5s" }}
          >
            Start Trip <Rocket size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-8 bg-brutal-bg">
      <div className="w-full max-w-md animate-slide-up bg-white border-4 border-black p-6 shadow-[12px_12px_0px_black]">
        {/* Header */}
        <div className="text-center mb-8 bg-neon-lime p-4 border-4 border-black shadow-[6px_6px_0px_black] transform ">
          <Wallet className="w-16 h-16 mx-auto mb-2 animate-pop text-black" strokeWidth={2.5} />
          <h1 className="text-3xl font-black text-black">START YOUR TRIP</h1>
          <p className="text-black font-bold text-sm mt-1 uppercase tracking-wider">Fill in the details below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Trip Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Kerala Boys Trip"
              className="brutal-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="brutal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="brutal-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="brutal-input"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="pt-4 mt-4 border-t-4 border-dashed border-black">
            <div className="inline-block bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest mb-4 transform ">
              Admin Account
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={form.adminUsername}
                  onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
                  placeholder="admin"
                  className="brutal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  placeholder="••••••••"
                  className="brutal-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="brutal-btn bg-gray-200 flex-1 py-4 px-4"
            >
              BACK
            </button>
            <button
              type="submit"
              disabled={loading}
              className="brutal-btn brutal-btn-pink flex-[2] py-4 px-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "WAIT..." : "GO!"} 
              {!loading && <Rocket size={20} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
