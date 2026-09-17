import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IExpense extends Document {
  tripId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  description: string;
  note: string;
  paidBy: Types.ObjectId;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    expenseDate: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
