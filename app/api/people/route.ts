import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Person } from "@/lib/models/person";
import { Payment } from "@/lib/models/payment";
import { Trip } from "@/lib/models/trip";
import { requireAdmin } from "@/lib/auth";

// GET — List all people with calculated payment status
export async function GET() {
  try {
    await connectDB();
    const trip = await Trip.findOne({ status: "active" });
    if (!trip) {
      return NextResponse.json({ error: "No active trip" }, { status: 404 });
    }

    const people = await Person.find({ tripId: trip._id }).sort({ createdAt: 1 });
    const payments = await Payment.find({ tripId: trip._id });

    const paymentsByPerson = new Map<string, number>();
    for (const payment of payments) {
      const key = payment.personId.toString();
      paymentsByPerson.set(key, (paymentsByPerson.get(key) || 0) + payment.amount);
    }

    const peopleWithStatus = people.map((person) => {
      const totalPaid = paymentsByPerson.get(person._id.toString()) || 0;
      const remaining = Math.max(0, person.dueAmount - totalPaid);
      const paidPercentage = person.dueAmount > 0
        ? Math.min(100, Math.round((totalPaid / person.dueAmount) * 100))
        : 100;

      return {
        _id: person._id,
        name: person.name,
        dueAmount: person.dueAmount,
        totalPaid,
        remaining,
        paidPercentage,
      };
    });

    return NextResponse.json({ people: peopleWithStatus });
  } catch (error) {
    console.error("GET /api/people error:", error);
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

// POST — Add a person (admin only)
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
    const { name, dueAmount } = body;

    if (!name || dueAmount === undefined) {
      return NextResponse.json({ error: "Name and amount are required" }, { status: 400 });
    }

    const person = await Person.create({
      tripId: trip._id,
      name: name.trim(),
      dueAmount: Number(dueAmount),
    });

    return NextResponse.json({ person }, { status: 201 });
  } catch (error) {
    console.error("POST /api/people error:", error);
    return NextResponse.json({ error: "Failed to add person" }, { status: 500 });
  }
}
