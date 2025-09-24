// src/utils/cssGenerator.js
import { colord } from 'colord';
import prettier from 'prettier/standalone';
import * as parserPostCSS from 'prettier/plugins/postcss.js';
import { generateSpacingScale } from './spacingCalculator';

// --- START OF THE FIX ---
// Helper function to round to a maximum of 2 decimal places.
const round = (num) => Math.round(num * 100) / 100;

// Reusable function to generate the clamp() string with the corrected formula and rounding.
const generateClampValue = (minPx, maxPx) => {
  // 1. Convert to REM and round before any calculations.
  const minRem = round(minPx / 16);
  const maxRem = round(maxPx / 16);

  // 2. Apply the new custom formulas.
  const vwCoefficient = (maxRem - minRem) * 1.48;
  const remConstant = minRem * 0.85;

  // 3. Assemble the final string, using calc() and ensuring ALL values are rounded to 2 decimal places.
  // .toFixed(2) ensures consistent formatting (e.g., 1.5 becomes 1.50).
  return `clamp(${minRem.toFixed(2)}rem, calc(${round(remConstant).toFixed(2)}rem + ${round(vwCoefficient).toFixed(2)}vw), ${maxRem.toFixed(2)}rem)`;
};
// --- END OF THE FIX ---

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

export const generateAndFormatCSS = async (data) => {
  const {
    colors,
    spacingScale,
    spacingGroups,
    isTypographyEnabled,
    typographyScale,
    typographyGeneratorConfig,
    typographyGroups,
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
  } = data;
  
  let cssLines = [];
  cssLines.push(':root {');

  if (isSpacingEnabled || isTypographyEnabled) {
    cssLines.push('  --min-screen-width: 320px;');
    cssLines.push('  --max-screen-width: 1400px;');
    cssLines.push(''); 
  }

  if (isTypographyEnabled) {
    if (typographyScale && typographyScale.length > 0) {
      cssLines.push('  /* Typography System Variables */');
      typographyScale.forEach(type => {
        const clampValue = generateClampValue(type.min, type.max);
        cssLines.push(`  ${type.name}: ${clampValue};`);
      });
      cssLines.push('');
    }
    if (typographyVariableGroups && typographyVariableGroups.length > 0) {
      cssLines.push('  /* Custom Typography Variables */');
      typographyVariableGroups.forEach(group => { group.variables.forEach(variable => { if (variable.name && (variable.value || variable.mode === 'minmax')) { if (variable.mode === 'single') { cssLines.push(`  ${variable.name}: ${variable.value};`); } else { const clampValue = generateClampValue(variable.minValue || 0, variable.maxValue || 0); cssLines.push(`  ${variable.name}: ${clampValue};`); } } }); });
      cssLines.push('');
    }
  }
  
  if (isSpacingEnabled) {
    if (spacingScale && spacingScale.length > 0) {
      cssLines.push('  /* Spacing System Variables */');
      spacingScale.forEach(space => {
        const clampValue = generateClampValue(space.min, space.max);
        cssLines.push(`  ${space.name}: ${clampValue};`);
      });
      cssLines.push(''); 
    }
    if (variableGroups && variableGroups.length > 0) {
        cssLines.push('  /* Custom Spacing Variables */');
        variableGroups.forEach(group => { group.variables.forEach(variable => { if (variable.name && (variable.value || variable.mode === 'minmax')) { if (variable.mode === 'single') { cssLines.push(`  ${variable.name}: ${variable.value};`); } else { const clampValue = generateClampValue(variable.minValue || 0, variable.maxValue || 0); cssLines.push(`  ${variable.name}: ${clampValue};`); } } }); });
        cssLines.push('');
    }
  }
  
  if (layoutVariableGroups && layoutVariableGroups.length > 0) {
    cssLines.push('  /* Custom Layout Variables */');
    layoutVariableGroups.forEach(group => { group.variables.forEach(variable => { if (variable.name && (variable.value || variable.mode === 'minmax')) { if (variable.mode === 'single') { cssLines.push(`  ${variable.name}: ${variable.value};`); } else { const clampValue = generateClampValue(variable.minValue || 0, variable.maxValue || 0); cssLines.push(`  ${variable.name}: ${clampValue};`); } } }); });
    cssLines.push('');
  }
  
  if (designVariableGroups && designVariableGroups.length > 0) {
    cssLines.push('  /* Custom Design Variables */');
    designVariableGroups.forEach(group => { group.variables.forEach(variable => { if (variable.name && (variable.value || variable.mode === 'minmax')) { if (variable.mode === 'single') { cssLines.push(`  ${variable.name}: ${variable.value};`); } else { const clampValue = generateClampValue(variable.minValue || 0, variable.maxValue || 0); cssLines.push(`  ${variable.name}: ${clampValue};`); } } }); });
    cssLines.push('');
  }

  const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const colorTextClasses = [], backgroundClasses = [], borderClasses = [], fillClasses = [];
  colors.forEach(color => {
    const allVariants = [];
    allVariants.push({ varName: color.name });
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) { color.shadesConfig.palette.forEach((shade, index) => { const varName = `${color.name}-d-${index + 1}`; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`); }); }
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) { color.tintsConfig.palette.forEach((tint, index) => { const varName = `${color.name}-l-${index + 1}`; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`); }); }
    if (color.transparentConfig?.enabled) { alphaSteps.forEach(step => { const varName = `${color.name}-t-${step}`; const alphaValue = step / 100; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`); }); }
    const { text, background, border, fill } = color.utilityConfig;
    allVariants.forEach(variant => {
        const className = variant.varName.startsWith('--') ? variant.varName.slice(2) : variant.varName;
        if (text) colorTextClasses.push(`.text-${className} { color: var(${variant.varName}); }`);
        if (background) backgroundClasses.push(`.bg-${className} { background-color: var(${variant.varName}); }`);
        if (border) borderClasses.push(`.border-${className} { border-color: var(${variant.varName}); }`);
        if (fill) fillClasses.push(`.fill-${className} { fill: var(${variant.varName}); }`);
    });
  });

  cssLines.push('}');
  
  if (isTypographyEnabled) {
    const typographyClasses = [];
    typographyGeneratorConfig.forEach(config => {
      if (!config.enabled || !config.scaleGroupId || config.properties.length === 0 || !config.properties.some(p => p.trim() !== '')) { return; }
      const sourceGroup = typographyGroups.find(g => g.id === config.scaleGroupId);
      if (!sourceGroup) return;
      const scaleForThisGenerator = generateSpacingScale(sourceGroup.settings);
      const baseClassName = config.className.slice(0, -2);
      scaleForThisGenerator.forEach(typeStep => {
        const className = `${baseClassName}-${typeStep.id}`;
        const properties = config.properties.map(prop => `  ${prop}: var(${typeStep.name});`).join('\n');
        typographyClasses.push(`${className} {\n${properties}\n}`);
      });
    });
    if (typographyClasses.length > 0) { cssLines.push('\n/* Typography Utility Classes */'); cssLines.push(...typographyClasses); }
    if (typographySelectorGroups && typographySelectorGroups.length > 0) {
      const customTypeSelectorClasses = [];
      typographySelectorGroups.forEach(group => { group.rules.forEach(rule => { if (rule.selector && rule.properties && rule.properties.length > 0) { const validProperties = rule.properties.filter(prop => prop.property && prop.value).map(prop => `  ${prop.property}: ${prop.value};`); if (validProperties.length > 0) { customTypeSelectorClasses.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`); } } }); });
      if (customTypeSelectorClasses.length > 0) { cssLines.push('\n/* Custom Typography Selectors */'); cssLines.push(...customTypeSelectorClasses); }
    }
  }

  if (isSpacingEnabled) {
    const spacingClasses = [];
    generatorConfig.forEach(config => {
        if (!config.enabled || !config.scaleGroupId || config.properties.length === 0 || !config.properties.some(p => p.trim() !== '')) { return; }
        const sourceGroup = spacingGroups.find(g => g.id === config.scaleGroupId);
        if (!sourceGroup) return;
        const scaleForThisGenerator = generateSpacingScale(sourceGroup.settings);
        const baseClassName = config.className.slice(0, -2);
        scaleForThisGenerator.forEach(space => {
            const className = `${baseClassName}-${space.id}`;
            const properties = config.properties.map(prop => `  ${prop}: var(${space.name});`).join('\n');
            spacingClasses.push(`${className} {\n${properties}\n}`);
        });
    });
    if (spacingClasses.length > 0) { cssLines.push('\n/* Spacing Utility Classes */'); cssLines.push(...spacingClasses); }
    if (selectorGroups && selectorGroups.length > 0) {
      const customSelectorClasses = [];
      selectorGroups.forEach(group => { group.rules.forEach(rule => { if (rule.selector && rule.properties && rule.properties.length > 0) { const validProperties = rule.properties.filter(prop => prop.property && prop.value).map(prop => `  ${prop.property}: ${prop.value};`); if (validProperties.length > 0) { customSelectorClasses.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`); } } }); });
      if (customSelectorClasses.length > 0) { cssLines.push('\n/* Custom Spacing Selectors */'); cssLines.push(...customSelectorClasses); }
    }
  }

  if (layoutSelectorGroups && layoutSelectorGroups.length > 0) {
    const customLayoutClasses = [];
    layoutSelectorGroups.forEach(group => { group.rules.forEach(rule => { if (rule.selector && rule.properties && rule.properties.length > 0) { const validProperties = rule.properties.filter(prop => prop.property && prop.value).map(prop => `  ${prop.property}: ${prop.value};`); if (validProperties.length > 0) { customLayoutClasses.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`); } } }); });
    if (customLayoutClasses.length > 0) { cssLines.push('\n/* Custom Layout Selectors */'); cssLines.push(...customLayoutClasses); }
  }

  if (designSelectorGroups && designSelectorGroups.length > 0) {
    const customDesignClasses = [];
    designSelectorGroups.forEach(group => { group.rules.forEach(rule => { if (rule.selector && rule.properties && rule.properties.length > 0) { const validProperties = rule.properties.filter(prop => prop.property && prop.value).map(prop => `  ${prop.property}: ${prop.value};`); if (validProperties.length > 0) { customDesignClasses.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`); } } }); });
    if (customDesignClasses.length > 0) { cssLines.push('\n/* Custom Design Selectors */'); cssLines.push(...customDesignClasses); }
  }

  if ([...colorTextClasses, ...backgroundClasses, ...borderClasses, ...fillClasses].length > 0) {
    cssLines.push('\n/* Color Utility Classes */');
    if (colorTextClasses.length > 0) cssLines.push('\n/* Text Colors */', ...colorTextClasses.sort());
    if (backgroundClasses.length > 0) cssLines.push('\n/* Background Colors */', ...backgroundClasses.sort());
    if (borderClasses.length > 0) cssLines.push('\n/* Border Colors */', ...borderClasses.sort());
    if (fillClasses.length > 0) cssLines.push('\n/* Fill Colors */', ...fillClasses.sort());
  }
  
  if (customCSS && customCSS.trim() !== '' && !customCSS.includes('/* Your custom styles go here */')) {
      cssLines.push('\n/* Custom User Stylesheet */');
      cssLines.push(customCSS);
  }

  const rawCss = cssLines.join('\n');

  try {
    const formattedCss = await prettier.format(rawCss, { parser: 'css', plugins: [parserPostCSS], printWidth: 80 });
    return formattedCss;
  } catch (error) {
    console.error("Error formatting CSS:", error);
    return rawCss;
  }
};