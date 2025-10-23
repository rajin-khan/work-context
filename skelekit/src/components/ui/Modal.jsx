// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const Modal = ({ isOpen, onSave, onDiscard, children }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onDiscard();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onDiscard]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white border border-neutral-300 rounded-lg shadow-2xl w-full h-full flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-neutral-200 shrink-0">
              <div className="text-lg font-semibold text-neutral-800">
                Component Editor
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDiscard}
                  className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={onSave}
                  className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-green-500 transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;