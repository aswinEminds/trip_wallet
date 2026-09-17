import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBudgetTransfer extends Document {
  tripId: Types.ObjectId;
  fromCategoryId: Types.ObjectId;
  toCategoryId: Types.ObjectId;
  amount: number;
  reason: string;
  createdAt: Date;
}

const BudgetTransferSchema = new Schema<IBudgetTransfer>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    fromCategoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    toCategoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export const BudgetTransfer: Model<IBudgetTransfer> =
  mongoose.models.BudgetTransfer ||
  mongoose.model<IBudgetTransfer>("BudgetTransfer", BudgetTransferSchema);
