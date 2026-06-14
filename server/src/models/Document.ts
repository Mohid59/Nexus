import mongoose, { Document as MongooseDocument, Model, Schema, Types } from 'mongoose';

export type DocumentStatus = 'uploaded' | 'pending_signature' | 'signed';

export interface ISignature {
  signer: Types.ObjectId;
  image: string; // signature PNG as data URL
  signedAt: Date;
}

export interface IDocumentFile extends MongooseDocument {
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  sharedWith: Types.ObjectId[];
  status: DocumentStatus;
  version: number;
  signatures: ISignature[];
  createdAt: Date;
  updatedAt: Date;
}

const signatureSchema = new Schema<ISignature>(
  {
    signer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    signedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocumentFile>(
  {
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    status: { type: String, enum: ['uploaded', 'pending_signature', 'signed'], default: 'uploaded' },
    version: { type: Number, default: 1 },
    signatures: { type: [signatureSchema], default: [] },
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
        delete r.storageKey;
        return r;
      },
    },
  }
);

export const DocumentFile: Model<IDocumentFile> =
  (mongoose.models.Document as Model<IDocumentFile>) ||
  mongoose.model<IDocumentFile>('Document', documentSchema);
