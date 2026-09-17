import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPerson extends Document {
  tripId: Types.ObjectId;
  name: string;
  dueAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: { type: String, required: true, trim: true },
    dueAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Person: Model<IPerson> =
  mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema);
