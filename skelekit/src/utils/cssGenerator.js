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

/**
 * Generates and formats a CSS string from the application's color state.
 * @param {Array} colors - The main colors array from your application state.
 * @returns {Promise<string>} A promise that resolves to a beautifully formatted CSS string.
 */
export const generateAndFormatCSS = async (colors) => {
  let cssLines = [];
  cssLines.push(':root {');
  
  const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  
  const textClasses = [];
  const backgroundClasses = [];
  const borderClasses = [];
  const fillClasses = [];

  colors.forEach(color => {
    const allVariants = [];
    
    // 1. Add base color
    allVariants.push({ varName: color.name });
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);

    // 2. Add shades
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) {
      color.shadesConfig.palette.forEach((shade, index) => {
        const varName = `${color.name}-d-${index + 1}`;
        allVariants.push({ varName });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`);
      });
    }

    // 3. Add tints
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) {
      color.tintsConfig.palette.forEach((tint, index) => {
        const varName = `${color.name}-l-${index + 1}`;
        allVariants.push({ varName });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`);
      });
    }

    // 4. Add transparent variants
    if (color.transparentConfig?.enabled) {
        alphaSteps.forEach(step => {
            const varName = `${color.name}-t-${step}`;
            const alphaValue = step / 100;
            allVariants.push({ varName });
            cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`);
        });
    }

    // Populate the new utility class arrays
    const { text, background, border, fill } = color.utilityConfig;
    
    allVariants.forEach(variant => {
        const className = variant.varName.startsWith('--') ? variant.varName.slice(2) : variant.varName;

        if (text) textClasses.push(`.text-${className} { color: var(${variant.varName}); }`);
        if (background) backgroundClasses.push(`.bg-${className} { background-color: var(${variant.varName}); }`);
        if (border) borderClasses.push(`.border-${className} { border-color: var(${variant.varName}); }`);
        if (fill) fillClasses.push(`.fill-${className} { fill: var(${variant.varName}); }`);
    });
  });

  cssLines.push('}'); // Close :root

  if ([...textClasses, ...backgroundClasses, ...borderClasses, ...fillClasses].length > 0) {
    cssLines.push('\n/* Utility Classes */');
    
    if (textClasses.length > 0) {
      cssLines.push('\n/* Text Colors */');
      cssLines.push(...textClasses.sort());
    }
    if (backgroundClasses.length > 0) {
      cssLines.push('\n/* Background Colors */');
      cssLines.push(...backgroundClasses.sort());
    }
    if (borderClasses.length > 0) {
      cssLines.push('\n/* Border Colors */');
      cssLines.push(...borderClasses.sort());
    }
    if (fillClasses.length > 0) {
      cssLines.push('\n/* Fill Colors */');
      cssLines.push(...fillClasses.sort());
    }
  }

  const rawCss = cssLines.join('\n');

  try {
    const formattedCss = await prettier.format(rawCss, {
      parser: 'css',
      plugins: [parserPostCSS],
      printWidth: 80,
    });
    return formattedCss;
  } catch (error) {
    console.error("Error formatting CSS:", error);
    return rawCss;
  }
};