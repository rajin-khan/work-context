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

// Map scale IDs to Skelementor typography naming patterns
const mapTypographyIdToSkelementor = (id) => {
  const mapping = {
    '2xs': '2xs',
    'xs': 'xs',
    's': 'sm',
    'm': 'base',
    'l': 'lg',
    'xl': 'xl',
    '2xl': '2xl',
    '3xl': '3xl',
    '4xl': '4xl',
    '5xl': '5xl',
    '6xl': '6xl',
    '7xl': '7xl',
    '8xl': '8xl',
    '9xl': '9xl',
  };
  // Handle numeric prefixes like "2xs", "3xl"
  if (id.match(/^\d+xs$/)) {
    return id; // Keep as is for 2xs, 3xs, etc.
  }
  if (id.match(/^\d+xl$/)) {
    return id; // Keep as is for 2xl, 3xl, etc.
  }
  return mapping[id] || id;
};

// Map scale IDs to Skelementor spacing numeric patterns (1, 2, 3, 4, 6, 8, 12)
// This maps based on approximate size values
const mapSpacingIdToSkelementor = (scaleItem) => {
  const avgSize = (scaleItem.min + scaleItem.max) / 2;
  // Map to closest Skelementor spacing value
  // Skelementor uses: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px)
  const sizeMap = [
    { size: 4, name: '1' },
    { size: 8, name: '2' },
    { size: 12, name: '3' },
    { size: 16, name: '4' },
    { size: 24, name: '6' },
    { size: 32, name: '8' },
    { size: 48, name: '12' },
  ];
  
  // Find closest match
  let closest = sizeMap[0];
  let minDiff = Math.abs(avgSize - closest.size);
  
  for (const item of sizeMap) {
    const diff = Math.abs(avgSize - item.size);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  
  return closest.name;
};

// Convert spacing property names to Skelementor format
const convertSpacingPropertyToSkelementor = (property) => {
  const mapping = {
    'padding': 'p',
    'padding-left': 'pl',
    'padding-right': 'pr',
    'padding-top': 'pt',
    'padding-bottom': 'pb',
    'padding-horizontal': 'px',
    'padding-vertical': 'py',
    'margin': 'm',
    'margin-left': 'ml',
    'margin-right': 'mr',
    'margin-top': 'mt',
    'margin-bottom': 'mb',
    'margin-horizontal': 'mx',
    'margin-vertical': 'my',
    'gap': 'gap',
  };
  return mapping[property] || property;
};

// Simplify color names to match Skelementor format (white, black, blue, etc.)
const simplifyColorName = (varName) => {
  // Remove --skele- prefix and extract base name
  let name = varName.replace(/^--(skele-)?/, '').replace(/^--/, '');
  // Extract color name and shade (e.g., "blue-500" -> "blue", "slate-100" -> "gray-light")
  const parts = name.split('-');
  if (parts.length >= 2) {
    const colorName = parts[0];
    const shade = parts[1];
    
    // Map to Skelementor color names
    if (colorName === 'white') return 'white';
    if (colorName === 'black') return 'black';
    if (colorName === 'slate') {
      if (shade === '900' || shade === '800') return 'gray-dark';
      if (shade === '500' || shade === '600' || shade === '700') return 'gray';
      if (shade === '100' || shade === '200' || shade === '300') return 'gray-light';
    }
    if (colorName === 'blue') return 'blue';
    if (colorName === 'success' || colorName === 'green') return 'green';
    if (colorName === 'danger' || colorName === 'red') return 'red';
    if (colorName === 'warning' || colorName === 'yellow') return 'yellow';
    
    // Default: use color name
    return colorName;
  }
  return name;
};

// Generate Skelementor-compatible CSS format
export const generateSkelementorCSS = async (data) => {
  const {
    colors,
    spacingScale,
    spacingGroups,
    isTypographyEnabled,
    typographyScale,
    typographyGeneratorConfig,
    typographyGroups,
    generatorConfig,
    isSpacingEnabled,
    typographyVariableGroups,
  } = data;
  
  let cssLines = [];
  cssLines.push('/* ========================================');
  cssLines.push('   SKELEMENTOR FLUID UTILITY FRAMEWORK');
  cssLines.push('   Generated by Skelekit');
  cssLines.push('   ======================================== */');
  cssLines.push('');
  cssLines.push(':root {');
  
  // Only color variables - keep original naming
  if (colors && colors.length > 0) {
    cssLines.push('  /* Brand Colors */');
    const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    colors.forEach(color => {
      const colorValue = formatColorValue(color);
      cssLines.push(`  ${color.name}: ${colorValue};`);
      if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) {
        color.shadesConfig.palette.forEach((shade, index) => {
          const varName = `${color.name}-d-${index + 1}`;
          cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`);
        });
      }
      if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) {
        color.tintsConfig.palette.forEach((tint, index) => {
          const varName = `${color.name}-l-${index + 1}`;
          cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`);
        });
      }
      if (color.transparentConfig?.enabled) {
        alphaSteps.forEach(step => {
          const varName = `${color.name}-t-${step}`;
          const alphaValue = step / 100;
          cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`);
        });
      }
    });
    cssLines.push('');
  }
  
  // Only spacing variables (simple px values, not clamp)
  if (isSpacingEnabled && spacingScale && spacingScale.length > 0) {
    cssLines.push('  /* Spacing Scale */');
    // Map to Skelementor spacing variable names (space-1, space-2, etc.)
    spacingScale.forEach(space => {
      const numericName = mapSpacingIdToSkelementor(space);
      const baseValue = ((space.min + space.max) / 2).toFixed(0);
      cssLines.push(`  --space-${numericName}: ${baseValue}px;`);
    });
    cssLines.push('');
  }
  
  // Only font family variable
  if (isTypographyEnabled && typographyVariableGroups && typographyVariableGroups.length > 0) {
    cssLines.push('  /* Typography */');
    typographyVariableGroups.forEach(group => {
      group.variables.forEach(variable => {
        if (variable.name && variable.name.includes('font-family') || variable.name.includes('font-sans')) {
          const varName = variable.name.startsWith('--font-family-') ? variable.name : `--font-family-${variable.name.replace(/^--font-/, '').replace(/^--/, '')}`;
          cssLines.push(`  ${varName}: ${variable.value};`);
        }
      });
    });
    cssLines.push('');
  }
  
  cssLines.push('}');
  cssLines.push('');
  
  // Generate fluid typography classes
  if (isTypographyEnabled && typographyScale && typographyScale.length > 0) {
    cssLines.push('/* TYPOGRAPHY - Fluid Size */');
    typographyScale.forEach(type => {
      const clampValue = generateClampValue(type.min, type.max);
      const sizeName = mapTypographyIdToSkelementor(type.id);
      cssLines.push(`.text-fluid-${sizeName} { font-size: ${clampValue}; }`);
    });
    cssLines.push('');
  }
  
  // Generate fluid spacing classes
  if (isSpacingEnabled && generatorConfig && spacingGroups) {
    generatorConfig.forEach(config => {
      // Filter out empty properties
      const validProperties = config.properties.filter(p => p && p.trim() !== '');
      if (!config.enabled || !config.scaleGroupId || validProperties.length === 0) return;
      
      const sourceGroup = spacingGroups.find(g => g.id === config.scaleGroupId);
      if (!sourceGroup) return;
      
      const scaleForThisGenerator = generateSpacingScale(sourceGroup.settings);
      const baseProp = convertSpacingPropertyToSkelementor(validProperties[0]);
      
      // Check for property pairs to determine section header
      const hasMarginLeft = validProperties.includes('margin-left');
      const hasMarginRight = validProperties.includes('margin-right');
      const hasMarginTop = validProperties.includes('margin-top');
      const hasMarginBottom = validProperties.includes('margin-bottom');
      const hasPaddingLeft = validProperties.includes('padding-left');
      const hasPaddingRight = validProperties.includes('padding-right');
      const hasPaddingTop = validProperties.includes('padding-top');
      const hasPaddingBottom = validProperties.includes('padding-bottom');
      const hasGap = validProperties.includes('gap');
      
      // Group by property type for better organization
      let sectionHeader = '';
      if (hasMarginLeft && hasMarginRight) {
        sectionHeader = '/* FLUID MARGIN HORIZONTAL */';
      } else if (hasMarginTop && hasMarginBottom) {
        sectionHeader = '/* FLUID MARGIN VERTICAL */';
      } else if (hasPaddingLeft && hasPaddingRight) {
        sectionHeader = '/* FLUID PADDING HORIZONTAL */';
      } else if (hasPaddingTop && hasPaddingBottom) {
        sectionHeader = '/* FLUID PADDING VERTICAL */';
      } else {
        const propertyType = validProperties[0];
        if (propertyType.includes('margin-horizontal') || propertyType.includes('margin-vertical') || propertyType === 'margin') {
          sectionHeader = propertyType.includes('horizontal') ? '/* FLUID MARGIN HORIZONTAL */' : 
                         propertyType.includes('vertical') ? '/* FLUID MARGIN VERTICAL */' : 
                         '/* FLUID MARGIN */';
        } else if (propertyType.includes('padding-horizontal') || propertyType.includes('padding-vertical') || propertyType === 'padding') {
          sectionHeader = propertyType.includes('horizontal') ? '/* FLUID PADDING HORIZONTAL */' : 
                         propertyType.includes('vertical') ? '/* FLUID PADDING VERTICAL */' : 
                         '/* FLUID PADDING */';
        } else if (propertyType === 'gap') {
          sectionHeader = '/* FLUID FLEXBOX - Gap */';
        } else if (propertyType.includes('margin-left')) {
          sectionHeader = '/* FLUID MARGIN LEFT */';
        } else if (propertyType.includes('margin-right')) {
          sectionHeader = '/* FLUID MARGIN RIGHT */';
        } else if (propertyType.includes('margin-top')) {
          sectionHeader = '/* FLUID MARGIN TOP */';
        } else if (propertyType.includes('margin-bottom')) {
          sectionHeader = '/* FLUID MARGIN BOTTOM */';
        } else if (propertyType.includes('padding-left')) {
          sectionHeader = '/* FLUID PADDING LEFT */';
        } else if (propertyType.includes('padding-right')) {
          sectionHeader = '/* FLUID PADDING RIGHT */';
        } else if (propertyType.includes('padding-top')) {
          sectionHeader = '/* FLUID PADDING TOP */';
        } else if (propertyType.includes('padding-bottom')) {
          sectionHeader = '/* FLUID PADDING BOTTOM */';
        }
      }
      
      if (sectionHeader && !cssLines.includes(sectionHeader)) {
        cssLines.push(sectionHeader);
      }
      
      scaleForThisGenerator.forEach(space => {
        const numericName = mapSpacingIdToSkelementor(space);
        const clampValue = generateClampValue(space.min, space.max);
        
        // Track which properties have been handled as pairs, so we don't generate them individually
        const handledAsPair = new Set();
        
        // Handle horizontal margin (mx-fluid-*) - when both margin-left and margin-right are present
        if (hasMarginLeft && hasMarginRight) {
          cssLines.push(`.mx-fluid-${numericName} { margin-left: ${clampValue}; margin-right: ${clampValue}; }`);
          handledAsPair.add('margin-left');
          handledAsPair.add('margin-right');
        }
        
        // Handle vertical margin (my-fluid-*) - when both margin-top and margin-bottom are present
        if (hasMarginTop && hasMarginBottom) {
          cssLines.push(`.my-fluid-${numericName} { margin-top: ${clampValue}; margin-bottom: ${clampValue}; }`);
          handledAsPair.add('margin-top');
          handledAsPair.add('margin-bottom');
        }
        
        // Handle horizontal padding (px-fluid-*) - when both padding-left and padding-right are present
        if (hasPaddingLeft && hasPaddingRight) {
          cssLines.push(`.px-fluid-${numericName} { padding-left: ${clampValue}; padding-right: ${clampValue}; }`);
          handledAsPair.add('padding-left');
          handledAsPair.add('padding-right');
        }
        
        // Handle vertical padding (py-fluid-*) - when both padding-top and padding-bottom are present
        if (hasPaddingTop && hasPaddingBottom) {
          cssLines.push(`.py-fluid-${numericName} { padding-top: ${clampValue}; padding-bottom: ${clampValue}; }`);
          handledAsPair.add('padding-top');
          handledAsPair.add('padding-bottom');
        }
        
        // Handle gap property (always generate if present)
        if (hasGap) {
          cssLines.push(`.gap-fluid-${numericName} { gap: ${clampValue}; }`);
        }
        
        // Handle remaining individual properties that weren't part of pairs
        validProperties.forEach(prop => {
          if (prop && prop.trim() !== '' && !handledAsPair.has(prop)) {
            // Check if it's a horizontal/vertical shorthand property
            if (prop.includes('horizontal')) {
              const leftProp = prop.replace('horizontal', 'left');
              const rightProp = prop.replace('horizontal', 'right');
              const propShort = convertSpacingPropertyToSkelementor(prop);
              cssLines.push(`.${propShort}-fluid-${numericName} { ${leftProp}: ${clampValue}; ${rightProp}: ${clampValue}; }`);
            } else if (prop.includes('vertical')) {
              const topProp = prop.replace('vertical', 'top');
              const bottomProp = prop.replace('vertical', 'bottom');
              const propShort = convertSpacingPropertyToSkelementor(prop);
              cssLines.push(`.${propShort}-fluid-${numericName} { ${topProp}: ${clampValue}; ${bottomProp}: ${clampValue}; }`);
            } else {
              // Individual property
              const propShort = convertSpacingPropertyToSkelementor(prop);
              cssLines.push(`.${propShort}-fluid-${numericName} { ${prop}: ${clampValue}; }`);
            }
          }
        });
      });
    });
    cssLines.push('');
  }
  
  // Generate color utility classes with direct hex values
  if (colors && colors.length > 0) {
    cssLines.push('/* TEXT COLORS */');
    colors.forEach(color => {
      const colorValue = formatColorValue(color);
      const simpleName = simplifyColorName(color.name);
      if (color.utilityConfig?.text) {
        cssLines.push(`.text-${simpleName} { color: ${colorValue}; }`);
      }
    });
    cssLines.push('');
    
    cssLines.push('/* BACKGROUND COLORS */');
    colors.forEach(color => {
      const colorValue = formatColorValue(color);
      const simpleName = simplifyColorName(color.name);
      if (color.utilityConfig?.background) {
        cssLines.push(`.bg-${simpleName} { background-color: ${colorValue}; }`);
      }
    });
    cssLines.push('');
    
    cssLines.push('/* BORDER COLORS */');
    colors.forEach(color => {
      const colorValue = formatColorValue(color);
      const simpleName = simplifyColorName(color.name);
      if (color.utilityConfig?.border) {
        cssLines.push(`.border-${simpleName} { border-color: ${colorValue}; }`);
      }
    });
    cssLines.push('');
  }
  
  const rawCss = cssLines.join('\n');
  
  try {
    const formattedCss = await prettier.format(rawCss, { parser: 'css', plugins: [parserPostCSS], printWidth: 80 });
    return formattedCss;
  } catch (error) {
    console.error("Error formatting Skelementor CSS:", error);
    return rawCss;
  }
};