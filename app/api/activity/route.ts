import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/trip";
import { Payment } from "@/lib/models/payment";
import { Expense } from "@/lib/models/expense";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";

export async function GET() {
  try {
    await connectDB();
    const trip = await Trip.findOne({ status: "active" });
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    // Fetch recent items from each type
    const [payments, expenses, transfers] = await Promise.all([
      Payment.find({ tripId: trip._id })
        .populate("personId", "name")
        .sort({ createdAt: -1 })
        .limit(10),
      Expense.find({ tripId: trip._id })
        .populate("categoryId", "name icon")
        .populate("paidBy", "name")
        .sort({ createdAt: -1 })
        .limit(10),
      BudgetTransfer.find({ tripId: trip._id })
        .populate("fromCategoryId", "name icon")
        .populate("toCategoryId", "name icon")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Merge and sort by createdAt
    type ActivityItem = {
      type: "payment" | "expense" | "transfer";
      data: any;
      createdAt: Date;
    };

    const activities: ActivityItem[] = [
      ...payments.map((p) => ({
        type: "payment" as const,
        data: p.toObject(),
        createdAt: p.createdAt,
      })),
      ...expenses.map((e) => ({
        type: "expense" as const,
        data: e.toObject(),
        createdAt: e.createdAt,
      })),
      ...transfers.map((t) => ({
        type: "transfer" as const,
        data: t.toObject(),
        createdAt: t.createdAt,
      })),
    ];

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error("GET /api/activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
