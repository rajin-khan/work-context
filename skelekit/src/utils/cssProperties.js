// src/utils/cssProperties.js

// A comprehensive list of common CSS properties for layout, spacing, and more.
export const allCSSProperties = [
  'all', 'align-content', 'align-items', 'align-self', 'animation', 'animation-delay', 'animation-direction',
  'animation-duration', 'animation-fill-mode', 'animation-iteration-count', 'animation-name', 'animation-play-state',
  'animation-timing-function', 'backdrop-filter', 'backface-visibility', 'background', 'background-attachment',
  'background-blend-mode', 'background-clip', 'background-color', 'background-image', 'background-origin',
  'background-position', 'background-repeat', 'background-size', 'border', 'border-bottom', 'border-bottom-color',
  'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width',
  'border-collapse', 'border-color', 'border-image', 'border-image-outset', 'border-image-repeat',
  'border-image-slice', 'border-image-source', 'border-image-width', 'border-left', 'border-left-color',
  'border-left-style', 'border-left-width', 'border-radius', 'border-right', 'border-right-color',
  'border-right-style', 'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-top-style', 'border-top-width', 'border-width',
  'bottom', 'box-decoration-break', 'box-shadow', 'box-sizing', 'caption-side', 'caret-color', '@charset',
  'clear', 'clip', 'color', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color',
  'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'content',
  'counter-increment', 'counter-reset', 'cursor', 'direction', 'display', 'empty-cells', 'filter', 'flex',
  'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap', 'float', 'font',
  'font-family', 'font-kerning', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant',
  'font-weight', 'gap', 'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows',
  'grid-column', 'grid-column-end', 'grid-column-gap', 'grid-column-start', 'grid-gap', 'grid-row',
  'grid-row-end', 'grid-row-gap', 'grid-row-start', 'grid-template', 'grid-template-areas',
  'grid-template-columns', 'grid-template-rows', 'hanging-punctuation', 'height', 'hyphens', 'isolation',
  'justify-content', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image',
  'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top',
  'margin-block', 'margin-block-end', 'margin-block-start', 'margin-inline', 'margin-inline-end', 'margin-inline-start',
  'max-height', 'max-width', 'min-height', 'min-width', 'mix-blend-mode', 'object-fit', 'object-position',
  'opacity', 'order', 'outline', 'outline-color', 'outline-offset', 'outline-style', 'outline-width',
  'overflow', 'overflow-x', 'overflow-y', 'padding', 'padding-bottom', 'padding-left', 'padding-right',
  'padding-top', 'padding-block', 'padding-block-end', 'padding-block-start', 'padding-inline',
  'padding-inline-end', 'padding-inline-start', 'page-break-after', 'page-break-before', 'page-break-inside',
  'perspective', 'perspective-origin', 'pointer-events', 'position', 'quotes', 'resize', 'right', 'row-gap',
  'scroll-behavior', 'tab-size', 'table-layout', 'text-align', 'text-align-last', 'text-decoration',
  'text-decoration-color', 'text-decoration-line', 'text-decoration-style', 'text-indent', 'text-justify',
  'text-overflow', 'text-shadow', 'text-transform', 'top', 'transform', 'transform-origin', 'transform-style',
  'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function',
  'unicode-bidi', 'user-select', 'vertical-align', 'visibility', 'white-space', 'width', 'word-break',
  'word-spacing', 'word-wrap', 'writing-mode', 'z-index',
];

// We keep the original for any logic that might specifically want only spacing.
export const spacingProperties = [
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-inline-start', 'padding-inline-end', 'padding-block', 'padding-block-start', 'padding-block-end',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-inline-start', 'margin-inline-end', 'margin-block', 'margin-block-start', 'margin-block-end',
  'gap', 'row-gap', 'column-gap',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'top', 'right', 'bottom', 'left', 'inset', 'inset-inline-start', 'inset-inline-end', 'inset-block-start', 'inset-block-end',
  'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'outline-width', 'flex-basis',
];

// A new list for typography properties
export const typographyProperties = [
    'font', 'font-size', 'font-family', 'font-weight', 'line-height', 'letter-spacing', 'text-indent', 'word-spacing'
];

// A new list for color properties
export const colorProperties = [
    'color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
    'border-left-color', 'outline-color', 'fill', 'stroke', 'caret-color', 'text-decoration-color'
];