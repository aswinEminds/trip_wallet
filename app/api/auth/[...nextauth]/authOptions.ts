import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/trip";

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    tripId?: string;
  }
  interface Session {
    user: {
      name?: string | null;
      isAdmin?: boolean;
      tripId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    tripId?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        await connectDB();

        const trip = await Trip.findOne({
          status: "active",
          adminUsername: credentials.username.toLowerCase().trim(),
        });

        if (!trip) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          trip.adminPasswordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: trip._id.toString(),
          name: credentials.username,
          isAdmin: true,
          tripId: trip._id.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.tripId = user.tripId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin;
        session.user.tripId = token.tripId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
