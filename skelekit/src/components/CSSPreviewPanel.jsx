// src/components/CSSPreviewPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAndFormatCSS } from '../utils/cssGenerator';
import { downloadFile } from '../utils/download';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

const CSSPreviewPanel = (props) => {
  // ** THE FIX IS HERE: We destructure all incoming props from the single `props` object. **
  const { 
    isOpen, 
    onClose, 
    colorGroups, 
    isSpacingEnabled,
    spacingScale, 
    spacingGroups,
    isTypographyEnabled,
    typographyScale,
    typographyGroups,
    typographyGeneratorConfig,
    typographySelectorGroups,
    typographyVariableGroups,
    generatorConfig, 
    selectorGroups, 
    variableGroups,
    customCSS,
    layoutSelectorGroups,
    layoutVariableGroups,
    designSelectorGroups,
    designVariableGroups
  } = props;

  const [generatedCSS, setGeneratedCSS] = useState('/* Generating CSS... */');

  useEffect(() => {
    if (isOpen) {
      const generate = async () => {
        const allColors = colorGroups.flatMap(group => group.colors);
        
        // ** THE FIX IS HERE: We now pass a single object to the generator function, matching its new signature. **
        const css = await generateAndFormatCSS({
            colors: allColors,
            spacingScale, 
            spacingGroups,
            isTypographyEnabled,
            typographyScale,
            typographyGroups,
            typographyGeneratorConfig,
            typographySelectorGroups,
            typographyVariableGroups,
            generatorConfig, 
            selectorGroups, 
            variableGroups,
            isSpacingEnabled,
            customCSS,
            layoutSelectorGroups,
            layoutVariableGroups,
            designSelectorGroups,
            designVariableGroups
        });
        setGeneratedCSS(css);
      };

      generate();
    }
    // The dependency array correctly lists all the individual props that should trigger a regeneration.
  }, [
    isOpen, colorGroups, spacingScale, spacingGroups, 
    isTypographyEnabled, typographyScale, typographyGroups, 
    typographyGeneratorConfig, typographySelectorGroups, typographyVariableGroups, 
    generatorConfig, selectorGroups, variableGroups, isSpacingEnabled, customCSS, 
    layoutSelectorGroups, layoutVariableGroups, designSelectorGroups, designVariableGroups
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCSS);
    toast.success('CSS copied to clipboard!');
  };

  const handleDownload = () => {
    const fileName = `theme.css`;
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
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white border-l border-neutral-300 shadow-2xl z-50 flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-neutral-200 shrink-0">
              <h2 className="text-lg font-semibold text-neutral-800">Export CSS</h2>
              <button
                onClick={onClose}
                className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
              >
                <X size={20} />
              </button>
            </header>
            
            <main className="flex-1 overflow-auto bg-white">
              <SyntaxHighlighter
                language="css"
                style={prism}
                customStyle={{
                  background: '#ffffff',
                  margin: 0,
                  padding: '1rem',
                  height: '100%',
                  fontSize: '13px',
                }}
                codeTagProps={{
                    style: {
                        fontFamily: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
                    }
                }}
              >
                {generatedCSS}
              </SyntaxHighlighter>
            </main>

            <footer className="p-4 border-t border-neutral-200 shrink-0 flex items-center justify-end gap-3">
               <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Copy size={16} />
                Copy to Clipboard
              </button>
               <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-black text-white rounded-md hover:bg-neutral-800 transition-all duration-150 ease-in-out"
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