/**
 * Markdown Viewer Pro - Toast Notification Component
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
              case 'error':
                return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
              case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
              case 'info':
              default:
                return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
            }
          };

          const getBorderColor = () => {
            switch (toast.type) {
              case 'success':
                return 'border-emerald-500/30 bg-slate-900/95 text-emerald-100 shadow-emerald-950/40';
              case 'error':
                return 'border-rose-500/30 bg-slate-900/95 text-rose-100 shadow-rose-950/40';
              case 'warning':
                return 'border-amber-500/30 bg-slate-900/95 text-amber-100 shadow-amber-950/40';
              case 'info':
              default:
                return 'border-sky-500/30 bg-slate-900/95 text-sky-100 shadow-sky-950/40';
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md ${getBorderColor()}`}
            >
              <div className="pt-0.5">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold tracking-tight text-white">
                  {toast.title}
                </div>
                {toast.message && (
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                id={`toast-dismiss-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
