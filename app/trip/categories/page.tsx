"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BottomSheet from "@/components/BottomSheet";
import ProgressBar from "@/components/ProgressBar";
import { FolderOpen, ArrowRightLeft, Plus, Edit2, Trash2, Folder } from "lucide-react";
import * as Icons from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  icon: string;
  initialBudget: number;
  transfersIn: number;
  transfersOut: number;
  currentBudget: number;
  totalSpent: number;
  remaining: number;
  spentPercentage: number;
}

const ICON_OPTIONS = [
  "Utensils", "Hotel", "Bus", "Beer", "Ticket", "ShoppingCart", "Fuel", "Music", 
  "Palmtree", "Gamepad2", "Luggage", "Coffee", "Pizza", "Clapperboard", "Pill", "Car"
];

export default function CategoriesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const { showToast } = useToast();
  const { data, mutate } = useSWR<{ categories: CategoryData[] }>("/api/categories", fetcher);

  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryData | null>(null);
  const [selectedCat, setSelectedCat] = useState<CategoryData | null>(null);

  const [catForm, setCatForm] = useState({ name: "", icon: "Utensils", initialBudget: "" });
  const [transferForm, setTransferForm] = useState({ fromCategoryId: "", toCategoryId: "", amount: "", reason: "" });

  const categories = data?.categories || [];
  const totalBudget = categories.reduce((s, c) => s + c.currentBudget, 0);
  const totalSpent = categories.reduce((s, c) => s + c.totalSpent, 0);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost("/api/categories", { name: catForm.name, icon: catForm.icon, initialBudget: Number(catForm.initialBudget) });
      showToast(`Category ${catForm.name} created!`, "success");
      setCatForm({ name: "", icon: "Utensils", initialBudget: "" });
      setShowAdd(false);
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    try {
      await apiPatch(`/api/categories/${editingCat._id}`, {
        name: catForm.name,
        icon: catForm.icon,
        initialBudget: Number(catForm.initialBudget),
      });
      showToast("Category updated!", "success");
      setEditingCat(null);
      setCatForm({ name: "", icon: "Utensils", initialBudget: "" });
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDeleteCategory = async (cat: CategoryData) => {
    if (!confirm(`Delete ${cat.name}?`)) return;
    try {
      await apiDelete(`/api/categories/${cat._id}`);
      showToast("Category deleted", "success");
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost("/api/transfers", {
        fromCategoryId: transferForm.fromCategoryId,
        toCategoryId: transferForm.toCategoryId,
        amount: Number(transferForm.amount),
        reason: transferForm.reason,
      });
      showToast("Budget transferred!", "success");
      setTransferForm({ fromCategoryId: "", toCategoryId: "", amount: "", reason: "" });
      setShowTransfer(false);
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-neon-yellow border-4 border-black p-3 shadow-[6px_6px_0px_black] transform ">
        <h1 className="text-2xl font-black uppercase text-black flex items-center gap-2">
          <FolderOpen size={28} strokeWidth={3} /> Budget
        </h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowTransfer(true)}
              className="brutal-btn brutal-btn-ghost px-2 py-1 text-xs flex items-center gap-1">
              <ArrowRightLeft size={14} strokeWidth={3} /> Move
            </button>
            <button onClick={() => { setCatForm({ name: "", icon: "Utensils", initialBudget: "" }); setShowAdd(true); }}
              className="brutal-btn brutal-btn-lime px-3 py-1 text-xs flex items-center gap-1">
              <Plus size={14} strokeWidth={3} /> Add
            </button>
          </div>
        )}
      </div>

      {/* Budget Summary */}
      <div className="bg-white border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_black] transform ">
        <div className="grid grid-cols-2 gap-4 divide-x-4 divide-black">
          <div className="pr-4">
            <p className="text-[10px] text-black font-black uppercase tracking-wider mb-1">Total Budget</p>
            <p className="text-2xl font-black bg-neon-lime inline-block px-2 border-2 border-black transform ">₹{totalBudget.toLocaleString("en-IN")}</p>
          </div>
          <div className="pl-4">
            <p className="text-[10px] text-black font-black uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-2xl font-black bg-neon-pink text-white inline-block px-2 border-2 border-black transform ">₹{totalSpent.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-center mb-4 text-black">
            <FolderOpen size={64} strokeWidth={2} />
          </div>
          <p className="text-black font-black uppercase text-xl">No categories</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => {
             const bgColors = ["bg-neon-lime", "bg-neon-pink text-white", "bg-neon-cyan", "bg-white", "bg-neon-yellow"];
             const color = bgColors[i % 5];
             
             // @ts-ignore
             const IconComp = cat.icon && Icons[cat.icon] ? Icons[cat.icon] : Folder;
             
             return (
            <div
              key={cat._id}
              className={`border-4 border-black p-4 cursor-pointer shadow-[6px_6px_0px_black] hover:-translate-y-1 transition-transform ${color}`}
              onClick={() => setSelectedCat(selectedCat?._id === cat._id ? null : cat)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-white border-2 border-black rounded-sm p-2 shadow-[2px_2px_0px_black] text-black">
                    <IconComp size={24} strokeWidth={2.5} />
                  </span>
                  <span className="font-black text-xl uppercase tracking-wide">{cat.name}</span>
                </div>
                <span className={`text-sm font-black bg-white text-black px-2 py-1 border-2 border-black transform `}>
                  ₹{cat.remaining.toLocaleString("en-IN")} left
                </span>
              </div>

              <ProgressBar percentage={cat.spentPercentage} />

              <div className="flex justify-between text-[10px] font-black uppercase mt-3 bg-black text-white p-1">
                <span>₹{cat.totalSpent.toLocaleString("en-IN")} spent</span>
                <span>₹{cat.currentBudget.toLocaleString("en-IN")} budget</span>
              </div>

              {/* Expanded Details */}
              {selectedCat?._id === cat._id && (
                <div className="mt-4 pt-4 border-t-4 border-black border-dashed space-y-2 text-xs font-bold uppercase animate-[slide-down_0.2s_ease-out]">
                  <div className="flex justify-between bg-white/50 p-1 text-black"><span>Initial</span><span>₹{cat.initialBudget.toLocaleString("en-IN")}</span></div>
                  {cat.transfersIn > 0 && <div className="flex justify-between bg-neon-green p-1 text-black"><span>In</span><span>+₹{cat.transfersIn.toLocaleString("en-IN")}</span></div>}
                  {cat.transfersOut > 0 && <div className="flex justify-between bg-neon-red text-white p-1"><span>Out</span><span>-₹{cat.transfersOut.toLocaleString("en-IN")}</span></div>}
                  <div className="flex justify-between bg-black text-white p-1"><span>Current</span><span>₹{cat.currentBudget.toLocaleString("en-IN")}</span></div>

                  {isAdmin && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCat(cat);
                          setCatForm({ name: cat.name, icon: cat.icon, initialBudget: String(cat.initialBudget) });
                        }}
                        className="brutal-btn flex-1 py-2 text-xs bg-white flex items-center justify-center gap-1 text-black"
                      >
                        <Edit2 size={14} strokeWidth={3} /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                        className="brutal-btn bg-neon-red text-white flex-1 py-2 text-xs border-black flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} strokeWidth={3} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* Add Category Sheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Category">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((iconName) => {
                // @ts-ignore
                const IconComp = Icons[iconName] || Folder;
                return (
                <button key={iconName} type="button" onClick={() => setCatForm({ ...catForm, icon: iconName })}
                  className={`w-12 h-12 flex items-center justify-center border-4 border-black transition-transform ${catForm.icon === iconName ? "bg-neon-lime shadow-[4px_4px_0px_black] scale-110 text-black" : "bg-white hover:bg-gray-100 text-black"}`}>
                  <IconComp size={24} strokeWidth={2.5} />
                </button>
              )})}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Name</label>
            <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              placeholder="Food" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Budget (₹)</label>
            <input type="number" value={catForm.initialBudget} onChange={(e) => setCatForm({ ...catForm, initialBudget: e.target.value })}
              placeholder="25000" className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2 flex justify-center items-center gap-2">
            <Plus size={20} strokeWidth={3} /> Create Category
          </button>
        </form>
      </BottomSheet>

      {/* Edit Category Sheet */}
      <BottomSheet isOpen={!!editingCat} onClose={() => setEditingCat(null)} title="Edit Category">
        <form onSubmit={handleEditCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((iconName) => {
                // @ts-ignore
                const IconComp = Icons[iconName] || Folder;
                return (
                <button key={iconName} type="button" onClick={() => setCatForm({ ...catForm, icon: iconName })}
                  className={`w-12 h-12 flex items-center justify-center border-4 border-black transition-transform ${catForm.icon === iconName ? "bg-neon-lime shadow-[4px_4px_0px_black] scale-110 text-black" : "bg-white hover:bg-gray-100 text-black"}`}>
                  <IconComp size={24} strokeWidth={2.5} />
                </button>
              )})}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Name</label>
            <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Initial Budget (₹)</label>
            <input type="number" value={catForm.initialBudget} onChange={(e) => setCatForm({ ...catForm, initialBudget: e.target.value })}
              className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2">
            Save Changes
          </button>
        </form>
      </BottomSheet>

      {/* Transfer Sheet */}
      <BottomSheet isOpen={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Budget">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">From</label>
            <select value={transferForm.fromCategoryId} onChange={(e) => setTransferForm({ ...transferForm, fromCategoryId: e.target.value })}
              className="brutal-input truncate">
              <option value="">Select source</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name} (₹{c.remaining.toLocaleString("en-IN")} left)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">To</label>
            <select value={transferForm.toCategoryId} onChange={(e) => setTransferForm({ ...transferForm, toCategoryId: e.target.value })}
              className="brutal-input truncate">
              <option value="">Select destination</option>
              {categories.filter((c) => c._id !== transferForm.fromCategoryId).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Amount (₹)</label>
            <input type="number" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              placeholder="3000" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Reason (optional)</label>
            <input type="text" value={transferForm.reason} onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
              placeholder="Budget not needed" className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-cyan w-full py-4 mt-2 flex justify-center items-center gap-2">
             <ArrowRightLeft size={20} strokeWidth={3} /> Transfer Budget
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
