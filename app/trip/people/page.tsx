"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/components/Toast";
import BottomSheet from "@/components/BottomSheet";
import ProgressBar from "@/components/ProgressBar";
import { Users, User, Edit2, Trash2, History, Plus, PlusCircle } from "lucide-react";

interface PersonData {
  _id: string;
  name: string;
  dueAmount: number;
  totalPaid: number;
  remaining: number;
  paidPercentage: number;
}

interface PaymentData {
  _id: string;
  personId: { _id: string; name: string } | string;
  amount: number;
  note: string;
  paidAt: string;
}

export default function PeoplePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const { showToast } = useToast();
  const { data, mutate } = useSWR<{ people: PersonData[] }>("/api/people", fetcher);

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);
  const [editingPerson, setEditingPerson] = useState<PersonData | null>(null);
  const [personForm, setPersonForm] = useState({ name: "", dueAmount: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", note: "", paidAt: new Date().toISOString().split("T")[0] });

  const { data: paymentsData, mutate: mutatePayments } = useSWR<{ payments: PaymentData[] }>(
    showPayments && selectedPerson ? `/api/payments?personId=${selectedPerson._id}` : null,
    fetcher
  );

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost("/api/people", { name: personForm.name, dueAmount: Number(personForm.dueAmount) });
      showToast(`${personForm.name} added!`, "success");
      setPersonForm({ name: "", dueAmount: "" });
      setShowAddPerson(false);
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleEditPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;
    try {
      await apiPatch(`/api/people/${editingPerson._id}`, {
        name: personForm.name,
        dueAmount: Number(personForm.dueAmount),
      });
      showToast("Updated!", "success");
      setEditingPerson(null);
      setPersonForm({ name: "", dueAmount: "" });
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDeletePerson = async (person: PersonData) => {
    if (!confirm(`Remove ${person.name}?`)) return;
    try {
      await apiDelete(`/api/people/${person._id}`);
      showToast(`${person.name} removed`, "success");
      mutate();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    try {
      await apiPost("/api/payments", {
        personId: selectedPerson._id,
        amount: Number(paymentForm.amount),
        note: paymentForm.note,
        paidAt: paymentForm.paidAt,
      });
      showToast(`₹${paymentForm.amount} recorded from ${selectedPerson.name}`, "success");
      setPaymentForm({ amount: "", note: "", paidAt: new Date().toISOString().split("T")[0] });
      setShowPayment(false);
      mutate();
      if (showPayments) mutatePayments();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Delete this payment?")) return;
    try {
      await apiDelete(`/api/payments/${paymentId}`);
      showToast("Payment deleted", "success");
      mutate();
      mutatePayments();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const people = data?.people || [];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const totalExpected = people.reduce((s, p) => s + p.dueAmount, 0);
  const totalCollected = people.reduce((s, p) => s + p.totalPaid, 0);
  const totalPending = totalExpected - totalCollected;

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 bg-white border-4 border-black p-3 shadow-[6px_6px_0px_black] transform ">
        <h1 className="text-2xl font-black uppercase flex items-center gap-2">
          <Users size={28} strokeWidth={3} /> People
        </h1>
        {isAdmin && (
          <button
            onClick={() => { setPersonForm({ name: "", dueAmount: "" }); setShowAddPerson(true); }}
            className="brutal-btn brutal-btn-lime px-4 py-2 text-sm flex items-center gap-1"
          >
            <Plus size={16} strokeWidth={3} /> Add
          </button>
        )}
      </div>

      {/* Collection Summary */}
      <div className="bg-black text-white border-4 border-black p-4 mb-5 shadow-[6px_6px_0px_#ccff00] transform ">
        <div className="grid grid-cols-3 gap-2 text-center divide-x-2 divide-white">
          <div>
            <p className="text-[10px] text-gray-300 uppercase font-black">Expected</p>
            <p className="text-sm font-black">{fmt(totalExpected)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-300 uppercase font-black">Collected</p>
            <p className="text-sm font-black text-neon-lime">{fmt(totalCollected)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-300 uppercase font-black">Pending</p>
            <p className="text-sm font-black text-neon-pink">{fmt(totalPending)}</p>
          </div>
        </div>
      </div>

      {/* People List */}
      {people.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-center mb-4">
            <User size={64} strokeWidth={2} />
          </div>
          <p className="text-black font-black uppercase text-xl">No people yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {people.map((person, i) => {
             const bgColors = ["bg-neon-lime", "bg-neon-cyan", "bg-neon-yellow", "bg-white", "bg-neon-pink"];
             const color = bgColors[i % 5];
             const textColor = color === "bg-neon-pink" || color === "bg-black" ? "text-white" : "text-black";
             
             return (
            <div key={person._id} className={`${color} border-4 border-black p-4 shadow-[6px_6px_0px_black] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_black]`}>
              <div className={`flex items-center justify-between mb-3 ${textColor}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-xl font-black text-black shadow-[2px_2px_0px_black] transform ">
                    {person.name[0].toUpperCase()}
                  </div>
                  <span className="font-black text-xl uppercase">{person.name}</span>
                </div>
                <div className="text-right bg-white text-black px-2 py-1 border-2 border-black transform ">
                  <p className="text-sm font-black">{fmt(person.totalPaid)}</p>
                  <p className="text-[9px] uppercase font-bold text-gray-600">of {fmt(person.dueAmount)}</p>
                </div>
              </div>

              <div className="bg-white p-1 border-2 border-black">
                <ProgressBar percentage={person.paidPercentage} color="pink" size="md" />
              </div>

              <div className={`flex items-center justify-between mt-3 ${textColor}`}>
                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 flex items-center gap-1">
                  {person.remaining === 0 ? "PAID" : `${fmt(person.remaining)} LEFT`}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setSelectedPerson(person); setShowPayments(true); }}
                    className="p-2 text-[10px] font-black uppercase bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                    title="History"
                  >
                    <History size={16} strokeWidth={3} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedPerson(person);
                          setPaymentForm({ amount: "", note: "", paidAt: new Date().toISOString().split("T")[0] });
                          setShowPayment(true);
                        }}
                        className="p-2 text-[10px] font-black uppercase bg-neon-lime text-black border-2 border-black hover:bg-black hover:text-neon-lime transition-colors flex items-center justify-center"
                        title="Add Payment"
                      >
                        <PlusCircle size={16} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPerson(person);
                          setPersonForm({ name: person.name, dueAmount: String(person.dueAmount) });
                        }}
                        className="p-2 text-[10px] font-black uppercase bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 size={16} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person)}
                        className="p-2 text-[10px] font-black uppercase bg-neon-red text-white border-2 border-black hover:bg-black hover:text-neon-red transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Add Person Sheet */}
      <BottomSheet isOpen={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add Person">
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Name</label>
            <input type="text" value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
              placeholder="Arun" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Amount Due (₹)</label>
            <input type="number" value={personForm.dueAmount} onChange={(e) => setPersonForm({ ...personForm, dueAmount: e.target.value })}
              placeholder="4000" className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2">
            Add Person
          </button>
        </form>
      </BottomSheet>

      {/* Edit Person Sheet */}
      <BottomSheet isOpen={!!editingPerson} onClose={() => setEditingPerson(null)} title="Edit Person">
        <form onSubmit={handleEditPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Name</label>
            <input type="text" value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
              className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Amount Due (₹)</label>
            <input type="number" value={personForm.dueAmount} onChange={(e) => setPersonForm({ ...personForm, dueAmount: e.target.value })}
              className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2">
            Save Changes
          </button>
        </form>
      </BottomSheet>

      {/* Record Payment Sheet */}
      <BottomSheet isOpen={showPayment} onClose={() => setShowPayment(false)} title={`Pay: ${selectedPerson?.name || ""}`}>
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {selectedPerson && (
            <div className="bg-white border-4 border-black p-3 text-sm font-black uppercase shadow-[4px_4px_0px_black] mb-4 transform ">
              <div className="flex justify-between border-b-2 border-black pb-1 mb-1">
                <span>Due</span><span>{fmt(selectedPerson.dueAmount)}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-1 mb-1">
                <span>Paid</span><span className="text-neon-pink">{fmt(selectedPerson.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Left</span><span className="text-neon-red">{fmt(selectedPerson.remaining)}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Amount (₹)</label>
            <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              placeholder="2000" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Note</label>
            <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              placeholder="Cash received" className="brutal-input" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">Date</label>
            <input type="date" value={paymentForm.paidAt} onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
              className="brutal-input" />
          </div>
          <button type="submit" className="brutal-btn brutal-btn-lime w-full py-4 mt-2">
            Record Payment
          </button>
        </form>
      </BottomSheet>

      {/* Payment History Sheet */}
      <BottomSheet isOpen={showPayments} onClose={() => { setShowPayments(false); setSelectedPerson(null); }} title={`History: ${selectedPerson?.name || ""}`}>
        {paymentsData?.payments && paymentsData.payments.length > 0 ? (
          <div className="space-y-3">
            {paymentsData.payments.map((p) => (
              <div key={p._id} className="bg-white border-4 border-black p-3 flex items-center justify-between shadow-[4px_4px_0px_black]">
                <div>
                  <p className="text-lg font-black text-black">{fmt(p.amount)}</p>
                  {p.note && <p className="text-xs font-bold text-gray-600 uppercase">{p.note}</p>}
                  <p className="text-[10px] text-white bg-black px-1.5 py-0.5 inline-block mt-1 font-bold">
                    {new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePayment(p._id)}
                    className="hover:scale-110 transition-transform bg-neon-red text-white p-2 border-2 border-black"
                  >
                    <Trash2 size={20} strokeWidth={3} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center font-black uppercase border-4 border-black p-4 bg-gray-100">No payments yet</p>
        )}
      </BottomSheet>
    </div>
  );
}
