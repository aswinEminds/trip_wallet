import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Expense } from "@/lib/models/expense";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { Trip } from "@/lib/models/trip";
import { requireAdmin, requireTrip } from "@/lib/auth";

// GET — List categories with computed budgets
export async function GET() {
  const auth = await requireTrip();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId);
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const categories = await Category.find({ tripId: trip._id }).sort({ createdAt: 1 });
    const expenses = await Expense.find({ tripId: trip._id });
    const transfers = await BudgetTransfer.find({ tripId: trip._id });

    // Build expense totals per category
    const spentByCategory = new Map<string, number>();
    for (const exp of expenses) {
      const key = exp.categoryId.toString();
      spentByCategory.set(key, (spentByCategory.get(key) || 0) + exp.amount);
    }

    // Build transfer totals per category
    const transfersIn = new Map<string, number>();
    const transfersOut = new Map<string, number>();
    for (const t of transfers) {
      const fromKey = t.fromCategoryId.toString();
      const toKey = t.toCategoryId.toString();
      transfersOut.set(fromKey, (transfersOut.get(fromKey) || 0) + t.amount);
      transfersIn.set(toKey, (transfersIn.get(toKey) || 0) + t.amount);
    }

    const categoriesWithBudget = categories.map((cat) => {
      const catId = cat._id.toString();
      const tIn = transfersIn.get(catId) || 0;
      const tOut = transfersOut.get(catId) || 0;
      const currentBudget = cat.initialBudget + tIn - tOut;
      const totalSpent = spentByCategory.get(catId) || 0;
      const remaining = currentBudget - totalSpent;
      const spentPercentage = currentBudget > 0
        ? Math.min(100, Math.round((totalSpent / currentBudget) * 100))
        : 0;

      return {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon,
        initialBudget: cat.initialBudget,
        transfersIn: tIn,
        transfersOut: tOut,
        currentBudget,
        totalSpent,
        remaining,
        spentPercentage,
      };
    });

    return NextResponse.json({ categories: categoriesWithBudget });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST — Create a category (admin only)
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
    const { name, icon, initialBudget } = body;

    if (!name || initialBudget === undefined) {
      return NextResponse.json({ error: "Name and budget are required" }, { status: 400 });
    }

    const category = await Category.create({
      tripId: trip._id,
      name: name.trim(),
      icon: icon || "🏷️",
      initialBudget: Number(initialBudget),
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
