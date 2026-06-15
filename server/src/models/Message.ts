import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        r.id = (r._id as { toString(): string } | undefined)?.toString();
        r.senderId = (r.sender as { toString(): string } | undefined)?.toString();
        r.receiverId = (r.receiver as { toString(): string } | undefined)?.toString();
        r.isRead = r.read;
        r.timestamp = r.createdAt;
        delete r._id;
        delete r.__v;
        delete r.sender;
        delete r.receiver;
        delete r.read;
        delete r.updatedAt;
        return r;
      },
    },
  }
);

export const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) || mongoose.model<IMessage>('Message', messageSchema);
