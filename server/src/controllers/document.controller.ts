import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { DocumentFile, IDocumentFile } from '../models/Document';
import { UPLOAD_DIR } from '../middleware/upload';

const POP = 'name avatarUrl role email';

function canAccess(doc: IDocumentFile, userId: string): boolean {
  return (
    doc.uploadedBy.toString() === userId ||
    doc.sharedWith.some((id) => id.toString() === userId)
  );
}

async function loadAccessible(id: string, userId: string): Promise<IDocumentFile> {
  const doc = await DocumentFile.findById(id);
  if (!doc) throw new AppError(404, 'Document not found');
  if (!canAccess(doc, userId)) throw new AppError(403, 'You do not have access to this document');
  return doc;
}

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'No file uploaded');
  const doc = await DocumentFile.create({
    originalName: req.file.originalname,
    storageKey: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user!.id,
    status: 'uploaded',
  });
  await doc.populate({ path: 'uploadedBy', select: POP });
  res.status(201).json({ document: doc.toJSON() });
});

export const listDocuments = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const docs = await DocumentFile.find({ $or: [{ uploadedBy: userId }, { sharedWith: userId }] })
    .select('-signatures.image')
    .sort({ createdAt: -1 })
    .populate({ path: 'uploadedBy', select: POP });
  res.json({ data: docs.map((d) => d.toJSON()) });
});

export const getDocument = asyncHandler(async (req, res) => {
  const doc = await loadAccessible(req.params.id as string, req.user!.id);
  await doc.populate([
    { path: 'uploadedBy', select: POP },
    { path: 'signatures.signer', select: 'name avatarUrl role' },
  ]);
  res.json({ document: doc.toJSON() });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const doc = await loadAccessible(req.params.id as string, req.user!.id);
  const filePath = path.join(UPLOAD_DIR, doc.storageKey);
  if (!fs.existsSync(filePath)) throw new AppError(404, 'File is missing from storage');
  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
  fs.createReadStream(filePath).pipe(res);
});

export const signDocument = asyncHandler(async (req, res) => {
  const doc = await loadAccessible(req.params.id as string, req.user!.id);
  const { signature } = req.body as { signature: string };
  doc.signatures.push({ signer: new Types.ObjectId(req.user!.id), image: signature, signedAt: new Date() });
  doc.status = 'signed';
  await doc.save();
  await doc.populate([
    { path: 'uploadedBy', select: POP },
    { path: 'signatures.signer', select: 'name avatarUrl role' },
  ]);
  res.json({ document: doc.toJSON() });
});

export const shareDocument = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const doc = await DocumentFile.findById(req.params.id as string);
  if (!doc) throw new AppError(404, 'Document not found');
  if (doc.uploadedBy.toString() !== userId) throw new AppError(403, 'Only the owner can share this document');

  const { userIds } = req.body as { userIds: string[] };
  const existing = new Set(doc.sharedWith.map((id) => id.toString()));
  for (const uid of userIds) {
    if (uid !== userId && !existing.has(uid)) {
      doc.sharedWith.push(new Types.ObjectId(uid));
    }
  }
  await doc.save();
  await doc.populate({ path: 'uploadedBy', select: POP });
  res.json({ document: doc.toJSON() });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const doc = await DocumentFile.findById(req.params.id as string);
  if (!doc) throw new AppError(404, 'Document not found');
  if (doc.uploadedBy.toString() !== userId) throw new AppError(403, 'Only the owner can delete this document');

  const filePath = path.join(UPLOAD_DIR, doc.storageKey);
  fs.promises.unlink(filePath).catch(() => undefined);
  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
});
