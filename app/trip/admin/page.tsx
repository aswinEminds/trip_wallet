"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BottomSheet from "@/components/BottomSheet";
import { Settings, Lock, Edit2, ClipboardList, AlertTriangle, LogOut } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const { showToast } = useToast();
  const router = useRouter();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [showClearTrip, setShowClearTrip] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { data: tripData, mutate: mutateTrip } = useSWR("/api/trip", fetcher);
  const trip = tripData?.trip;

  const [editForm, setEditForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    currency: "INR",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: loginForm.username,
        password: loginForm.password,
      });
      if (result?.error) {
        showToast("Invalid username or password", "error");
      } else {
        showToast("Logged in as admin!", "success");
      }
    } catch {
      showToast("Login failed", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    showToast("Logged out", "info");
  };

  const handleEditTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPatch("/api/trip", editForm);
      showToast("Trip updated!", "success");
      setShowEditTrip(false);
      mutateTrip();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleClearTrip = async () => {
    try {
      await apiDelete("/api/trip", { confirmText });
      showToast("Trip cleared. Starting fresh!", "success");
      setShowClearTrip(false);
      router.push("/");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const expectedConfirm = trip ? trip.name.toUpperCase().replace(/\s+/g, "-") + "-DELETE" : "";

  if (status === "loading") {
    return (
      <div className="px-4 pt-6">
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="px-4 pt-8 animate-fade-in">
        <h1 className="text-3xl font-black mb-8 text-center uppercase bg-white border-4 border-black p-4 shadow-[8px_8px_0px_black] flex items-center justify-center gap-2 transform ">
          <Settings size={36} strokeWidth={3} /> ADMIN
        </h1>

        <div className="bg-neon-yellow border-4 border-black p-6 max-w-sm mx-auto shadow-[12px_12px_0px_black] transform ">
          <div className="text-center mb-6 bg-white border-4 border-black py-4 shadow-[4px_4px_0px_black]">
            <div className="flex justify-center mb-2">
              <Lock size={48} strokeWidth={2.5} />
            </div>
            <p className="text-black font-black uppercase text-sm">Login Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                className="brutal-input"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                className="brutal-input"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="brutal-btn brutal-btn-pink w-full py-4 mt-2 text-lg"
            >
              {loginLoading ? "WAIT..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6 bg-white border-4 border-black p-3 shadow-[6px_6px_0px_black] transform ">
        <h1 className="text-2xl font-black uppercase flex items-center gap-2">
          <Settings size={28} strokeWidth={3} /> ADMIN
        </h1>
        <button
          onClick={handleLogout}
          className="brutal-btn brutal-btn-ghost px-3 py-2 text-xs flex items-center gap-1"
        >
          <LogOut size={16} strokeWidth={3} /> LOGOUT
        </button>
      </div>

      <div className="bg-black text-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_#00f0ff] transform ">
        <p className="text-[10px] text-gray-300 uppercase font-black mb-1">Logged in as</p>
        <p className="font-black text-neon-cyan text-lg flex items-center gap-2">
          {session.user?.name} <Lock size={20} strokeWidth={3} />
        </p>
      </div>

      {/* Admin Actions */}
      <div className="space-y-4">
        {/* Edit Trip */}
        <button
          onClick={() => {
            if (trip) {
              setEditForm({
                name: trip.name,
                startDate: trip.startDate.split("T")[0],
                endDate: trip.endDate.split("T")[0],
                currency: trip.currency,
              });
            }
            setShowEditTrip(true);
          }}
          className="w-full bg-neon-lime border-4 border-black p-4 text-left flex items-center gap-4 shadow-[6px_6px_0px_black] hover:-translate-y-1 transition-transform"
        >
          <span className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_black]">
            <Edit2 size={32} strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-black text-lg uppercase text-black">Edit Trip</p>
            <p className="text-[10px] font-bold text-black uppercase">Change name, dates, currency</p>
          </div>
        </button>

        {/* Settlement */}
        <button
          onClick={() => router.push("/trip/settlement")}
          className="w-full bg-neon-cyan border-4 border-black p-4 text-left flex items-center gap-4 shadow-[6px_6px_0px_black] hover:-translate-y-1 transition-transform"
        >
          <span className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_black]">
            <ClipboardList size={32} strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-black text-lg uppercase text-black">Settlement</p>
            <p className="text-[10px] font-bold text-black uppercase">Final financial tally</p>
          </div>
        </button>

        {/* Clear Trip */}
        <button
          onClick={() => { setConfirmText(""); setShowClearTrip(true); }}
          className="w-full bg-neon-red text-white border-4 border-black p-4 text-left flex items-center gap-4 shadow-[6px_6px_0px_black] hover:-translate-y-1 transition-transform mt-8"
        >
          <span className="bg-black border-2 border-white p-2 shadow-[2px_2px_0px_white]">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-black text-lg uppercase text-white">Clear Trip</p>
            <p className="text-[10px] font-bold uppercase text-white">Permanently delete everything</p>
          </div>
        </button>
      </div>

      {/* Edit Trip Sheet */}
      <BottomSheet isOpen={showEditTrip} onClose={() => setShowEditTrip(false)} title="Edit Trip">
        <form onSubmit={handleEditTrip} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Trip Name</label>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="brutal-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">Start</label>
              <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                className="brutal-input px-2" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">End</label>
              <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                className="brutal-input px-2" />
            </div>
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2">
            Save Changes
          </button>
        </form>
      </BottomSheet>

      {/* Clear Trip Sheet */}
      <BottomSheet isOpen={showClearTrip} onClose={() => setShowClearTrip(false)} title="CLEAR TRIP">
        <div className="space-y-5">
          <div className="bg-neon-red text-white border-4 border-black p-4 shadow-[4px_4px_0px_black]">
            <p className="text-lg font-black uppercase mb-1 flex items-center gap-2">
              <AlertTriangle size={24} strokeWidth={3} /> DANGER ZONE!
            </p>
            <p className="text-xs font-bold uppercase">This permanently deletes ALL trip data. No undo.</p>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">
              Type <span className="bg-black text-neon-lime px-2 py-0.5 border-2 border-black inline-block ">{expectedConfirm}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedConfirm}
              className="brutal-input border-neon-red bg-white focus:bg-red-50 text-center uppercase"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowClearTrip(false)}
              className="brutal-btn brutal-btn-ghost flex-1 py-4"
            >
              CANCEL
            </button>
            <button
              onClick={handleClearTrip}
              disabled={confirmText !== expectedConfirm}
              className="brutal-btn brutal-btn-pink flex-[2] py-4 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
            >
              NUKE IT
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
