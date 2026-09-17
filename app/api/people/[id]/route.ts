import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Person } from "@/lib/models/person";
import { Payment } from "@/lib/models/payment";
import { Expense } from "@/lib/models/expense";
import { requireAdmin } from "@/lib/auth";

// PATCH — Edit a person (admin only)
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
    const { name, dueAmount } = body;

    const person = await Person.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(dueAmount !== undefined && { dueAmount: Number(dueAmount) }),
      },
      { new: true }
    );

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({ person });
  } catch (error) {
    console.error("PATCH /api/people/[id] error:", error);
    return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
  }
}

// DELETE — Remove a person (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const { id } = await params;

    // Check for linked expenses
    const expenseCount = await Expense.countDocuments({ paidBy: id });
    if (expenseCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${expenseCount} expenses are linked to this person` },
        { status: 400 }
      );
    }

    // Delete person and their payments
    await Promise.all([
      Person.findByIdAndDelete(id),
      Payment.deleteMany({ personId: id }),
    ]);

    return NextResponse.json({ message: "Person deleted" });
  } catch (error) {
    console.error("DELETE /api/people/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
