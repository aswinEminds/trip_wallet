import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Expense } from "@/lib/models/expense";
import { requireAdmin } from "@/lib/auth";

// PATCH — Edit an expense (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { categoryId, amount, description, note, paidBy, expenseDate } = body;

    const expense = await Expense.findByIdAndUpdate(
      id,
      {
        ...(categoryId && { categoryId }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(description && { description: description.trim() }),
        ...(note !== undefined && { note }),
        ...(paidBy && { paidBy }),
        ...(expenseDate && { expenseDate: new Date(expenseDate) }),
      },
      { new: true }
    );

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

// DELETE — Delete an expense (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const { id } = await params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
