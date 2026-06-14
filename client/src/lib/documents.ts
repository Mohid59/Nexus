import { api } from './api';
import { UserRole } from '../types';

export type DocumentStatus = 'uploaded' | 'pending_signature' | 'signed';

export interface DocParty {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  email?: string;
}

export interface DocSignature {
  signer: DocParty;
  signedAt: string;
  image?: string;
}

export interface DocItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: DocParty;
  sharedWith?: string[];
  status: DocumentStatus;
  version: number;
  signatures: DocSignature[];
  createdAt: string;
  updatedAt: string;
}

export async function listDocuments(): Promise<DocItem[]> {
  const { data } = await api.get('/documents');
  return data.data as DocItem[];
}

export async function uploadDocument(file: File): Promise<DocItem> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.document as DocItem;
}

export async function getDocument(id: string): Promise<DocItem> {
  const { data } = await api.get(`/documents/${id}`);
  return data.document as DocItem;
}

export async function fetchDocumentBlob(id: string): Promise<Blob> {
  const res = await api.get(`/documents/${id}/file`, { responseType: 'blob' });
  return res.data as Blob;
}

export async function signDocument(id: string, signature: string): Promise<DocItem> {
  const { data } = await api.post(`/documents/${id}/sign`, { signature });
  return data.document as DocItem;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
