// src/components/CSSPreviewPanel.jsx
import React, {
  Suspense,
  lazy,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile } from '../utils/download';

const GENERATING_MESSAGE = '/* Generating CSS... */';
const loadCSSPreviewCodeView = () => import('./export/CSSPreviewCodeView');
const loadPackageBuilder = () => import('../utils/canonicalArtifacts');
const CSSPreviewCodeView = lazy(loadCSSPreviewCodeView);

export const preloadCSSPreviewPanel = () => loadCSSPreviewCodeView();

const CSSPreviewPanel = memo((props) => {
  const {
    isOpen,
    onClose,
    returnFocusRef,
    colorGroups,
    isSpacingEnabled,
    spacingScale,
    spacingGroups,
    isTypographyEnabled,
    typographyScale,
    typographyGroups,
    typographyGeneratorConfig,
    typographySelectorGroups,
    typographySelectorGroupsByBreakpoint,
    typographyVariableGroups,
    typographyVariableGroupsByBreakpoint,
    generatorConfig,
    selectorGroups,
    selectorGroupsByBreakpoint,
    variableGroups,
    variableGroupsByBreakpoint,
    customCSS,
    layoutSelectorGroups,
    layoutSelectorGroupsByBreakpoint,
    layoutVariableGroups,
    layoutVariableGroupsByBreakpoint,
    designSelectorGroups,
    designSelectorGroupsByBreakpoint,
    designVariableGroups,
    designVariableGroupsByBreakpoint,
    breakpointPresets,
  } = props;

  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const [generatedCSS, setGeneratedCSS] = useState(GENERATING_MESSAGE);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPackaging, setIsPackaging] = useState(false);

  const exportData = useMemo(
    () => ({
      colors: colorGroups.flatMap((group) => group.colors),
      spacingScale,
      spacingGroups,
      isTypographyEnabled,
      typographyScale,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroups,
      typographyVariableGroupsByBreakpoint,
      generatorConfig,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      isSpacingEnabled,
      customCSS,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      breakpointPresets,
    }),
    [
      colorGroups,
      spacingScale,
      spacingGroups,
      isTypographyEnabled,
      typographyScale,
      typographyGroups,
      typographyGeneratorConfig,
      typographySelectorGroups,
      typographySelectorGroupsByBreakpoint,
      typographyVariableGroups,
      typographyVariableGroupsByBreakpoint,
      generatorConfig,
      selectorGroups,
      selectorGroupsByBreakpoint,
      variableGroups,
      variableGroupsByBreakpoint,
      isSpacingEnabled,
      customCSS,
      layoutSelectorGroups,
      layoutSelectorGroupsByBreakpoint,
      layoutVariableGroups,
      layoutVariableGroupsByBreakpoint,
      designSelectorGroups,
      designSelectorGroupsByBreakpoint,
      designVariableGroups,
      designVariableGroupsByBreakpoint,
      breakpointPresets,
    ]
  );

  const canExport =
    generatedCSS.trim().length > 0 &&
    generatedCSS !== GENERATING_MESSAGE &&
    !isGenerating &&
    !isPackaging;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setGeneratedCSS(GENERATING_MESSAGE);
    setIsGenerating(true);

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      style.paddingRight = `${scrollBarWidth}px`;
    }

    window.addEventListener('keydown', handleEsc);
    const focusId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusId);
      window.removeEventListener('keydown', handleEsc);
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;

      const focusTarget =
        returnFocusRef?.current || previousActiveElementRef.current;
      if (focusTarget?.focus) {
        window.requestAnimationFrame(() => {
          focusTarget.focus({ preventScroll: true });
        });
      }
    };
  }, [isOpen, onClose, returnFocusRef]);

  const handleCopy = () => {
    if (!canExport) {
      return;
    }

    navigator.clipboard.writeText(generatedCSS);
    toast.success('CSS copied to clipboard!');
  };

  const handleDownload = () => {
    if (!canExport) {
      return;
    }

    downloadFile(generatedCSS, 'theme.css');
  };

  const handleDownloadSkele = async () => {
    if (!canExport) {
      return;
    }

    setIsPackaging(true);
    try {
      const { buildSkelePackageV2 } = await loadPackageBuilder();
      const payload = buildSkelePackageV2(generatedCSS, 'Skelekit Export');
      downloadFile(
        JSON.stringify(payload, null, 2),
        'skelementor-theme.skele',
        'application/json;charset=utf-8'
      );
      toast.success('Skelementor v2 package downloaded');
    } finally {
      setIsPackaging(false);
    }
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close export panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/42 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex justify-end">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Export CSS"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 34, mass: 0.9 }}
              className="pointer-events-auto flex h-full w-full max-w-[min(100vw,48rem)] flex-col border-l border-neutral-200 bg-white shadow-2xl"
            >
              <header className="shrink-0 border-b border-neutral-200 bg-white/92 backdrop-blur">
                <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-neutral-800">
                      Export CSS
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      One source of truth for CSS and `.skele` exports.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(isGenerating || isPackaging) && (
                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                        {isPackaging ? 'Packaging…' : 'Refreshing…'}
                      </span>
                    )}
                    <button
                      ref={closeButtonRef}
                      onClick={onClose}
                      className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </header>

              <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
                <div className="shrink-0 border-b border-neutral-200 px-4 py-3 sm:px-5">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm text-neutral-700">
                    <p className="font-medium text-neutral-800">
                      Exported CSS is the source of truth
                    </p>
                    <p className="mt-1 text-neutral-600">
                      `Download .skele` packages exactly the CSS shown below, with
                      dynamic class and variable snapshots.
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(241,245,249,0.92),rgba(255,255,255,1)_42%)]">
                  <Suspense
                    fallback={
                      <div className="flex h-full flex-col gap-3 px-4 py-4 sm:px-5">
                        <div className="h-4 w-32 rounded-full bg-neutral-200" />
                        <div className="h-4 w-48 rounded-full bg-neutral-100" />
                        <div className="h-4 w-40 rounded-full bg-neutral-100" />
                        <div className="mt-2 h-4 w-60 rounded-full bg-neutral-100" />
                        <div className="h-4 w-52 rounded-full bg-neutral-100" />
                      </div>
                    }
                  >
                    <CSSPreviewCodeView
                      isOpen={isOpen}
                      exportData={exportData}
                      generatedCSS={generatedCSS}
                      onGeneratedCSSChange={setGeneratedCSS}
                      onGeneratingChange={setIsGenerating}
                    />
                  </Suspense>
                </div>
              </main>

              <footer className="shrink-0 border-t border-neutral-200 bg-white/92 p-4 backdrop-blur sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <button
                    onClick={handleCopy}
                    disabled={!canExport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy size={16} />
                    Copy CSS
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!canExport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={16} />
                    Download CSS
                  </button>
                  <button
                    onClick={handleDownloadSkele}
                    disabled={!canExport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={16} />
                    Download `.skele`
                  </button>
                </div>
              </footer>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
});

export default CSSPreviewPanel;
