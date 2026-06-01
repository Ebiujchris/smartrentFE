'use client';

import { useEffect } from 'react';
import { setupApiInterceptors } from '@/lib/apiInterceptor';

export default function ApiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup API interceptors once on mount
    setupApiInterceptors();
  }, []);

  return <>{children}</>;
}
