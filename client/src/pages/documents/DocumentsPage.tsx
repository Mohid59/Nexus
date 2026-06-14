import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';
import {
  FileText, UploadCloud, Download, Trash2, Eye, PenLine, CheckCircle2, FileSignature, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../lib/api';
import {
  DocItem,
  DocumentStatus,
  listDocuments,
  uploadDocument,
  fetchDocumentBlob,
  signDocument,
  deleteDocument,
  formatBytes,
} from '../../lib/documents';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

const STATUS_BADGE: Record<DocumentStatus, { variant: BadgeVariant; label: string }> = {
  uploaded: { variant: 'gray', label: 'Uploaded' },
  pending_signature: { variant: 'accent', label: 'Awaiting signature' },
  signed: { variant: 'success', label: 'Signed' },
};

const kindOf = (mime: string): 'pdf' | 'image' | 'other' =>
  mime === 'application/pdf' ? 'pdf' : mime.startsWith('image/') ? 'image' : 'other';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [preview, setPreview] = useState<{ doc: DocItem; url: string } | null>(null);
  const [signDoc, setSignDoc] = useState<DocItem | null>(null);
  const [signing, setSigning] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);

  const refresh = useCallback(async () => {
    try {
      setDocs(await listDocuments());
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load documents'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        for (const f of files) await uploadDocument(f);
        toast.success(files.length > 1 ? `${files.length} files uploaded` : 'File uploaded');
        await refresh();
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Upload failed'));
      } finally {
        setUploading(false);
      }
    },
    [refresh]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxSize: 10 * 1024 * 1024 });

  const openPreview = async (doc: DocItem) => {
    try {
      const blob = await fetchDocumentBlob(doc.id);
      setPreview({ doc, url: URL.createObjectURL(blob) });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load preview'));
    }
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const download = async (doc: DocItem) => {
    try {
      const blob = await fetchDocumentBlob(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Download failed'));
    }
  };

  const remove = async (doc: DocItem) => {
    if (!window.confirm(`Delete "${doc.originalName}"?`)) return;
    try {
      await deleteDocument(doc.id);
      toast.success('Document deleted');
      await refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Delete failed'));
    }
  };

  const handleSign = async () => {
    const canvas = sigRef.current;
    if (!canvas || canvas.isEmpty()) {
      toast.error('Please draw your signature first');
      return;
    }
    if (!signDoc) return;
    setSigning(true);
    try {
      await signDocument(signDoc.id, canvas.toDataURL('image/png'));
      toast.success('Document signed');
      setSignDoc(null);
      await refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not sign document'));
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Document Chamber</h1>
        <p className="mt-1 text-muted">Upload, preview, share, and e-sign deal documents.</p>
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-line bg-surface hover:bg-gray-100 dark:hover:bg-gray-800/40'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
          {uploading ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
        </div>
        <p className="font-medium text-ink">{isDragActive ? 'Drop to upload' : 'Drag & drop files here'}</p>
        <p className="mt-1 text-sm text-muted">or click to browse — PDF, images, Word, txt (max 10 MB)</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={<FileText size={24} />} title="No documents yet" description="Upload your first document to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => {
            const isOwner = doc.uploadedBy.id === user?.id;
            const badge = STATUS_BADGE[doc.status];
            return (
              <div key={doc.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink" title={doc.originalName}>
                      {doc.originalName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatBytes(doc.size)} · {format(new Date(doc.createdAt), 'd MMM yyyy')}
                    </p>
                  </div>
                  <Badge variant={badge.variant} rounded size="sm">
                    {badge.label}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-muted">
                  By {isOwner ? 'you' : doc.uploadedBy.name}
                  {doc.signatures.length > 0 && (
                    <span className="ml-1 inline-flex items-center gap-1 text-success-600">
                      <CheckCircle2 size={13} /> {doc.signatures.length} signature{doc.signatures.length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="outline" leftIcon={<Eye size={15} />} onClick={() => openPreview(doc)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost" leftIcon={<Download size={15} />} onClick={() => download(doc)}>
                    Download
                  </Button>
                  <Button size="sm" leftIcon={<PenLine size={15} />} onClick={() => setSignDoc(doc)}>
                    Sign
                  </Button>
                  {isOwner && (
                    <Button size="sm" variant="ghost" className="text-error-600" leftIcon={<Trash2 size={15} />} onClick={() => remove(doc)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      <Modal isOpen={!!preview} onClose={closePreview} title={preview?.doc.originalName} size="xl">
        {preview &&
          (kindOf(preview.doc.mimeType) === 'pdf' ? (
            <iframe title={preview.doc.originalName} src={preview.url} className="h-[70vh] w-full rounded-lg border border-line" />
          ) : kindOf(preview.doc.mimeType) === 'image' ? (
            <img src={preview.url} alt={preview.doc.originalName} className="mx-auto max-h-[70vh] rounded-lg" />
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted">No inline preview for this file type.</p>
              <Button className="mt-4" leftIcon={<Download size={16} />} onClick={() => download(preview.doc)}>
                Download instead
              </Button>
            </div>
          ))}
      </Modal>

      {/* Sign modal */}
      <Modal
        isOpen={!!signDoc}
        onClose={() => setSignDoc(null)}
        title="Sign document"
        footer={
          <>
            <Button variant="ghost" onClick={() => sigRef.current?.clear()}>
              Clear
            </Button>
            <Button onClick={handleSign} isLoading={signing} leftIcon={<FileSignature size={16} />}>
              Apply signature
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-muted">
          Draw your signature for <span className="font-medium text-ink">{signDoc?.originalName}</span>.
        </p>
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <SignatureCanvas ref={sigRef} penColor="#1C1B22" canvasProps={{ className: 'w-full h-48' }} />
        </div>
      </Modal>
    </div>
  );
};
