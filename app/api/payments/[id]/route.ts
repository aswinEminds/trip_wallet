import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { requireAdmin } from "@/lib/auth";

// PATCH — Edit a payment (admin only)
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
    const { amount, note, paidAt } = body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(note !== undefined && { note }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("PATCH /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

// DELETE — Delete a payment (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const { id } = await params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment deleted" });
  } catch (error) {
    console.error("DELETE /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
