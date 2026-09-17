import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/trip";
import { Person } from "@/lib/models/person";
import { Payment } from "@/lib/models/payment";
import { Category } from "@/lib/models/category";
import { Expense } from "@/lib/models/expense";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { requireTrip } from "@/lib/auth";

export async function GET() {
  const auth = await requireTrip();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId).select("-adminPasswordHash");
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const [people, payments, categories, expenses, transfers] = await Promise.all([
      Person.find({ tripId: trip._id }),
      Payment.find({ tripId: trip._id }),
      Category.find({ tripId: trip._id }),
      Expense.find({ tripId: trip._id }),
      BudgetTransfer.find({ tripId: trip._id }),
    ]);

    // Collection summary
    const totalExpected = people.reduce((s, p) => s + p.dueAmount, 0);
    const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const collectionPercentage = totalExpected > 0
      ? Math.min(100, Math.round((totalCollected / totalExpected) * 100))
      : 0;

    // Budget summary
    const totalBudget = categories.reduce((s, c) => s + c.initialBudget, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const remainingBudget = totalBudget - totalExpenses;

    // Cash position
    const cashInHand = totalCollected - totalExpenses;

    // Category overview
    const spentByCategory = new Map<string, number>();
    for (const exp of expenses) {
      const key = exp.categoryId.toString();
      spentByCategory.set(key, (spentByCategory.get(key) || 0) + exp.amount);
    }
    const transfersInMap = new Map<string, number>();
    const transfersOutMap = new Map<string, number>();
    for (const t of transfers) {
      const fk = t.fromCategoryId.toString();
      const tk = t.toCategoryId.toString();
      transfersOutMap.set(fk, (transfersOutMap.get(fk) || 0) + t.amount);
      transfersInMap.set(tk, (transfersInMap.get(tk) || 0) + t.amount);
    }

    const categoryOverview = categories.map((cat) => {
      const catId = cat._id.toString();
      const tIn = transfersInMap.get(catId) || 0;
      const tOut = transfersOutMap.get(catId) || 0;
      const currentBudget = cat.initialBudget + tIn - tOut;
      const spent = spentByCategory.get(catId) || 0;
      return {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon,
        currentBudget,
        totalSpent: spent,
        remaining: currentBudget - spent,
        spentPercentage: currentBudget > 0 ? Math.min(100, Math.round((spent / currentBudget) * 100)) : 0,
      };
    });

    // People status
    const paymentsByPerson = new Map<string, number>();
    for (const p of payments) {
      const key = p.personId.toString();
      paymentsByPerson.set(key, (paymentsByPerson.get(key) || 0) + p.amount);
    }
    const pendingPeople = people.filter((p) => {
      const paid = paymentsByPerson.get(p._id.toString()) || 0;
      return paid < p.dueAmount;
    }).length;

    return NextResponse.json({
      trip: {
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.currency,
      },
      collection: {
        totalExpected,
        totalCollected,
        totalPending,
        collectionPercentage,
        everyonePaid: totalPending === 0 && people.length > 0,
      },
      budget: {
        totalBudget,
        totalExpenses,
        remainingBudget,
        budgetUsedPercentage: totalBudget > 0 ? Math.min(100, Math.round((totalExpenses / totalBudget) * 100)) : 0,
      },
      cash: {
        cashInHand,
      },
      categoryOverview,
      stats: {
        peopleCount: people.length,
        pendingPeople,
        categoryCount: categories.length,
        expenseCount: expenses.length,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
