import React from 'react';
import { Loader2 } from 'lucide-react';

/** Full-screen spinner shown while auth state is being resolved. */
export const RouteLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-paper">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-label="Loading" />
  </div>
);
