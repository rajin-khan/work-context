// src/presets/skelementorPreset.js
import { nanoid } from 'nanoid';

// A helper to generate a unique ID for each item
const generateId = () => nanoid();

// --- PRESET DATA DEFINITION ---

// 1. COLORS: Added a new 'Semantic Colors' group for UI states.
export const skelementorColorGroups = [
  {
    id: generateId(),
    name: 'Neutral Tones',
    colors: [
      { id: generateId(), name: '--skele-white', value: '#ffffff', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-50', value: '#f8fafc', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-100', value: '#f1f5f9', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-200', value: '#e2e8f0', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-300', value: '#cbd5e1', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-400', value: '#94a3b8', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-500', value: '#64748b', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-600', value: '#475569', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-700', value: '#334155', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-800', value: '#1e293b', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-slate-900', value: '#0f172a', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-black', value: '#020617', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
    ]
  },
  {
    id: generateId(),
    name: 'Primary Blues',
    colors: [
      { id: generateId(), name: '--skele-blue-50', value: '#eff6ff', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-100', value: '#dbeafe', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-200', value: '#bfdbfe', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-300', value: '#93c5fd', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-400', value: '#60a5fa', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-500', value: '#3b82f6', format: 'HEX', shadesConfig: { enabled: true, count: 4, palette: [] }, tintsConfig: { enabled: true, count: 4, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-600', value: '#2563eb', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-700', value: '#1d4ed8', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-800', value: '#1e40af', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      { id: generateId(), name: '--skele-blue-900', value: '#1e3a8a', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: false }, utilityConfig: { text: true, background: true, border: true, fill: true } },
    ]
  },
  {
      id: generateId(),
      name: 'Semantic Colors',
      colors: [
          { id: generateId(), name: '--skele-success', value: '#22c55e', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
          { id: generateId(), name: '--skele-warning', value: '#eab308', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
          { id: generateId(), name: '--skele-danger', value: '#ef4444', format: 'HEX', shadesConfig: { enabled: false, count: 8, palette: [] }, tintsConfig: { enabled: false, count: 8, palette: [] }, transparentConfig: { enabled: true }, utilityConfig: { text: true, background: true, border: true, fill: true } },
      ]
  }
];

// 2. SPACING
export const skelementorSpacingGroups = [{
  id: generateId(),
  name: 'Skele-Space',
  settings: { namingConvention: 'space', minSize: 16, maxSize: 24, minScaleRatio: 1.25, maxScaleRatio: 1.333, baseScaleIndex: 'm', negativeSteps: 4, positiveSteps: 4 }
}];
export const skelementorSpacingVariableGroups = [];
export const skelementorSpacingSelectorGroups = [];

// 3. TYPOGRAPHY
export const skelementorTypographyGroups = [{
  id: generateId(),
  name: 'Skele-Text',
  settings: { namingConvention: 'text', minSize: 16, maxSize: 20, minScaleRatio: 1.2, maxScaleRatio: 1.25, baseScaleIndex: 'm', negativeSteps: 2, positiveSteps: 6 }
}];
export const skelementorTypographyVariableGroups = [{
    id: generateId(),
    name: 'Font Families & Weights',
    variables: [
        { id: generateId(), name: '--font-sans', value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--font-weight-normal', value: '400', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--font-weight-bold', value: '700', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--line-height-base', value: '1.6', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--line-height-heading', value: '1.2', mode: 'single', minValue: 0, maxValue: 0 },
    ]
}];
export const skelementorTypographySelectorGroups = [{
    id: generateId(),
    name: 'Base Typography',
    rules: [
        { id: generateId(), selector: 'body', properties: [{ id: generateId(), property: 'font-family', value: 'var(--font-sans)' }, { id: generateId(), property: 'color', value: 'var(--skele-slate-300)' }, { id: generateId(), property: 'line-height', value: 'var(--line-height-base)' }] },
        { id: generateId(), selector: 'h1, h2, h3, h4, h5, h6', properties: [{ id: generateId(), property: 'font-weight', value: 'var(--font-weight-bold)' }, { id: generateId(), property: 'color', value: 'var(--skele-slate-100)' }, { id: generateId(), property: 'line-height', value: 'var(--line-height-heading)' }] },
        { id: generateId(), selector: 'h1', properties: [{ id: generateId(), property: 'font-size', value: 'var(--text-4xl)' }] },
        { id: generateId(), selector: 'h2', properties: [{ id: generateId(), property: 'font-size', value: 'var(--text-3xl)' }] },
        { id: generateId(), selector: 'p', properties: [{ id: generateId(), property: 'font-size', value: 'var(--text-m)' }, { id: generateId(), property: 'margin-bottom', value: 'var(--space-s)' }] },
        { id: generateId(), selector: 'a', properties: [{ id: generateId(), property: 'color', value: 'var(--skele-blue-400)' }, { id: generateId(), property: 'text-decoration', value: 'none' }, { id: generateId(), property: 'transition', value: 'color var(--transition-speed) ease' }] },
        { id: generateId(), selector: 'a:hover', properties: [{ id: generateId(), property: 'text-decoration', value: 'underline' }, { id: generateId(), property: 'color', value: 'var(--skele-blue-300)' }] },
    ]
}];

// 4. LAYOUT
export const skelementorLayoutVariableGroups = [{
    id: generateId(),
    name: 'Layout Structure',
    variables: [
        { id: generateId(), name: '--container-max-width', value: '1140px', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--container-padding-x', value: 'var(--space-l)', mode: 'single', minValue: 0, maxValue: 0 },
        { id: generateId(), name: '--header-height', value: '64px', mode: 'single', minValue: 0, maxValue: 0 },
    ]
}];
export const skelementorLayoutSelectorGroups = [{
    id: generateId(),
    name: 'Layout Helpers',
    rules: [
        { id: generateId(), selector: '.container', properties: [{ id: generateId(), property: 'width', value: '100%' }, { id: generateId(), property: 'max-width', value: 'var(--container-max-width)' }, { id: generateId(), property: 'margin-left', value: 'auto' }, { id: generateId(), property: 'margin-right', value: 'auto' }, { id: generateId(), property: 'padding-left', value: 'var(--container-padding-x)' }, { id: generateId(), property: 'padding-right', value: 'var(--container-padding-x)' }] },
        { id: generateId(), selector: '.flex-center', properties: [{ id: generateId(), property: 'display', value: 'flex' }, { id: generateId(), property: 'align-items', value: 'center' }, { id: generateId(), property: 'justify-content', value: 'center' }] },
        { id: generateId(), selector: '.flex-between', properties: [{ id: generateId(), property: 'display', value: 'flex' }, { id: generateId(), property: 'align-items', value: 'center' }, { id: generateId(), property: 'justify-content', value: 'space-between' }] },
    ]
}];

// 5. DESIGN
export const skelementorDesignVariableGroups = [
    {
        id: generateId(),
        name: 'Borders & Shadows',
        variables: [
            { id: generateId(), name: '--radius-sm', value: '4px', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--radius-md', value: '8px', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--radius-lg', value: '16px', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--radius-full', value: '9999px', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--shadow-md', value: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--shadow-lg', value: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--transition-speed', value: '200ms', mode: 'single', minValue: 0, maxValue: 0 },
            { id: generateId(), name: '--focus-ring-color', value: 'var(--skele-blue-400)', mode: 'single', minValue: 0, maxValue: 0 },
        ]
    }
];
export const skelementorDesignSelectorGroups = [{
    id: generateId(),
    name: 'Global Styles',
    rules: [{
        id: generateId(),
        selector: '*:focus-visible',
        properties: [
            { id: generateId(), property: 'outline', value: '2px solid var(--focus-ring-color)' },
            { id: generateId(), property: 'outline-offset', value: '2px' },
        ]
    }]
}];

// 6. COMPONENTS
export const skelementorComponents = [
    {
        id: generateId(), type: 'button', name: 'btn',
        styles: [ { id: generateId(), prop: 'display', value: 'inline-flex' }, { id: generateId(), prop: 'align-items', value: 'center' }, { id: generateId(), prop: 'justify-content', value: 'center' }, { id: generateId(), prop: 'gap', value: 'var(--space-xs)' }, { id: generateId(), prop: 'padding', value: 'var(--space-xs) var(--space-m)' }, { id: generateId(), prop: 'background-color', value: 'var(--skele-blue-600)' }, { id: generateId(), prop: 'color', value: 'var(--skele-white)' }, { id: generateId(), prop: 'font-size', value: 'var(--text-m)' }, { id: generateId(), prop: 'font-weight', value: 'var(--font-weight-bold)' }, { id: generateId(), prop: 'border-radius', value: 'var(--radius-md)' }, { id: generateId(), prop: 'border', value: '1px solid transparent' }, { id: generateId(), prop: 'cursor', value: 'pointer' }, { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' }, ],
        states: {
            hover: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-blue-700)' }, { id: generateId(), prop: 'transform', value: 'translateY(-1px)' }],
            disabled: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-slate-700)' }, { id: generateId(), prop: 'color', value: 'var(--skele-slate-500)' }, { id: generateId(), prop: 'cursor', value: 'not-allowed' }]
        },
        modifiers: [
            { id: generateId(), name: 'secondary', styles: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-slate-700)' }, { id: generateId(), prop: 'border-color', value: 'var(--skele-slate-600)' }, { id: generateId(), prop: 'color', value: 'var(--skele-slate-100)' }], states: { hover: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-slate-600)' }] } },
            { id: generateId(), name: 'danger', styles: [{ id: generateId(), prop: 'background-color', value: 'transparent' }, { id: generateId(), prop: 'border-color', value: 'var(--skele-danger)' }, { id: generateId(), prop: 'color', value: 'var(--skele-danger)' }], states: { hover: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-danger)' }, { id: generateId(), prop: 'color', value: 'var(--skele-white)' }] } },
            { id: generateId(), name: 'ghost', styles: [{ id: generateId(), prop: 'background-color', value: 'transparent' }, { id: generateId(), prop: 'color', value: 'var(--skele-blue-300)' }], states: { hover: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-blue-500-t-10)' }, { id: generateId(), prop: 'color', value: 'var(--skele-blue-200)' }] } },
            { id: generateId(), name: 'pill', styles: [{ id: generateId(), prop: 'border-radius', value: 'var(--radius-full)' }], states: {} },
            { id: generateId(), name: 'sm', styles: [{ id: generateId(), prop: 'padding', value: 'var(--space-2xs) var(--space-s)' }, { id: generateId(), prop: 'font-size', value: 'var(--text-s)' }], states: {} },
            { id: generateId(), name: 'lg', styles: [{ id: generateId(), prop: 'padding', value: 'var(--space-s) var(--space-l)' }, { id: generateId(), prop: 'font-size', value: 'var(--text-l)' }], states: {} }
        ],
    },
    // Enhanced Button Variations
    {
        id: generateId(), type: 'button', name: 'btn-gradient',
        styles: [
            { id: generateId(), prop: 'display', value: 'inline-flex' },
            { id: generateId(), prop: 'align-items', value: 'center' },
            { id: generateId(), prop: 'justify-content', value: 'center' },
            { id: generateId(), prop: 'gap', value: 'var(--space-xs)' },
            { id: generateId(), prop: 'padding', value: 'var(--space-xs) var(--space-m)' },
            { id: generateId(), prop: 'background', value: 'linear-gradient(135deg, var(--skele-blue-600), var(--skele-blue-500))' },
            { id: generateId(), prop: 'color', value: 'var(--skele-white)' },
            { id: generateId(), prop: 'font-size', value: 'var(--text-m)' },
            { id: generateId(), prop: 'font-weight', value: 'var(--font-weight-bold)' },
            { id: generateId(), prop: 'border-radius', value: 'var(--radius-md)' },
            { id: generateId(), prop: 'border', value: 'none' },
            { id: generateId(), prop: 'cursor', value: 'pointer' },
            { id: generateId(), prop: 'position', value: 'relative' },
            { id: generateId(), prop: 'overflow', value: 'hidden' },
            { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' },
            { id: generateId(), prop: 'box-shadow', value: '0 4px 15px var(--skele-blue-500-t-30)' }
        ],
        states: {
            hover: [
                { id: generateId(), prop: 'transform', value: 'translateY(-2px)' },
                { id: generateId(), prop: 'box-shadow', value: '0 8px 25px var(--skele-blue-500-t-40)' }
            ],
            active: [
                { id: generateId(), prop: 'transform', value: 'translateY(0)' }
            ]
        },
        modifiers: [
            { 
                id: generateId(), name: 'shimmer', 
                styles: [
                    { id: generateId(), prop: 'background-size', value: '200% 100%' },
                    { id: generateId(), prop: 'animation', value: 'shimmer 2s infinite' }
                ], 
                states: {} 
            }
        ]
    },
    {
        id: generateId(), type: 'button', name: 'btn-neon',
        styles: [
            { id: generateId(), prop: 'display', value: 'inline-flex' },
            { id: generateId(), prop: 'align-items', value: 'center' },
            { id: generateId(), prop: 'justify-content', value: 'center' },
            { id: generateId(), prop: 'gap', value: 'var(--space-xs)' },
            { id: generateId(), prop: 'padding', value: 'var(--space-xs) var(--space-m)' },
            { id: generateId(), prop: 'background-color', value: 'transparent' },
            { id: generateId(), prop: 'color', value: 'var(--skele-blue-400)' },
            { id: generateId(), prop: 'font-size', value: 'var(--text-m)' },
            { id: generateId(), prop: 'font-weight', value: 'var(--font-weight-bold)' },
            { id: generateId(), prop: 'border-radius', value: 'var(--radius-md)' },
            { id: generateId(), prop: 'border', value: '2px solid var(--skele-blue-400)' },
            { id: generateId(), prop: 'cursor', value: 'pointer' },
            { id: generateId(), prop: 'position', value: 'relative' },
            { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' },
            { id: generateId(), prop: 'text-shadow', value: '0 0 10px var(--skele-blue-400)' },
            { id: generateId(), prop: 'box-shadow', value: '0 0 20px var(--skele-blue-400-t-30), inset 0 0 20px var(--skele-blue-400-t-10)' }
        ],
        states: {
            hover: [
                { id: generateId(), prop: 'color', value: 'var(--skele-white)' },
                { id: generateId(), prop: 'background-color', value: 'var(--skele-blue-400-t-10)' },
                { id: generateId(), prop: 'box-shadow', value: '0 0 30px var(--skele-blue-400-t-50), inset 0 0 30px var(--skele-blue-400-t-20)' }
            ]
        },
        modifiers: []
    },
        {
        id: generateId(), type: 'input', name: 'input',
        styles: [ { id: generateId(), prop: 'padding', value: 'var(--space-xs) var(--space-s)' }, { id: generateId(), prop: 'font-size', value: 'var(--text-m)' }, { id: generateId(), prop: 'background-color', value: 'var(--skele-slate-800)' }, { id: generateId(), prop: 'color', value: 'var(--skele-slate-200)' }, { id: generateId(), prop: 'border', value: '1px solid var(--skele-slate-600)' }, { id: generateId(), prop: 'border-radius', value: 'var(--radius-md)' }, { id: generateId(), prop: 'transition', value: 'border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease' }, ],
        states: {
            focus: [{ id: generateId(), prop: 'outline', value: 'none' }, { id: generateId(), prop: 'border-color', value: 'var(--skele-blue-500)' }, { id: generateId(), prop: 'box-shadow', value: '0 0 0 2px var(--skele-black), 0 0 0 4px var(--skele-blue-500-t-50)' }],
            disabled: [{ id: generateId(), prop: 'background-color', value: 'var(--skele-slate-700)' }, { id: generateId(), prop: 'cursor', value: 'not-allowed' }, { id: generateId(), prop: 'opacity', value: '0.6' }]
        },
        modifiers: [],
    },
    // Enhanced Input Variations
    {
        id: generateId(), type: 'input', name: 'input-modern',
        styles: [
            { id: generateId(), prop: 'padding', value: 'var(--space-s) var(--space-m)' },
            { id: generateId(), prop: 'font-size', value: 'var(--text-m)' },
            { id: generateId(), prop: 'background-color', value: 'var(--skele-slate-900)' },
            { id: generateId(), prop: 'color', value: 'var(--skele-slate-100)' },
            { id: generateId(), prop: 'border', value: '2px solid var(--skele-slate-700)' },
            { id: generateId(), prop: 'border-radius', value: 'var(--radius-lg)' },
            { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' },
            { id: generateId(), prop: 'position', value: 'relative' }
        ],
        states: {
            focus: [
                { id: generateId(), prop: 'outline', value: 'none' },
                { id: generateId(), prop: 'border-color', value: 'var(--skele-blue-500)' },
                { id: generateId(), prop: 'box-shadow', value: '0 0 0 4px var(--skele-blue-500-t-20)' },
                { id: generateId(), prop: 'background-color', value: 'var(--skele-slate-800)' }
            ],
            hover: [
                { id: generateId(), prop: 'border-color', value: 'var(--skele-slate-600)' }
            ]
        },
        modifiers: []
    },

    {
        id: generateId(), type: 'input', name: 'input-floating',
        styles: [
            { id: generateId(), prop: 'padding', value: 'var(--space-m) var(--space-s)' },
            { id: generateId(), prop: 'font-size', value: 'var(--text-m)' },
            { id: generateId(), prop: 'background-color', value: 'transparent' },
            { id: generateId(), prop: 'color', value: 'var(--skele-slate-200)' },
            { id: generateId(), prop: 'border', value: 'none' },
            { id: generateId(), prop: 'border-bottom', value: '2px solid var(--skele-slate-600)' },
            { id: generateId(), prop: 'border-radius', value: '0' },
            { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' }
        ],
        states: {
            focus: [
                { id: generateId(), prop: 'outline', value: 'none' },
                { id: generateId(), prop: 'border-bottom-color', value: 'var(--skele-blue-500)' }
            ]
        },
        modifiers: []
    },

    // Textarea Variations
    {
        id: generateId(), type: 'textarea', name: 'textarea-enhanced',
        styles: [
            { id: generateId(), prop: 'padding', value: 'var(--space-s)' },
            { id: generateId(), prop: 'font-size', value: 'var(--text-m)' },
            { id: generateId(), prop: 'background-color', value: 'var(--skele-slate-800)' },
            { id: generateId(), prop: 'color', value: 'var(--skele-slate-200)' },
            { id: generateId(), prop: 'border', value: '1px solid var(--skele-slate-600)' },
            { id: generateId(), prop: 'border-radius', value: 'var(--radius-lg)' },
            { id: generateId(), prop: 'transition', value: 'all var(--transition-speed) ease' },
            { id: generateId(), prop: 'resize', value: 'vertical' },
            { id: generateId(), prop: 'min-height', value: '120px' },
            { id: generateId(), prop: 'font-family', value: 'var(--font-sans)' },
            { id: generateId(), prop: 'line-height', value: '1.5' }
        ],
        states: {
            focus: [
                { id: generateId(), prop: 'outline', value: 'none' },
                { id: generateId(), prop: 'border-color', value: 'var(--skele-blue-500)' },
                { id: generateId(), prop: 'box-shadow', value: '0 0 0 3px var(--skele-blue-500-t-20)' },
                { id: generateId(), prop: 'background-color', value: 'var(--skele-slate-750)' }
            ]
        },
        modifiers: []
    }
];

// 7. CUSTOM CSS
export const skelementorCustomCSS = `
/* A simple CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}
html, body {
    height: 100%;
}
body {
  margin: 0;
  background-color: var(--skele-slate-900);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
`;