// src/utils/componentStyler.js
import { colord } from 'colord';
import chroma from 'chroma-js';
import { generateSpacingScale } from './spacingCalculator';

// Helper functions adapted from cssGenerator.js
const formatColorValue = (color) => {
  const c = colord(color.value);
  if (!c.isValid()) return color.value;
  switch (color.format.toUpperCase()) {
    case 'HEX': return c.alpha(1).toHex();
    case 'HEXA': return c.toHex();
    case 'RGB': return `rgb(${c.toRgb().r}, ${c.toRgb().g}, ${c.toRgb().b})`;
    case 'RGBA': return c.toRgbString();
    case 'HSL': return `hsl(${c.toHsl().h}, ${c.toHsl().s}%, ${c.toHsl().l}%)`;
    case 'HSLA': return c.toHslString();
    default: return c.toHex();
  }
};

const formatSwatchColorValue = (hexValue, parentFormat) => {
    const c = colord(hexValue);
    if (!c.isValid()) return hexValue;
    switch (parentFormat.toUpperCase()) {
        case 'HEX': return c.alpha(1).toHex(); case 'HEXA': return c.toHex();
        case 'RGB': return `rgb(${c.toRgb().r}, ${c.toRgb().g}, ${c.toRgb().b})`;
        case 'RGBA': return c.toRgbString();
        case 'HSL': return `hsl(${c.toHsl().h}, ${c.toHsl().s}%, ${c.toHsl().l}%)`;
        case 'HSLA': return c.toHslString();
        default: return c.toHex();
    }
}

const formatTransparentValue = (baseColor, parentFormat, alpha) => {
    const c = colord(baseColor).alpha(alpha);
    const format = parentFormat.toUpperCase();
    if (format.includes('HSL')) return c.toHslString();
    if (format.includes('RGB')) return c.toRgbString();
    return c.toHex();
}


/**
 * Generates a complete, SCOPED CSS stylesheet for a component preview, including all variables.
 */
