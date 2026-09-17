import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Expense } from "@/lib/models/expense";
import { Category } from "@/lib/models/category";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { Trip } from "@/lib/models/trip";
import { requireAdmin, requireTrip } from "@/lib/auth";

// GET — List expenses with filters
export async function GET(req: NextRequest) {
  const auth = await requireTrip();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId);
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const date = searchParams.get("date");

    const filter: Record<string, unknown> = { tripId: trip._id };
    if (categoryId) filter.categoryId = categoryId;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.expenseDate = { $gte: d, $lt: nextDay };
    }
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }

    const expenses = await Expense.find(filter)
      .populate("categoryId", "name icon")
      .populate("paidBy", "name")
      .sort({ expenseDate: -1, createdAt: -1 });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST — Add an expense (admin only)
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
    const { categoryId, amount, description, note, paidBy, expenseDate } = body;

    if (!categoryId || !amount || !description || !paidBy) {
      return NextResponse.json({ error: "Category, amount, description, and paidBy are required" }, { status: 400 });
    }

    // Budget validation warning
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const catExpenses = await Expense.find({ categoryId });
    const catTransfersIn = await BudgetTransfer.find({ toCategoryId: categoryId });
    const catTransfersOut = await BudgetTransfer.find({ fromCategoryId: categoryId });

    const totalSpent = catExpenses.reduce((s, e) => s + e.amount, 0);
    const tIn = catTransfersIn.reduce((s, t) => s + t.amount, 0);
    const tOut = catTransfersOut.reduce((s, t) => s + t.amount, 0);
    const currentBudget = category.initialBudget + tIn - tOut;
    const remainingBudget = currentBudget - totalSpent;

    let budgetWarning = null;
    if (Number(amount) > remainingBudget) {
      budgetWarning = {
        message: "Category budget exceeded",
        available: remainingBudget,
        expense: Number(amount),
        shortfall: Number(amount) - remainingBudget,
      };
    }

    const expense = await Expense.create({
      tripId: trip._id,
      categoryId,
      amount: Number(amount),
      description: description.trim(),
      note: note || "",
      paidBy,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
    });

    return NextResponse.json({ expense, budgetWarning }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}
