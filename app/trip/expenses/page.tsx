"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BottomSheet from "@/components/BottomSheet";
import { format } from "date-fns";
import { ReceiptText, Plus, Trash2, Folder, Receipt } from "lucide-react";
import * as Icons from "lucide-react";

interface ExpenseData {
  _id: string;
  categoryId: { _id: string; name: string; icon: string } | null;
  amount: number;
  description: string;
  note: string;
  paidBy: { _id: string; name: string } | null;
  expenseDate: string;
}

interface CategoryData {
  _id: string; name: string; icon: string;
}

interface PersonData {
  _id: string; name: string;
}

export default function ExpensesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const { showToast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, mutate } = useSWR<{ expenses: ExpenseData[] }>(
    `/api/expenses?${filterCategory ? `categoryId=${filterCategory}&` : ""}${searchQuery ? `search=${searchQuery}` : ""}`,
    fetcher
  );
  const { data: catData } = useSWR<{ categories: CategoryData[] }>("/api/categories", fetcher);
  const { data: peopleData } = useSWR<{ people: PersonData[] }>("/api/people", fetcher);

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    description: "",
    note: "",
    paidBy: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiPost("/api/expenses", {
        ...form,
        amount: Number(form.amount),
      });
      showToast(`Expense added: ${form.description}`, "success");
      if (result.budgetWarning) {
        showToast(`⚠️ Budget exceeded by ₹${result.budgetWarning.shortfall.toLocaleString("en-IN")}`, "warning");
      }
      setForm({ categoryId: "", amount: "", description: "", note: "", paidBy: "", expenseDate: new Date().toISOString().split("T")[0] });
      setShowAdd(false);
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDelete = async (id: string, desc: string) => {
    if (!confirm(`Delete "${desc}"?`)) return;
    try {
      await apiDelete(`/api/expenses/${id}`);
      showToast("Expense deleted", "success");
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const expenses = data?.expenses || [];
  const categories = catData?.categories || [];
  const people = peopleData?.people || [];

  // Group expenses by date
  const grouped = new Map<string, ExpenseData[]>();
  for (const exp of expenses) {
    const dateKey = format(new Date(exp.expenseDate), "dd MMM yyyy");
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(exp);
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-neon-cyan border-4 border-black p-3 shadow-[6px_6px_0px_black] transform ">
        <h1 className="text-2xl font-black uppercase text-black flex items-center gap-2">
           <ReceiptText size={28} strokeWidth={3} /> Expenses
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="brutal-btn brutal-btn-pink px-4 py-2 text-sm transform flex items-center gap-1"
          >
            <Plus size={16} strokeWidth={3} /> Add
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="brutal-input flex-1 py-2"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="brutal-input flex-shrink max-w-[40%] sm:max-w-[50%] py-2 pr-8 truncate"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-center mb-4 text-black">
            <Receipt size={64} strokeWidth={2} />
          </div>
          <p className="text-black font-black uppercase text-xl">No expenses</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([dateKey, exps]) => (
            <div key={dateKey}>
              <div className="inline-block bg-black text-white px-3 py-1 font-black uppercase tracking-wider text-xs border-2 border-white mb-3 transform ">
                {dateKey}
              </div>
              <div className="space-y-3">
                {exps.map((exp) => {
                  // @ts-ignore
                  const IconComp = exp.categoryId?.icon && Icons[exp.categoryId.icon] ? Icons[exp.categoryId.icon] : Folder;
                  return (
                    <div key={exp._id} className="bg-white border-4 border-black p-2 sm:p-3 shadow-[4px_4px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] transition-transform">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="bg-gray-100 border-2 border-black p-1.5 sm:p-2 shadow-[2px_2px_0px_black] text-black flex-shrink-0">
                            <IconComp size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm sm:text-lg text-black truncate uppercase leading-tight">{exp.description}</p>
                            {exp.note && <p className="text-[9px] sm:text-xs font-bold text-gray-600 truncate">{exp.note}</p>}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[8px] sm:text-[9px] font-black uppercase bg-neon-yellow border border-black px-1">{exp.categoryId?.name || "Uncategorized"}</span>
                              <span className="text-[8px] sm:text-[9px] font-black uppercase bg-gray-200 border border-black px-1">By {exp.paidBy?.name || "?"}</span>
                              <span className="text-[8px] sm:text-[9px] font-black uppercase bg-black text-white px-1">{format(new Date(exp.expenseDate), "hh:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-1 sm:ml-2 flex flex-col items-end">
                          <p className="font-black text-neon-pink text-sm sm:text-xl bg-white border-2 border-black px-1 transform ">₹{exp.amount.toLocaleString("en-IN")}</p>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(exp._id, exp.description)}
                              className="text-[9px] sm:text-[10px] font-black uppercase bg-black text-white px-1.5 sm:px-2 py-1 mt-2 hover:bg-neon-red transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={10} className="sm:w-3 sm:h-3" strokeWidth={3} /> <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Sheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Expense">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="brutal-input truncate">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="2400" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Dinner at Munnar" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Note (optional)</label>
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Dinner for everyone" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Paid By</label>
            <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              className="brutal-input truncate">
              <option value="">Select person</option>
              {people.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Date</label>
            <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-cyan w-full py-4 mt-2">
            Add Expense
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
