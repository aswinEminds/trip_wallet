import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory extends Document {
  tripId: Types.ObjectId;
  name: string;
  icon: string;
  initialBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true, default: "🏷️" },
    initialBudget: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
