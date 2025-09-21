// src/utils/componentStyler.js

/**
 * Generates a complete, SCOPED CSS string for a component preview.
 *
 * @param {object} component - The full component object from the state.
 * @param {string} previewId - A unique ID to scope the CSS selectors (e.g., 'preview-xyz').
 * @returns {string} A raw, scoped CSS string that can be injected into a <style> tag.
 */
export const generateComponentCSS = (component, previewId) => {
  if (!component || !previewId) return '';

  const { name, styles, states, modifiers } = component;
  let cssString = '';

  // Helper to convert a style object into a scoped CSS rule string
  const createRule = (selector, styleObject) => {
    if (!styleObject || Object.keys(styleObject).length === 0) return '';
    
    // THIS IS THE KEY FIX: We prepend the unique preview ID to every selector.
    // e.g., '.btn' becomes '.preview-xyz .btn'
    const scopedSelector = `.${previewId} ${selector}`;

    const properties = Object.entries(styleObject)
      .map(([prop, value]) => (prop && value ? `  ${prop}: ${value};` : ''))
      .filter(Boolean)
      .join('\n');
      
    return `${scopedSelector} {\n${properties}\n}\n`;
  };

  // 1. Base Class Styles (.btn)
  cssString += createRule(`.${name}`, styles);

  // 2. Base States (.btn:hover, .btn:focus)
  if (states) {
    for (const state in states) {
      cssString += createRule(`.${name}:${state}`, states[state]);
    }
  }

  // 3. Modifiers (.btn.small, .btn.secondary)
  if (modifiers) {
    modifiers.forEach(mod => {
      // Modifier class itself (.btn.small)
      cssString += createRule(`.${name}.${mod.name}`, mod.styles);
      
      // Modifier states (.btn.small:hover)
      if (mod.states) {
        for (const state in mod.states) {
          cssString += createRule(`.${name}.${mod.name}:${state}`, mod.states[state]);
        }
      }
    });
  }

  return cssString;
};