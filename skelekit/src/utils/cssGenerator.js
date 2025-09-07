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
  const utilityClasses = [];

  colors.forEach(color => {
    const allVariants = [];
    
    // 1. Add base color
    allVariants.push({ varName: color.name, value: formatColorValue(color) });
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);

    // 2. Add shades
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) {
      color.shadesConfig.palette.forEach((shade, index) => {
        const varName = `${color.name}-d-${index + 1}`;
        allVariants.push({ varName, value: formatSwatchColorValue(shade, color.format) });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`);
      });
    }

    // 3. Add tints
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) {
      color.tintsConfig.palette.forEach((tint, index) => {
        const varName = `${color.name}-l-${index + 1}`;
        allVariants.push({ varName, value: formatSwatchColorValue(tint, color.format) });
        cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`);
      });
    }

    // 4. Add transparent variants
    if (color.transparentConfig?.enabled) {
        alphaSteps.forEach(step => {
            const varName = `${color.name}-t-${step}`;
            const alphaValue = step / 100;
            allVariants.push({ varName, value: formatTransparentValue(color.value, color.format, alphaValue) });
            cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`);
        });
    }

    // ** THIS IS THE CHANGE: Generate utility classes for all collected variants **
    const { text, background, border, fill } = color.utilityConfig;
    if (text || background || border || fill) {
        allVariants.forEach(variant => {
            // Convert CSS variable name like `--primary-500-d-1` to a class name like `primary-500-d-1`
            const className = variant.varName.startsWith('--') ? variant.varName.slice(2) : variant.varName;

            if (text) utilityClasses.push(`.text-${className} { color: var(${variant.varName}); }`);
            if (background) utilityClasses.push(`.bg-${className} { background-color: var(${variant.varName}); }`);
            if (border) utilityClasses.push(`.border-${className} { border-color: var(${variant.varName}); }`);
            if (fill) utilityClasses.push(`.fill-${className} { fill: var(${variant.varName}); }`);
        });
    }
  });

  cssLines.push('}'); // Close :root

  // Append utility classes if any were generated
  if (utilityClasses.length > 0) {
      cssLines.push('\n/* Utility Classes */');
      cssLines.push(...utilityClasses);
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