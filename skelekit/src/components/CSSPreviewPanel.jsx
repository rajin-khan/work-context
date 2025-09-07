// src/components/CSSPreviewPanel.jsx
// ** THIS IS THE FIX: We now need `useState` and `useEffect` **
import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAndFormatCSS } from '../utils/cssGenerator';
import { downloadFile } from '../utils/download';

const CSSPreviewPanel = ({ isOpen, onClose, colors, groupName }) => {
  // ** THIS IS THE FIX: Use state to hold the generated CSS string **
  const [generatedCSS, setGeneratedCSS] = useState('/* Generating CSS... */');

  // ** THIS IS THE FIX: Use an effect to run the async generation function **
  useEffect(() => {
    // Only generate the CSS if the panel is open to save resources
    if (isOpen) {
      // Create an async function inside the effect
      const generate = async () => {
        if (!colors || colors.length === 0) {
          setGeneratedCSS('/* Add some colors to generate CSS */');
          return;
        }
        // Await the result of the formatting
        const css = await generateAndFormatCSS(colors);
        setGeneratedCSS(css);
      };

      generate();
    }
  }, [isOpen, colors]); // Rerun this effect when the panel opens or the colors change

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCSS);
    toast.success('CSS copied to clipboard!');
  };

  const handleDownload = () => {
    const fileName = `${groupName.toLowerCase().replace(/\s+/g, '-') || 'theme'}.css`;
    downloadFile(generatedCSS, fileName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0e0e0e] border-l border-neutral-800 shadow-2xl z-50 flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
              <h2 className="text-lg font-semibold text-white">Export CSS</h2>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </header>
            
            <main className="flex-1 p-4 overflow-auto bg-black/20">
              <pre className="text-sm h-full">
                <code className="language-css text-neutral-300 whitespace-pre-wrap">
                  {generatedCSS}
                </code>
              </pre>
            </main>

            <footer className="p-4 border-t border-neutral-800 shrink-0 flex items-center justify-end gap-3">
               <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <Copy size={16} />
                Copy to Clipboard
              </button>
               <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand rounded-md text-white hover:bg-brand-light transition-colors shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                <Download size={16} />
                Download File
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CSSPreviewPanel;