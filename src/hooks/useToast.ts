/**
 * Markdown Viewer Pro - Toast Management Hook
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import { useState, useCallback } from 'react';
import { ToastMessage } from '../types';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      type: 'success' | 'error' | 'info' | 'warning',
      title: string,
      message?: string,
      duration = 3500
    ) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
