// src/components/CSSPreviewPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAndFormatCSS, generateSkelementorCSS } from '../utils/cssGenerator';
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
  const [activeTab, setActiveTab] = useState('normal'); // 'normal' or 'skelementor'

  useEffect(() => {
    if (isOpen) {
      const generate = async () => {
        const allColors = colorGroups.flatMap(group => group.colors);
        
        if (activeTab === 'skelementor') {
          // Generate Skelementor-compatible CSS
          const css = await generateSkelementorCSS({
            colors: allColors,
            spacingScale, 
            spacingGroups,
            isTypographyEnabled,
            typographyScale,
            typographyGroups,
            typographyGeneratorConfig,
            typographyVariableGroups,
            generatorConfig, 
            isSpacingEnabled,
          });
          setGeneratedCSS(css);
        } else {
          // Generate normal CSS
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
        }
      };

      generate();
    }
    // The dependency array correctly lists all the individual props that should trigger a regeneration.
  }, [
    isOpen, activeTab, colorGroups, spacingScale, spacingGroups, 
    isTypographyEnabled, typographyScale, typographyGroups, 
    typographyGeneratorConfig, typographySelectorGroups, typographyVariableGroups, 
    generatorConfig, selectorGroups, variableGroups, isSpacingEnabled, customCSS, 
    layoutSelectorGroups, layoutVariableGroups, designSelectorGroups, designVariableGroups
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCSS);
    toast.success('CSS copied to clipboard!');
  };

  const base64Encode = (value) => {
    try {
      return btoa(unescape(encodeURIComponent(value)));
    } catch (error) {
      console.error('Failed to encode content for .skele package', error);
      return btoa(value);
    }
  };

  const handleDownload = () => {
    const fileName = activeTab === 'skelementor' ? `skelementor-theme.css` : `theme.css`;
    downloadFile(generatedCSS, fileName);
  };

  const handleDownloadSkele = () => {
    const payload = {
      version: '1.0',
      format: 'skelementor-css-package',
      source: 'Skelekit Export',
      created_at: new Date().toISOString(),
      payload: {
        encoding: 'base64',
        css: base64Encode(generatedCSS)
      }
    };

    downloadFile(
      JSON.stringify(payload, null, 2),
      'skelementor-theme.skele',
      'application/json;charset=utf-8'
    );
    toast.success('.skele package downloaded');
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
            <header className="flex flex-col border-b border-neutral-200 shrink-0">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-neutral-800">Export CSS</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex border-t border-neutral-200">
                <button
                  onClick={() => setActiveTab('normal')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'normal'
                      ? 'bg-neutral-100 text-neutral-800 border-b-2 border-neutral-800'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setActiveTab('skelementor')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'skelementor'
                      ? 'bg-neutral-100 text-neutral-800 border-b-2 border-neutral-800'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  Skelementor Plugin
                </button>
              </div>
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

            <footer className="p-4 border-t border-neutral-200 shrink-0">
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-700 bg-white shadow-sm hover:bg-neutral-50 transition-colors"
                >
                  <Copy size={16} />
                  Copy CSS
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-neutral-900 text-white shadow hover:bg-neutral-800 transition-colors"
                >
                  <Download size={16} />
                  Download CSS
                </button>
                {activeTab === 'skelementor' && (
                  <button
                    onClick={handleDownloadSkele}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500 transition-colors"
                  >
                    <Download size={16} />
                    Download .skele
                  </button>
                )}
              </div>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CSSPreviewPanel;