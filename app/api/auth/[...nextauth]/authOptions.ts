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
      name: "Trip Login",
      credentials: {
        joinCode: { label: "Trip Code", type: "text" },
        username: { label: "Username (Admin Only)", type: "text" },
        password: { label: "Password (Admin Only)", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.joinCode) {
          throw new Error("Join code is required");
        }

        await connectDB();

        const code = credentials.joinCode.toUpperCase().trim();
        const trip = await Trip.findOne({ joinCode: code });

        if (!trip) {
          throw new Error("Invalid join code");
        }

        // Admin flow
        if (credentials.username && credentials.password) {
          if (trip.adminUsername !== credentials.username.toLowerCase().trim()) {
            throw new Error("Invalid admin credentials");
          }

          const isValid = await bcrypt.compare(credentials.password, trip.adminPasswordHash);
          if (!isValid) {
            throw new Error("Invalid admin credentials");
          }

          return {
            id: `admin_${trip._id.toString()}`,
            name: credentials.username,
            isAdmin: true,
            tripId: trip._id.toString(),
          };
        }

        // Guest flow
        return {
          id: `guest_${trip._id.toString()}`,
          name: "Guest",
          isAdmin: false,
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
