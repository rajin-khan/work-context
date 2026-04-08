import React, {
  memo,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
} from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { generateAndFormatCSS } from '../../utils/cssGenerator';

const CSSPreviewCodeView = memo(({
  isOpen,
  exportData,
  generatedCSS,
  onGeneratedCSSChange,
  onGeneratingChange,
}) => {
  const deferredExportData = useDeferredValue(exportData);
  const codeTheme = useMemo(
    () => ({
      ...prism,
      'code[class*="language-"]': {
        ...(prism['code[class*="language-"]'] || {}),
        color: '#1f2937',
        textShadow: 'none',
        fontSize: '13px',
        lineHeight: '1.65',
      },
      'pre[class*="language-"]': {
        ...(prism['pre[class*="language-"]'] || {}),
        background: 'transparent',
        textShadow: 'none',
      },
      comment: {
        ...(prism.comment || {}),
        color: '#64748b',
      },
      punctuation: {
        ...(prism.punctuation || {}),
        color: '#475569',
      },
      property: {
        ...(prism.property || {}),
        color: '#0f766e',
      },
      selector: {
        ...(prism.selector || {}),
        color: '#1d4ed8',
      },
      function: {
        ...(prism.function || {}),
        color: '#7c3aed',
      },
      string: {
        ...(prism.string || {}),
        color: '#b45309',
      },
    }),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      onGeneratingChange(true);

      try {
        const css = await generateAndFormatCSS(deferredExportData);

        if (cancelled) {
          return;
        }

        startTransition(() => {
          onGeneratedCSSChange(css);
        });
      } finally {
        if (!cancelled) {
          onGeneratingChange(false);
        }
      }
    }, 110);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    isOpen,
    deferredExportData,
    onGeneratedCSSChange,
    onGeneratingChange,
  ]);

  return (
    <div className="h-full overflow-auto">
      <SyntaxHighlighter
        language="css"
        style={codeTheme}
        customStyle={{
          background: 'transparent',
          margin: 0,
          minHeight: '100%',
          padding: '1rem 1.25rem',
          fontSize: '13px',
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
          },
        }}
      >
        {generatedCSS}
      </SyntaxHighlighter>
    </div>
  );
});

export default CSSPreviewCodeView;
