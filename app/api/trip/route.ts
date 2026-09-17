import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/trip";
import { Person } from "@/lib/models/person";
import { Payment } from "@/lib/models/payment";
import { Category } from "@/lib/models/category";
import { Expense } from "@/lib/models/expense";
import { BudgetTransfer } from "@/lib/models/budgetTransfer";
import { requireAdmin, requireTrip } from "@/lib/auth";

const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// GET — Get the active trip for the session
export async function GET() {
  const auth = await requireTrip();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const trip = await Trip.findById(auth.tripId).select("-adminPasswordHash");
    if (!trip) {
      return NextResponse.json({ trip: null }, { status: 200 });
    }
    return NextResponse.json({ trip });
  } catch (error) {
    console.error("GET /api/trip error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// POST — Create a new trip
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, startDate, endDate, currency, adminUsername, adminPassword } = body;

    if (!name || !startDate || !endDate || !adminUsername || !adminPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (adminPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    
    // Generate a unique join code
    let joinCode = generateJoinCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Trip.findOne({ joinCode });
      if (!existing) {
        isUnique = true;
      } else {
        joinCode = generateJoinCode();
      }
    }

    const trip = await Trip.create({
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      currency: currency || "INR",
      joinCode,
      adminUsername: adminUsername.toLowerCase().trim(),
      adminPasswordHash,
    });

    const tripObj = trip.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminPasswordHash: _, ...safeTripData } = tripObj;

    return NextResponse.json({ trip: safeTripData }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trip error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}

// PATCH — Edit trip details (admin only)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();
    const body = await req.json();
    const { name, startDate, endDate, currency } = body;

    const trip = await Trip.findByIdAndUpdate(
      auth.tripId,
      { 
        ...(name && { name: name.trim() }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(currency && { currency }),
      },
      { new: true }
    ).select("-adminPasswordHash");

    if (!trip) {
      return NextResponse.json({ error: "No active trip found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("PATCH /api/trip error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// DELETE — Clear entire trip (admin only)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await connectDB();

    const body = await req.json();
    const { confirmText } = body;

    const trip = await Trip.findById(auth.tripId);
    if (!trip) {
      return NextResponse.json({ error: "No active trip found" }, { status: 404 });
    }

    // Require confirmation text
    const expectedConfirm = trip.name.toUpperCase().replace(/\s+/g, "-") + "-DELETE";
    if (confirmText !== expectedConfirm) {
      return NextResponse.json({ 
        error: "Invalid confirmation text",
        expected: expectedConfirm,
      }, { status: 400 });
    }

    const tripId = trip._id;

    // Delete all related data
    await Promise.all([
      Person.deleteMany({ tripId }),
      Payment.deleteMany({ tripId }),
      Category.deleteMany({ tripId }),
      Expense.deleteMany({ tripId }),
      BudgetTransfer.deleteMany({ tripId }),
      Trip.findByIdAndDelete(tripId),
    ]);

    return NextResponse.json({ message: "Trip cleared successfully" });
  } catch (error) {
    console.error("DELETE /api/trip error:", error);
    return NextResponse.json({ error: "Failed to clear trip" }, { status: 500 });
  }
}
