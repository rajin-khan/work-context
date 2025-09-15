// src/utils/cssGenerator.js
import { colord } from 'colord';
import prettier from 'prettier/standalone';
import * as parserPostCSS from 'prettier/plugins/postcss.js';

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
        case 'HEX': return c.alpha(1).toHex();
        case 'HEXA': return c.toHex();
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

export const generateAndFormatCSS = async (
  colors, 
  spacingScale, 
  spacingSettings, 
  generatorConfig, 
  selectorGroups, 
  variableGroups,
  isSpacingEnabled,
  customCSS // <-- ADD NEW PARAMETER
) => {
  let cssLines = [];
  cssLines.push(':root {');

  if (isSpacingEnabled) {
    cssLines.push('  --min-screen-width: 320px;');
    cssLines.push('  --max-screen-width: 1400px;');
    cssLines.push(''); 

    if (spacingScale && spacingScale.length > 0) {
      cssLines.push('  /* Spacing System */');
      spacingScale.forEach(space => {
        const minRem = space.min / 16;
        const maxRem = space.max / 16;
        const vwCoefficient = (maxRem - minRem) * 1.48;
        const remConstant = minRem * 0.85;
        const clampValue = `clamp(${minRem}rem, calc(${vwCoefficient.toFixed(2)}vw + ${remConstant.toFixed(2)}rem), ${maxRem}rem)`;
        cssLines.push(`  ${space.name}: ${clampValue};`);
      });
      cssLines.push(''); 
    }

    if (variableGroups && variableGroups.length > 0) {
        cssLines.push('  /* Custom Variables */');
        variableGroups.forEach(group => {
            group.variables.forEach(variable => {
                if (variable.name && (variable.value || variable.mode === 'minmax')) {
                    if (variable.mode === 'single') {
                        cssLines.push(`  ${variable.name}: ${variable.value};`);
                    } else {
                        const minRem = (variable.minValue || 0) / 16;
                        const maxRem = (variable.maxValue || 0) / 16;
                        const vwCoefficient = (maxRem - minRem) * 1.48;
                        const remConstant = minRem * 0.85;
                        const clampValue = `clamp(${minRem}rem, calc(${vwCoefficient.toFixed(2)}vw + ${remConstant.toFixed(2)}rem), ${maxRem}rem)`;
                        cssLines.push(`  ${variable.name}: ${clampValue};`);
                    }
                }
            });
        });
        cssLines.push('');
    }
  }
  
  const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const colorTextClasses = [], backgroundClasses = [], borderClasses = [], fillClasses = [];
  colors.forEach(color => {
    const allVariants = [];
    allVariants.push({ varName: color.name });
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) {
      color.shadesConfig.palette.forEach((shade, index) => {
        const varName = `${color.name}-d-${index + 1}`;
        allVariants.push({ varName });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`);
      });
    }
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) {
      color.tintsConfig.palette.forEach((tint, index) => {
        const varName = `${color.name}-l-${index + 1}`;
        allVariants.push({ varName });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`);
      });
    }
    if (color.transparentConfig?.enabled) {
        alphaSteps.forEach(step => {
            const varName = `${color.name}-t-${step}`;
            const alphaValue = step / 100;
            allVariants.push({ varName });
            cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`);
        });
    }
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

  if (isSpacingEnabled) {
    if (generatorConfig && spacingScale && spacingScale.length > 0) {
      const spacingClasses = [];
      generatorConfig.forEach(config => {
        if (config.enabled && config.properties.length > 0 && config.properties.some(p => p.trim() !== '')) {
          const baseClassName = config.className.slice(0, -2);
          spacingScale.forEach(space => {
            const className = `${baseClassName}-${space.id}`;
            const properties = config.properties.map(prop => `  ${prop}: var(${space.name});`).join('\n');
            spacingClasses.push(`${className} {\n${properties}\n}`);
          });
        }
      });
      if (spacingClasses.length > 0) {
        cssLines.push('\n/* Spacing Utility Classes */');
        cssLines.push(...spacingClasses);
      }
    }

    if (selectorGroups && selectorGroups.length > 0) {
      const customSelectorClasses = [];
      selectorGroups.forEach(group => {
        group.rules.forEach(rule => {
          if (rule.selector && rule.properties && rule.properties.length > 0) {
            const validProperties = rule.properties
              .filter(prop => prop.property && prop.value)
              .map(prop => `  ${prop.property}: ${prop.value};`);
            
            if (validProperties.length > 0) {
              customSelectorClasses.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`);
            }
          }
        });
      });
      
      if (customSelectorClasses.length > 0) {
          cssLines.push('\n/* Custom Selector Classes */');
          cssLines.push(...customSelectorClasses);
      }
    }
  }

  if ([...colorTextClasses, ...backgroundClasses, ...borderClasses, ...fillClasses].length > 0) {
    cssLines.push('\n/* Color Utility Classes */');
    if (colorTextClasses.length > 0) cssLines.push('\n/* Text Colors */', ...colorTextClasses.sort());
    if (backgroundClasses.length > 0) cssLines.push('\n/* Background Colors */', ...backgroundClasses.sort());
    if (borderClasses.length > 0) cssLines.push('\n/* Border Colors */', ...borderClasses.sort());
    if (fillClasses.length > 0) cssLines.push('\n/* Fill Colors */', ...fillClasses.sort());
  }
  
  // --- NEW LOGIC TO APPEND CUSTOM CSS ---
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