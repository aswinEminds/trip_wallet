"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher, apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { TripIllustration, StarBurst } from "@/components/Vectors";
import { Wallet, Rocket, KeyRound, Users } from "lucide-react";
import { signIn } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();
  // We don't want to automatically redirect based on global active trip anymore,
  // but if the user has an active session, they should go to their trip.
  const { data: session, isLoading } = useSWR("/api/auth/session", fetcher);

  if (session?.user?.tripId) {
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
  const [view, setView] = useState<"home" | "create" | "join">("home");
  const [loading, setLoading] = useState(false);
  
  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    currency: "INR",
    adminUsername: "",
    adminPassword: "",
  });

  // Join Form State
  const [joinForm, setJoinForm] = useState({
    joinCode: "",
    isAdmin: false,
    username: "",
    password: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.startDate || !createForm.endDate || !createForm.adminUsername || !createForm.adminPassword) {
      showToast("Please fill all fields", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost("/api/trip", createForm);
      // Log them in immediately after creating
      const result = await signIn("credentials", {
        joinCode: res.trip.joinCode,
        username: createForm.adminUsername,
        password: createForm.adminPassword,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);
      
      showToast("Trip created! Let's go!", "success");
      onTripCreated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create trip", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.joinCode) {
      showToast("Join code is required", "error");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        joinCode: joinForm.joinCode,
        ...(joinForm.isAdmin && { username: joinForm.username, password: joinForm.password }),
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);
      
      showToast("Joined trip successfully!", "success");
      onTripCreated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to join trip", "error");
    } finally {
      setLoading(false);
    }
  };

  if (view === "home") {
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
        
        <div className="text-center animate-fade-in relative z-10 w-full max-w-sm mt-10 bg-white border-4 border-black p-6 shadow-[12px_12px_0px_black] transform ">
          {/* Illustration */}
          <div className="mb-6 animate-pop bg-neon-cyan border-4 border-black p-4 shadow-[6px_6px_0px_black] transform ">
            <TripIllustration className="w-48 h-32 mx-auto" />
          </div>

          {/* App name */}
          <h1 className="text-5xl font-black mb-2 tracking-tighter leading-none">
            <span className="gradient-text-lime block">TRIP</span>
            <span className="gradient-text-pink block">WALLET</span>
          </h1>

          {/* Gang name */}
          <div className="inline-block bg-black text-white px-4 py-2 border-2 border-neon-lime mb-8 transform ">
            <p className="text-xs font-bold tracking-[0.2em] uppercase">
              Rain Raiders ⚡
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView("join")}
              className="brutal-btn bg-neon-pink px-8 py-4 w-full text-lg flex items-center justify-center gap-2 text-white"
            >
              <Users size={24} strokeWidth={3} /> JOIN TRIP
            </button>
            <button
              onClick={() => setView("create")}
              className="brutal-btn brutal-btn-lime px-8 py-4 w-full text-lg flex items-center justify-center gap-2"
            >
              <Rocket size={24} strokeWidth={3} /> CREATE NEW
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "join") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-8 bg-brutal-bg">
        <div className="w-full max-w-md animate-slide-up bg-white border-4 border-black p-6 shadow-[12px_12px_0px_black]">
          <div className="text-center mb-8 bg-neon-pink p-4 border-4 border-black shadow-[6px_6px_0px_black]">
            <KeyRound className="w-16 h-16 mx-auto mb-2 animate-pop text-white" strokeWidth={2.5} />
            <h1 className="text-3xl font-black text-white">JOIN A TRIP</h1>
            <p className="text-white font-bold text-sm mt-1 uppercase tracking-wider">Enter code below</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Trip Code</label>
              <input
                type="text"
                value={joinForm.joinCode}
                onChange={(e) => setJoinForm({ ...joinForm, joinCode: e.target.value.toUpperCase() })}
                placeholder="E.g. XYZ123"
                className="brutal-input text-center font-mono text-2xl uppercase tracking-widest placeholder:text-gray-300"
                maxLength={6}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={joinForm.isAdmin}
                  onChange={(e) => setJoinForm({ ...joinForm, isAdmin: e.target.checked })}
                  className="w-6 h-6 border-2 border-black accent-neon-pink"
                />
                <span className="font-bold text-black uppercase tracking-wider">I am the Admin</span>
              </label>
            </div>

            {joinForm.isAdmin && (
              <div className="p-4 border-2 border-black bg-gray-50 space-y-4">
                <div>
                  <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={joinForm.username}
                    onChange={(e) => setJoinForm({ ...joinForm, username: e.target.value })}
                    className="brutal-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={joinForm.password}
                    onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
                    className="brutal-input"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              <button type="button" onClick={() => setView("home")} className="brutal-btn bg-gray-200 flex-1 py-4">BACK</button>
              <button type="submit" disabled={loading} className="brutal-btn bg-neon-pink text-white flex-[2] py-4 disabled:opacity-50">
                {loading ? "WAIT..." : "ENTER!"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-8 bg-brutal-bg">
      <div className="w-full max-w-md animate-slide-up bg-white border-4 border-black p-6 shadow-[12px_12px_0px_black]">
        {/* Header */}
        <div className="text-center mb-8 bg-neon-lime p-4 border-4 border-black shadow-[6px_6px_0px_black]">
          <Wallet className="w-16 h-16 mx-auto mb-2 animate-pop text-black" strokeWidth={2.5} />
          <h1 className="text-3xl font-black text-black">CREATE TRIP</h1>
          <p className="text-black font-bold text-sm mt-1 uppercase tracking-wider">Fill in the details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Trip Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Kerala Boys Trip"
              className="brutal-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="brutal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="brutal-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Currency</label>
            <select
              value={createForm.currency}
              onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
              className="brutal-input"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="pt-4 mt-4 border-t-4 border-dashed border-black">
            <div className="inline-block bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest mb-4">
              Admin Account
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={createForm.adminUsername}
                  onChange={(e) => setCreateForm({ ...createForm, adminUsername: e.target.value })}
                  placeholder="admin"
                  className="brutal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={createForm.adminPassword}
                  onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })}
                  placeholder="••••••••"
                  className="brutal-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={() => setView("home")} className="brutal-btn bg-gray-200 flex-1 py-4 px-4">
              BACK
            </button>
            <button type="submit" disabled={loading} className="brutal-btn brutal-btn-lime flex-[2] py-4 px-4 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "WAIT..." : "GO!"} 
              {!loading && <Rocket size={20} strokeWidth={3} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
