import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  tripId: Types.ObjectId;
  personId: Types.ObjectId;
  amount: number;
  note: string;
  paidAt: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    personId: { type: Schema.Types.ObjectId, ref: "Person", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "", trim: true },
    paidAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
