import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { Category } from "@/lib/models/category";
import { Expense } from "@/lib/models/expense";
import { Trip } from "@/lib/models/trip";
import { requireAdmin, requireTrip } from "@/lib/auth";

// GET — List all budget transfers
export async function GET(req: NextRequest) {
  const auth = await requireTrip();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId);
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const transfers = await BudgetTransfer.find({ tripId: trip._id })
      .populate("fromCategoryId", "name icon")
      .populate("toCategoryId", "name icon")
      .sort({ createdAt: -1 });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("GET /api/transfers error:", error);
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 });
  }
}

// POST — Create a budget transfer (admin only)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId);
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const body = await req.json();
    const { fromCategoryId, toCategoryId, amount, reason } = body;

    if (!fromCategoryId || !toCategoryId || !amount) {
      return NextResponse.json({ error: "From, to, and amount are required" }, { status: 400 });
    }

    if (fromCategoryId === toCategoryId) {
      return NextResponse.json({ error: "Cannot transfer to the same category" }, { status: 400 });
    }

    // Validate source category has available budget
    const fromCat = await Category.findById(fromCategoryId);
    if (!fromCat) {
      return NextResponse.json({ error: "Source category not found" }, { status: 404 });
    }

    const fromExpenses = await Expense.find({ categoryId: fromCategoryId });
    const fromTransfersIn = await BudgetTransfer.find({ toCategoryId: fromCategoryId });
    const fromTransfersOut = await BudgetTransfer.find({ fromCategoryId: fromCategoryId });

    const spent = fromExpenses.reduce((s, e) => s + e.amount, 0);
    const tIn = fromTransfersIn.reduce((s, t) => s + t.amount, 0);
    const tOut = fromTransfersOut.reduce((s, t) => s + t.amount, 0);
    const currentBudget = fromCat.initialBudget + tIn - tOut;
    const available = currentBudget - spent;

    if (Number(amount) > available) {
      return NextResponse.json({
        error: "Insufficient budget in source category",
        available,
        requested: Number(amount),
      }, { status: 400 });
    }

    const transfer = await BudgetTransfer.create({
      tripId: trip._id,
      fromCategoryId,
      toCategoryId,
      amount: Number(amount),
      reason: reason || "",
    });

    return NextResponse.json({ transfer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transfers error:", error);
    return NextResponse.json({ error: "Failed to create transfer" }, { status: 500 });
  }
}
