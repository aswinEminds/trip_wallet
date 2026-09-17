import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Expense } from "@/lib/models/expense";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { requireAdmin } from "@/lib/auth";

// PATCH — Edit a category (admin only)
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
    const { name, icon, initialBudget } = body;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(icon && { icon }),
        ...(initialBudget !== undefined && { initialBudget: Number(initialBudget) }),
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("PATCH /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE — Delete a category (admin only, only if no expenses)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const { id } = await params;

    const expenseCount = await Expense.countDocuments({ categoryId: id });
    if (expenseCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${expenseCount} expenses in this category` },
        { status: 400 }
      );
    }

    // Also clean up transfers
    await BudgetTransfer.deleteMany({
      $or: [{ fromCategoryId: id }, { toCategoryId: id }],
    });

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