export const generateComponentStylesheet = (data) => {
  const { 
    component, 
    previewId,
    colorGroups,
    spacingGroups,
    typographyGroups,
    layoutVariableGroups,
    designVariableGroups,
  } = data;

  if (!component || !previewId) return '';

  let cssString = '';
  let cssLines = [];

  // --- START VARIABLE DEFINITIONS ---
  cssLines.push(`.${previewId} {`);
  
  const allColors = colorGroups.flatMap(group => group.colors);
  const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];

  allColors.forEach(color => {
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) { color.shadesConfig.palette.forEach((shade, index) => { const varName = `${color.name}-d-${index + 1}`; cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`); }); }
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) { color.tintsConfig.palette.forEach((tint, index) => { const varName = `${color.name}-l-${index + 1}`; cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`); }); }
    if (color.transparentConfig?.enabled) { alphaSteps.forEach(step => { const varName = `${color.name}-t-${step}`; const alphaValue = step / 100; cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`); }); }
  });

  const generateScaleCss = (groups) => {
    (groups || []).forEach(group => {
        const scale = generateSpacingScale(group.settings);
        scale.forEach(item => {
            const minRem = item.min / 16;
            const maxRem = item.max / 16;
            const vwCoefficient = (100 * (maxRem - minRem)) / (1400 - 320);
            const remConstant = minRem - (320 * vwCoefficient / 100);
            const clampValue = `clamp(${minRem}rem, ${remConstant.toFixed(4)}rem + ${vwCoefficient.toFixed(4)}vw, ${maxRem}rem)`;
            cssLines.push(`  ${item.name}: ${clampValue};`);
        });
    });
  };

  generateScaleCss(spacingGroups);
  generateScaleCss(typographyGroups);
  
  const generateCustomVarsCss = (variableGroups) => {
     (variableGroups || []).forEach(group => {
         group.variables.forEach(variable => {
             if (variable.name && (variable.value || variable.mode === 'minmax')) {
                 if (variable.mode === 'single') {
                     cssLines.push(`  ${variable.name}: ${variable.value};`);
                 } else {
                     const minRem = (variable.minValue || 0) / 16; const maxRem = (variable.maxValue || 0) / 16; const vwCoefficient = (100 * (maxRem - minRem)) / (1400 - 320); const remConstant = minRem - (320 * vwCoefficient / 100); const clampValue = `clamp(${minRem}rem, ${remConstant.toFixed(4)}rem + ${vwCoefficient.toFixed(4)}vw, ${maxRem}rem)`; cssLines.push(`  ${variable.name}: ${clampValue};`);
                 }
             }
         });
     });
  };
  
  generateCustomVarsCss(layoutVariableGroups);
  generateCustomVarsCss(designVariableGroups);

  cssLines.push('}');
  // --- END VARIABLE DEFINITIONS ---


  // --- START COMPONENT RULE DEFINITIONS ---
  const { name, styles, states, modifiers, type } = component;
  
  const createRule = (selector, styleArray) => {
    if (!styleArray || !Array.isArray(styleArray) || styleArray.length === 0) return '';
    const scopedSelector = `.${previewId} ${selector}`;

    const properties = styleArray
      .map(({ prop, value }) => (prop && value ? `  ${prop}: ${value};` : ''))
      .filter(Boolean)
      .join('\n');
    if (!properties) return '';
    return `${scopedSelector} {\n${properties}\n}\n`;
  };

  cssString += createRule(`.${name}`, styles);

  if (states && type !== 'checkbox' && type !== 'radio') {
    for (const state in states) {
      cssString += createRule(`.${name}:${state}`, states[state]);
    }
  }

  if (modifiers) {
    modifiers.forEach(mod => {
      const selector = mod.tag 
        ? `.${name} .${mod.name}`
        : `.${name}.${mod.name}`;

      cssString += createRule(selector, mod.styles);

      if (mod.states) {
        for (const state in mod.states) {
          cssString += createRule(`${selector}:${state}`, mod.states[state]);
        }
      }
    });
  }
  
  if (type === 'dropdown') {
    const menuModifier = modifiers.find(m => m.name === 'menu');
    if (menuModifier) {
      cssString += `.${previewId} .${name}:hover .${menuModifier.name} { display: block; }\n`;
    }
  // --- START OF THE FIX ---
  } else if (type === 'checkbox' || type === 'radio') {
    const isCheckbox = type === 'checkbox';
    const inputModName = isCheckbox ? 'checkbox-input' : 'radio-input';
    const boxModName = isCheckbox ? 'checkbox-box' : 'radio-dot';
    const checkModName = isCheckbox ? 'checkbox-check' : 'radio-dot-inner';

    const inputMod = modifiers.find(m => m.name === inputModName);
    const boxMod = modifiers.find(m => m.name === boxModName);
    const checkMod = modifiers.find(m => m.name === checkModName);
    
    if (inputMod && boxMod && states?.checked) {
      const boxStyles = states.checked
        .filter(s => s.target === (isCheckbox ? 'box' : 'dot') && s.prop && s.value)
        .map(s => `  ${s.prop}: ${s.value};`)
        .join('\n');
      
      if (boxStyles) {
        cssString += `.${previewId} .${name} .${inputMod.name}:checked + .${boxMod.name} {\n${boxStyles}\n}\n`;
      }
    }
    
    if (inputMod && boxMod && checkMod && states?.checked) {
      const checkStyles = states.checked
        .filter(s => s.target === (isCheckbox ? 'check' : 'dot-inner') && s.prop && s.value)
        .map(s => `  ${s.prop}: ${s.value};`)
        .join('\n');

      if (checkStyles) {
        cssString += `.${previewId} .${name} .${inputMod.name}:checked + .${boxMod.name} .${checkMod.name} {\n${checkStyles}\n}\n`;
      }
    }
  }
  // --- END OF THE FIX ---

  return cssLines.join('\n') + '\n' + cssString;
};