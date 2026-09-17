import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireTrip() {
  const session = await getSession();
  if (!session || !session.user?.tripId) {
    return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized trip access" }, { status: 401 }) };
  }
  return { authorized: true as const, session, tripId: session.user.tripId, response: null as null };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.user?.isAdmin || !session.user?.tripId) {
    return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 }) };
  }
  return { authorized: true as const, session, tripId: session.user.tripId, response: null as null };
}
