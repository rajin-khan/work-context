// src/components/CSSPreviewModal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const CSSPreviewModal = ({ isOpen, onClose, cssString }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssString);
    toast.success('CSS copied to clipboard!');
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#0e0e0e] border border-neutral-800 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
          <h2 className="text-lg font-semibold text-white">Generated CSS</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              <Copy size={14} />
              Copy
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          <pre className="text-sm">
            <code className="language-css text-neutral-300 whitespace-pre-wrap">
              {cssString || 'Generating CSS...'}
            </code>
          </pre>
        </main>
      </motion.div>
    </div>,
    document.body
  );
};

export default CSSPreviewModal;