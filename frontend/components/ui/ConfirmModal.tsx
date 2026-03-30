'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const variants = {
    danger: {
      bg: 'bg-red-50',
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
      btn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
      btnFocus: 'focus-visible:ring-red-600',
    },
    success: {
      bg: 'bg-green-50',
      icon: <Check className="w-6 h-6 text-green-600" />,
      btn: 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20',
      btnFocus: 'focus-visible:ring-green-600',
    },
    primary: {
      bg: 'bg-primary/10',
      icon: <AlertCircle className="w-6 h-6 text-primary" />,
      btn: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20',
      btnFocus: 'focus-visible:ring-primary',
    },
  };

  const selectedVariant = variants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={isLoading ? undefined : onClose}
          />
          
          {/* Modal Overlay */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300, 
                duration: 0.3 
              }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5 text-center sm:text-left">
                {/* Icon */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${selectedVariant.bg} ring-8 ring-background`}>
                  {selectedVariant.icon}
                </div>

                {/* Content */}
                <div className="mt-2 sm:mt-0 flex-1 w-full">
                  <h3 className="text-xl font-semibold leading-none tracking-tight text-foreground">
                    {title}
                  </h3>
                  <div className="mt-3 text-sm text-muted-foreground/90 leading-relaxed">
                    {description}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`inline-flex h-11 items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.98] ${selectedVariant.btn} ${selectedVariant.btnFocus}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
