import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrip extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  currency: string;
  status: "active" | "completed";
  joinCode: string;
  adminUsername: string;
  adminPasswordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    joinCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    adminUsername: { type: String, required: true, trim: true, lowercase: true },
    adminPasswordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
