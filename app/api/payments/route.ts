import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { Trip } from "@/lib/models/trip";
import { requireAdmin } from "@/lib/auth";

// GET — List payments (optionally filtered by personId)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const trip = await Trip.findOne({ status: "active" });
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const personId = searchParams.get("personId");

    const filter: Record<string, unknown> = { tripId: trip._id };
    if (personId) filter.personId = personId;

    const payments = await Payment.find(filter)
      .populate("personId", "name")
      .sort({ paidAt: -1 });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

// POST — Record a payment (admin only)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findOne({ status: "active" });
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const body = await req.json();
    const { personId, amount, note, paidAt } = body;

    if (!personId || !amount) {
      return NextResponse.json({ error: "Person and amount are required" }, { status: 400 });
    }

    const payment = await Payment.create({
      tripId: trip._id,
      personId,
      amount: Number(amount),
      note: note || "",
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
