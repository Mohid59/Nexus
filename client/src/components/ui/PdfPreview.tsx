import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Worker matched to the installed pdfjs version (served from CDN).
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfPreview: React.FC<{ url: string }> = ({ url }) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-h-[64vh] w-full justify-center overflow-auto rounded-lg border border-line bg-gray-100 dark:bg-gray-900">
        <Document
          file={url}
          onLoadSuccess={(pdf) => {
            setNumPages(pdf.numPages);
            setPage(1);
          }}
          loading={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          }
          error={<div className="p-8 text-sm text-muted">Could not render this PDF.</div>}
        >
          <Page pageNumber={page} width={620} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Page {page} of {numPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
