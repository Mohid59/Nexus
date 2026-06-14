import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { TransactionType, TransactionStatus, TransactionDirection } from '../types';

export interface ITransaction extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  direction: TransactionDirection;
  status: TransactionStatus;
  amount: number; // cents
  currency: string;
  counterparty?: Types.ObjectId;
  stripePaymentIntentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
    direction: { type: String, enum: ['in', 'out'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd' },
    counterparty: { type: Schema.Types.ObjectId, ref: 'User' },
    stripePaymentIntentId: { type: String, index: true },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        r.id = (r._id as { toString(): string } | undefined)?.toString();
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

export const Transaction: Model<ITransaction> =
  (mongoose.models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);
