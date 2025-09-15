// src/components/CSSPreviewPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAndFormatCSS } from '../utils/cssGenerator';
import { downloadFile } from '../utils/download';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

const CSSPreviewPanel = ({ 
    isOpen, 
    onClose, 
    colors, 
    groupName, 
    isSpacingEnabled,
    spacingScale, 
    spacingSettings, 
    generatorConfig, 
    selectorGroups, 
    variableGroups,
    customCSS 
}) => {
  const [generatedCSS, setGeneratedCSS] = useState('/* Generating CSS... */');

  useEffect(() => {
    if (isOpen) {
      const generate = async () => {
        const css = await generateAndFormatCSS(
            colors, 
            spacingScale, 
            spacingSettings, 
            generatorConfig, 
            selectorGroups, 
            variableGroups,
            isSpacingEnabled,
            customCSS 
        );
        setGeneratedCSS(css);
      };

      generate();
    }
  }, [isOpen, colors, spacingScale, spacingSettings, generatorConfig, selectorGroups, variableGroups, isSpacingEnabled, customCSS]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
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
            
            <main className="flex-1 overflow-auto bg-black">
              <SyntaxHighlighter
                language="css"
                style={tomorrow}
                customStyle={{
                  background: '#0e0e0e',
                  margin: 0,
                  padding: '1rem',
                  height: '100%',
                  fontSize: '13px',
                }}
                codeTagProps={{
                    style: {
                        fontFamily: '"Fira Code", "Dank Mono", monospace',
                    }
                }}
              >
                {generatedCSS}
              </SyntaxHighlighter>
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand text-white rounded-md border border-brand-light/50 hover:bg-brand-light hover:border-brand-light active:scale-95 transition-all duration-150 ease-in-out"
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