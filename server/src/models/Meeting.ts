import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { MeetingStatus } from '../types';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  organizer: Types.ObjectId;
  attendee: Types.ObjectId;
  start: Date;
  end: Date;
  status: MeetingStatus;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    attendee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    roomId: { type: String, required: true },
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

export const Meeting: Model<IMeeting> =
  (mongoose.models.Meeting as Model<IMeeting>) || mongoose.model<IMeeting>('Meeting', meetingSchema);
