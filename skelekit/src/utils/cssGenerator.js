// src/utils/cssGenerator.js
import { colord } from 'colord';
import chroma from 'chroma-js';
import prettier from 'prettier/standalone';
import * as parserPostCSS from 'prettier/plugins/postcss.js';
import { generateSpacingScale } from './spacingCalculator';
import { buildMediaQuery, sortBreakpointsForCss } from './breakpoints';
import {
  SKELEMENTOR_FRAMEWORK_TYPE,
  SKELEMENTOR_HEADER_COMMENT,
  SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER,
  SKELEMENTOR_RESPONSIVE_HEADER_COMMENT,
} from '../presets/skelementorFrameworkConstants';

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

// Generate a single shadow color for a given opacity
const generateShadowColor = (baseColor, opacity, parentFormat) => {
    const alpha = opacity / 100;
    const c = colord(baseColor);
    const format = parentFormat.toUpperCase();
    
    // Mix slightly towards black for a subtle shadow tone
    const mixedColor = chroma.mix(c.toHex(), 'black', 0.3, 'lab').alpha(alpha);
    
    if (format.includes('HSL')) return mixedColor.css('hsla');
    if (format.includes('RGB')) return mixedColor.css('rgba');
    return mixedColor.hex();
}

const alphaSteps = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const DEFAULT_CUSTOM_CSS_PLACEHOLDER = '/* Your custom styles go here */';

const buildVariableDeclarationsFromGroups = (groups = []) => {
  const declarations = [];

  groups.forEach((group) => {
    group.variables.forEach((variable) => {
      if (!variable.name || (!variable.value && variable.mode !== 'minmax')) {
        return;
      }

      if (variable.mode === 'single') {
        declarations.push(`${variable.name}: ${variable.value};`);
        return;
      }

      declarations.push(
        `${variable.name}: ${generateClampValue(
          variable.minValue || 0,
          variable.maxValue || 0
        )};`
      );
    });
  });

  return declarations;
};

const buildSelectorBlocks = (groups = []) => {
  const blocks = [];

  groups.forEach((group) => {
    group.rules.forEach((rule) => {
      if (!rule.selector || !rule.properties?.length) {
        return;
      }

      const validProperties = rule.properties
        .filter((property) => property.property && property.value)
        .map((property) => `  ${property.property}: ${property.value};`);

      if (validProperties.length === 0) {
        return;
      }

      blocks.push(`${rule.selector} {\n${validProperties.join('\n')}\n}`);
    });
  });

  return blocks;
};

const indentBlock = (block, depth = 1) =>
  block
    .split('\n')
    .map((line) => `${'  '.repeat(depth)}${line}`)
    .join('\n');

const appendResponsiveCssSections = (cssLines, config) => {
  const {
    breakpointPresets = [],
    variableGroupsByBreakpoint = {},
    typographyVariableGroupsByBreakpoint = {},
    layoutVariableGroupsByBreakpoint = {},
    designVariableGroupsByBreakpoint = {},
    selectorGroupsByBreakpoint = {},
    typographySelectorGroupsByBreakpoint = {},
    layoutSelectorGroupsByBreakpoint = {},
    designSelectorGroupsByBreakpoint = {},
  } = config;

  sortBreakpointsForCss(breakpointPresets).forEach((preset) => {
    const query = buildMediaQuery(preset);
    if (!query) {
      return;
    }

    const variableLines = [
      ...buildVariableDeclarationsFromGroups(
        typographyVariableGroupsByBreakpoint[preset.id] || []
      ),
      ...buildVariableDeclarationsFromGroups(
        variableGroupsByBreakpoint[preset.id] || []
      ),
      ...buildVariableDeclarationsFromGroups(
        layoutVariableGroupsByBreakpoint[preset.id] || []
      ),
      ...buildVariableDeclarationsFromGroups(
        designVariableGroupsByBreakpoint[preset.id] || []
      ),
    ];

    const selectorBlocks = [
      ...buildSelectorBlocks(selectorGroupsByBreakpoint[preset.id] || []),
      ...buildSelectorBlocks(
        typographySelectorGroupsByBreakpoint[preset.id] || []
      ),
      ...buildSelectorBlocks(layoutSelectorGroupsByBreakpoint[preset.id] || []),
      ...buildSelectorBlocks(designSelectorGroupsByBreakpoint[preset.id] || []),
    ];

    if (variableLines.length === 0 && selectorBlocks.length === 0) {
      return;
    }

    cssLines.push(`\n@media ${query} {`);
    if (variableLines.length > 0) {
      cssLines.push('  :root {');
      variableLines.forEach((line) => cssLines.push(`    ${line}`));
      cssLines.push('  }');
      if (selectorBlocks.length > 0) {
        cssLines.push('');
      }
    }

    selectorBlocks.forEach((block, index) => {
      cssLines.push(indentBlock(block, 1));
      if (index < selectorBlocks.length - 1) {
        cssLines.push('');
      }
    });
    cssLines.push('}');
  });
};

const isFrameworkManagedItem = (item) =>
  item?.__frameworkMeta?.type === SKELEMENTOR_FRAMEWORK_TYPE;

const buildVariableValue = (variable) => {
  if (!variable) {
    return '';
  }

  if (variable.mode === 'minmax') {
    return generateClampValue(variable.minValue || 0, variable.maxValue || 0);
  }

  return variable.value;
};

const formatCompactRule = (rule) =>
  `${rule.selector} { ${rule.properties
    .filter((property) => property.property && property.value)
    .map((property) => `${property.property}: ${property.value};`)
    .join(' ')} }`;

const formatBlockRule = (rule, indent = '') => {
  const frameworkMeta = rule.__frameworkMeta || {};
  const lines = [
    `${indent}${rule.selector} {${
      frameworkMeta.inlineComment ? ` ${frameworkMeta.inlineComment}` : ''
    }`,
  ];

  rule.properties
    .filter((property) => property.property && property.value)
    .forEach((property) => {
      lines.push(`${indent}  ${property.property}: ${property.value};`);
    });

  lines.push(`${indent}}`);
  return lines.join('\n');
};

const renderFrameworkRule = (rule, indent = '') => {
  if ((rule.__frameworkMeta?.exportStyle || 'compact') === 'compact') {
    return `${indent}${formatCompactRule(rule)}`;
  }

  return formatBlockRule(rule, indent);
};

const collectFrameworkRootEntries = (data) => {
  const entries = [];

  (data.colors || []).forEach((color) => {
    if (isFrameworkManagedItem(color)) {
      entries.push({
        kind: 'color',
        order: color.__frameworkMeta.rootOrder ?? Number.MAX_SAFE_INTEGER,
        item: color,
      });
    }
  });

  [
    ...(data.variableGroups || []),
    ...(data.typographyVariableGroups || []),
    ...(data.layoutVariableGroups || []),
    ...(data.designVariableGroups || []),
  ].forEach((group) => {
    (group.variables || []).forEach((variable) => {
      if (isFrameworkManagedItem(variable)) {
        entries.push({
          kind: 'variable',
          order: variable.__frameworkMeta.rootOrder ?? Number.MAX_SAFE_INTEGER,
          item: variable,
        });
      }
    });
  });

  return entries.sort((left, right) => left.order - right.order);
};

const collectFrameworkRuleEntries = (groups = []) => {
  const entries = [];

  groups.forEach((group) => {
    (group.rules || []).forEach((rule) => {
      if (isFrameworkManagedItem(rule)) {
        entries.push(rule);
      }
    });
  });

  return entries;
};

const groupFrameworkRulesBySection = (rules = []) =>
  rules.reduce((accumulator, rule) => {
    const frameworkMeta = rule.__frameworkMeta || {};
    const sectionKey = `${frameworkMeta.sectionOrder ?? 0}:${frameworkMeta.sectionComment || ''}`;

    if (!accumulator[sectionKey]) {
      accumulator[sectionKey] = {
        sectionOrder: frameworkMeta.sectionOrder ?? 0,
        sectionComment: frameworkMeta.sectionComment || '',
        rules: [],
      };
    }

    accumulator[sectionKey].rules.push(rule);
    return accumulator;
  }, {});

const buildFrameworkCssFromWorkspace = (data) => {
  const rootEntries = collectFrameworkRootEntries(data);
  const baseRules = collectFrameworkRuleEntries([
    ...(data.typographySelectorGroups || []),
    ...(data.selectorGroups || []),
    ...(data.layoutSelectorGroups || []),
    ...(data.designSelectorGroups || []),
  ]);
  const responsiveRules = [
    ...(data.selectorGroupsByBreakpoint
      ? Object.entries(data.selectorGroupsByBreakpoint)
      : []),
    ...(data.typographySelectorGroupsByBreakpoint
      ? Object.entries(data.typographySelectorGroupsByBreakpoint)
      : []),
    ...(data.layoutSelectorGroupsByBreakpoint
      ? Object.entries(data.layoutSelectorGroupsByBreakpoint)
      : []),
    ...(data.designSelectorGroupsByBreakpoint
      ? Object.entries(data.designSelectorGroupsByBreakpoint)
      : []),
  ].flatMap(([breakpointId, groups]) =>
    collectFrameworkRuleEntries(groups).map((rule) => ({
      breakpointId,
      rule,
    }))
  );

  if (rootEntries.length === 0 && baseRules.length === 0 && responsiveRules.length === 0) {
    return '';
  }

  const lines = [SKELEMENTOR_HEADER_COMMENT, '', ':root {'];

  rootEntries.forEach((entry) => {
    if (entry.kind === 'color') {
      lines.push(`  ${entry.item.name}: ${formatColorValue(entry.item)};`);
      return;
    }

    lines.push(`  ${entry.item.name}: ${buildVariableValue(entry.item)};`);
  });
  lines.push('}');

  Object.values(groupFrameworkRulesBySection(baseRules))
    .sort((left, right) => left.sectionOrder - right.sectionOrder)
    .forEach((section) => {
      lines.push('');
      lines.push(section.sectionComment);
      const orderedRules = section.rules
        .sort(
          (left, right) =>
            (left.__frameworkMeta?.ruleOrder ?? 0) -
            (right.__frameworkMeta?.ruleOrder ?? 0)
        );

      orderedRules.forEach((rule, index) => {
          lines.push(renderFrameworkRule(rule));
          if (rule.__frameworkMeta?.trailingBlankLine && index < orderedRules.length - 1) {
            lines.push('');
          }
        });
    });

  if (responsiveRules.length > 0) {
    lines.push('');
    lines.push(SKELEMENTOR_RESPONSIVE_HEADER_COMMENT);

    const breakpointSections = responsiveRules.reduce((accumulator, entry) => {
      const frameworkMeta = entry.rule.__frameworkMeta || {};
      const key = entry.breakpointId;

      if (!accumulator[key]) {
        accumulator[key] = {
          breakpointId: entry.breakpointId,
          mediaOrder:
            frameworkMeta.mediaOrder ??
            SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER.indexOf(entry.breakpointId),
          mediaQuery: frameworkMeta.mediaQuery || buildMediaQuery({ id: entry.breakpointId }),
          sectionComment: frameworkMeta.sectionComment || '',
          rules: [],
        };
      }

      accumulator[key].rules.push(entry.rule);
      return accumulator;
    }, {});

    Object.values(breakpointSections)
      .sort((left, right) => left.mediaOrder - right.mediaOrder)
      .forEach((section) => {
        lines.push('');
        lines.push(`@media ${section.mediaQuery} {`);
        if (section.sectionComment) {
          lines.push(`  ${section.sectionComment}`);
        }
        section.rules
          .sort(
            (left, right) =>
              (left.__frameworkMeta?.ruleOrder ?? 0) -
              (right.__frameworkMeta?.ruleOrder ?? 0)
          )
          .forEach((rule) => {
            lines.push(renderFrameworkRule(rule, '  '));
          });
        lines.push('}');
      });
  }

  return `${lines.join('\n')}\n`;
};

const filterGroupsByRuleMeta = (groups = [], keepRule) =>
  groups
    .map((group) => ({
      ...group,
      rules: (group.rules || []).filter(keepRule),
    }))
    .filter((group) => group.rules.length > 0);

const filterGroupsByVariableMeta = (groups = [], keepVariable) =>
  groups
    .map((group) => ({
      ...group,
      variables: (group.variables || []).filter(keepVariable),
    }))
    .filter((group) => group.variables.length > 0);

const buildExtraExportData = (data) => {
  const selectorGroups = filterGroupsByRuleMeta(
    data.selectorGroups,
    (rule) => !isFrameworkManagedItem(rule)
  );
  const selectorGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.selectorGroupsByBreakpoint || {}).map(([key, groups]) => [
      key,
      filterGroupsByRuleMeta(groups, (rule) => !isFrameworkManagedItem(rule)),
    ])
  );
  const variableGroups = filterGroupsByVariableMeta(
    data.variableGroups,
    (variable) => !isFrameworkManagedItem(variable)
  );
  const variableGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.variableGroupsByBreakpoint || {}).map(([key, groups]) => [
      key,
      filterGroupsByVariableMeta(
        groups,
        (variable) => !isFrameworkManagedItem(variable)
      ),
    ])
  );
  const typographySelectorGroups = filterGroupsByRuleMeta(
    data.typographySelectorGroups,
    (rule) => !isFrameworkManagedItem(rule)
  );
  const typographySelectorGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.typographySelectorGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByRuleMeta(groups, (rule) => !isFrameworkManagedItem(rule)),
      ]
    )
  );
  const typographyVariableGroups = filterGroupsByVariableMeta(
    data.typographyVariableGroups,
    (variable) => !isFrameworkManagedItem(variable)
  );
  const typographyVariableGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.typographyVariableGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByVariableMeta(
          groups,
          (variable) => !isFrameworkManagedItem(variable)
        ),
      ]
    )
  );
  const layoutSelectorGroups = filterGroupsByRuleMeta(
    data.layoutSelectorGroups,
    (rule) => !isFrameworkManagedItem(rule)
  );
  const layoutSelectorGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.layoutSelectorGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByRuleMeta(groups, (rule) => !isFrameworkManagedItem(rule)),
      ]
    )
  );
  const layoutVariableGroups = filterGroupsByVariableMeta(
    data.layoutVariableGroups,
    (variable) => !isFrameworkManagedItem(variable)
  );
  const layoutVariableGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.layoutVariableGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByVariableMeta(
          groups,
          (variable) => !isFrameworkManagedItem(variable)
        ),
      ]
    )
  );
  const designSelectorGroups = filterGroupsByRuleMeta(
    data.designSelectorGroups,
    (rule) => !isFrameworkManagedItem(rule)
  );
  const designSelectorGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.designSelectorGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByRuleMeta(groups, (rule) => !isFrameworkManagedItem(rule)),
      ]
    )
  );
  const designVariableGroups = filterGroupsByVariableMeta(
    data.designVariableGroups,
    (variable) => !isFrameworkManagedItem(variable)
  );
  const designVariableGroupsByBreakpoint = Object.fromEntries(
    Object.entries(data.designVariableGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        filterGroupsByVariableMeta(
          groups,
          (variable) => !isFrameworkManagedItem(variable)
        ),
      ]
    )
  );

  const hasExtraSpacingContent =
    hasCollectionContent(selectorGroups) ||
    hasCollectionContent(variableGroups) ||
    hasResponsiveCollectionContent(selectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(variableGroupsByBreakpoint) ||
    (data.spacingGroups || []).length > 0;
  const hasExtraTypographyContent =
    hasCollectionContent(typographySelectorGroups) ||
    hasCollectionContent(typographyVariableGroups) ||
    hasResponsiveCollectionContent(typographySelectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(typographyVariableGroupsByBreakpoint) ||
    (data.typographyGroups || []).length > 0;

  return {
    ...data,
    colors: (data.colors || []).filter((color) => !isFrameworkManagedItem(color)),
    isSpacingEnabled: hasExtraSpacingContent,
    isTypographyEnabled: hasExtraTypographyContent,
    generatorConfig: hasExtraSpacingContent ? data.generatorConfig : [],
    spacingGroups: hasExtraSpacingContent ? data.spacingGroups : [],
    spacingScale: hasExtraSpacingContent ? data.spacingScale : [],
    selectorGroups,
    selectorGroupsByBreakpoint,
    variableGroups,
    variableGroupsByBreakpoint,
    typographyGeneratorConfig: hasExtraTypographyContent
      ? data.typographyGeneratorConfig
      : [],
    typographyGroups: hasExtraTypographyContent ? data.typographyGroups : [],
    typographyScale: hasExtraTypographyContent ? data.typographyScale : [],
    typographySelectorGroups,
    typographySelectorGroupsByBreakpoint,
    typographyVariableGroups,
    typographyVariableGroupsByBreakpoint,
    layoutSelectorGroups,
    layoutSelectorGroupsByBreakpoint,
    layoutVariableGroups,
    layoutVariableGroupsByBreakpoint,
    designSelectorGroups,
    designSelectorGroupsByBreakpoint,
    designVariableGroups,
    designVariableGroupsByBreakpoint,
  };
};

const hasCollectionContent = (groups = []) =>
  Array.isArray(groups) &&
  groups.some((group) => {
    if (Array.isArray(group?.variables) && group.variables.length > 0) {
      return true;
    }

    if (Array.isArray(group?.rules) && group.rules.length > 0) {
      return true;
    }

    return false;
  });

const hasResponsiveCollectionContent = (collectionMap = {}) =>
  Object.values(collectionMap || {}).some((groups) => hasCollectionContent(groups));

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
    typographySelectorGroupsByBreakpoint,
    typographyVariableGroupsByBreakpoint,
    breakpointPresets,
  } = data;

  const frameworkCss = buildFrameworkCssFromWorkspace(data);
  if (frameworkCss) {
    const extraExportData = buildExtraExportData(data);
    const extraHasGeneratedContent =
      (extraExportData.colors || []).length > 0 ||
      (extraExportData.spacingScale || []).length > 0 ||
      (extraExportData.spacingGroups || []).length > 0 ||
      (extraExportData.typographyScale || []).length > 0 ||
      (extraExportData.typographyGroups || []).length > 0 ||
      (extraExportData.generatorConfig || []).length > 0 ||
      (extraExportData.typographyGeneratorConfig || []).length > 0 ||
      hasCollectionContent(extraExportData.selectorGroups) ||
      hasCollectionContent(extraExportData.variableGroups) ||
      hasCollectionContent(extraExportData.typographySelectorGroups) ||
      hasCollectionContent(extraExportData.typographyVariableGroups) ||
      hasCollectionContent(extraExportData.layoutSelectorGroups) ||
      hasCollectionContent(extraExportData.layoutVariableGroups) ||
      hasCollectionContent(extraExportData.designSelectorGroups) ||
      hasCollectionContent(extraExportData.designVariableGroups) ||
      hasResponsiveCollectionContent(extraExportData.selectorGroupsByBreakpoint) ||
      hasResponsiveCollectionContent(extraExportData.variableGroupsByBreakpoint) ||
      hasResponsiveCollectionContent(
        extraExportData.typographySelectorGroupsByBreakpoint
      ) ||
      hasResponsiveCollectionContent(
        extraExportData.typographyVariableGroupsByBreakpoint
      ) ||
      hasResponsiveCollectionContent(extraExportData.layoutSelectorGroupsByBreakpoint) ||
      hasResponsiveCollectionContent(extraExportData.layoutVariableGroupsByBreakpoint) ||
      hasResponsiveCollectionContent(extraExportData.designSelectorGroupsByBreakpoint) ||
      hasResponsiveCollectionContent(extraExportData.designVariableGroupsByBreakpoint);

    const hasExtraCustomCss =
      extraExportData.customCSS &&
      extraExportData.customCSS.trim() !== '' &&
      !extraExportData.customCSS.includes(DEFAULT_CUSTOM_CSS_PLACEHOLDER);

    if (!extraHasGeneratedContent && !hasExtraCustomCss) {
      return frameworkCss;
    }
  }

  const hasGeneratedContent =
    colors.length > 0 ||
    (isTypographyEnabled &&
      (typographyScale.length > 0 ||
        typographyGroups.length > 0 ||
        typographyGeneratorConfig.length > 0)) ||
    (isSpacingEnabled &&
      (spacingScale.length > 0 ||
        spacingGroups.length > 0 ||
        generatorConfig.length > 0)) ||
    hasCollectionContent(typographySelectorGroups) ||
    hasCollectionContent(typographyVariableGroups) ||
    hasCollectionContent(selectorGroups) ||
    hasCollectionContent(variableGroups) ||
    hasCollectionContent(layoutSelectorGroups) ||
    hasCollectionContent(layoutVariableGroups) ||
    hasCollectionContent(designSelectorGroups) ||
    hasCollectionContent(designVariableGroups) ||
    hasResponsiveCollectionContent(selectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(variableGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(typographySelectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(typographyVariableGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(layoutSelectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(layoutVariableGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(designSelectorGroupsByBreakpoint) ||
    hasResponsiveCollectionContent(designVariableGroupsByBreakpoint);

  if (
    !hasGeneratedContent &&
    customCSS &&
    customCSS.trim() !== '' &&
    !customCSS.includes(DEFAULT_CUSTOM_CSS_PLACEHOLDER)
  ) {
    return customCSS;
  }
  
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

  const colorTextClasses = [], backgroundClasses = [], borderClasses = [], fillClasses = [];
  colors.forEach(color => {
    const allVariants = [];
    allVariants.push({ varName: color.name });
    cssLines.push(`  ${color.name}: ${formatColorValue(color)};`);
    if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) { color.shadesConfig.palette.forEach((shade, index) => { const varName = `${color.name}-d-${index + 1}`; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatSwatchColorValue(shade, color.format)};`); }); }
    if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) { color.tintsConfig.palette.forEach((tint, index) => { const varName = `${color.name}-l-${index + 1}`; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatSwatchColorValue(tint, color.format)};`); }); }
    if (color.transparentConfig?.enabled) { alphaSteps.forEach(step => { const varName = `${color.name}-t-${step}`; const alphaValue = step / 100; allVariants.push({ varName }); cssLines.push(`  ${varName}: ${formatTransparentValue(color.value, color.format, alphaValue)};`); }); }
    if (color.shadowConfig?.enabled) {
      // Generate shadow variables: --shadow-colorname-5, --shadow-colorname-10, ... 90
      const colorBaseName = color.name.replace(/^--/, '');
      alphaSteps.forEach(step => {
        const varName = `--shadow-${colorBaseName}-${step}`;
        const shadowColor = generateShadowColor(color.value, step, color.format);
        cssLines.push(`  ${varName}: ${shadowColor};`);
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

    // Generate shadow utility classes inline with text/bg/border/fill for this color
    if (color.shadowConfig?.enabled) {
      const colorBaseName = color.name.replace(/^--/, '');
      alphaSteps.forEach(step => {
        const varName = `--shadow-${colorBaseName}-${step}`;
        if (text) {
          colorTextClasses.push(`.text-shadow-${colorBaseName}-${step} { color: var(${varName}); }`);
        }
        if (background) {
          backgroundClasses.push(`.bg-shadow-${colorBaseName}-${step} { background-color: var(${varName}); }`);
        }
        if (border) {
          borderClasses.push(`.border-shadow-${colorBaseName}-${step} { border-color: var(${varName}); }`);
        }
        if (fill) {
          fillClasses.push(`.fill-shadow-${colorBaseName}-${step} { fill: var(${varName}); }`);
        }
      });
    }
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
    // Preserve insertion order so each color's base + shadow utilities stay grouped
    if (colorTextClasses.length > 0) cssLines.push('\n/* Text Colors */', ...colorTextClasses);
    if (backgroundClasses.length > 0) cssLines.push('\n/* Background Colors */', ...backgroundClasses);
    if (borderClasses.length > 0) cssLines.push('\n/* Border Colors */', ...borderClasses);
    if (fillClasses.length > 0) cssLines.push('\n/* Fill Colors */', ...fillClasses);
  }

  appendResponsiveCssSections(cssLines, {
    breakpointPresets,
    selectorGroupsByBreakpoint,
    variableGroupsByBreakpoint,
    typographySelectorGroupsByBreakpoint,
    typographyVariableGroupsByBreakpoint,
    layoutSelectorGroupsByBreakpoint,
    layoutVariableGroupsByBreakpoint,
    designSelectorGroupsByBreakpoint,
    designVariableGroupsByBreakpoint,
  });
  
  if (customCSS && customCSS.trim() !== '' && !customCSS.includes(DEFAULT_CUSTOM_CSS_PLACEHOLDER)) {
      cssLines.push('\n/* Custom User Stylesheet */');
      cssLines.push(customCSS);
  }

  const rawCss = cssLines.join('\n');

  if (frameworkCss) {
    const extraExportData = buildExtraExportData(data);
    const extraCss = await generateAndFormatCSS({
      ...extraExportData,
      customCSS:
        extraExportData.customCSS &&
        extraExportData.customCSS.includes(DEFAULT_CUSTOM_CSS_PLACEHOLDER)
          ? DEFAULT_CUSTOM_CSS_PLACEHOLDER
          : extraExportData.customCSS,
    });

    if (
      !extraCss ||
      extraCss.trim() === '' ||
      extraCss === DEFAULT_CUSTOM_CSS_PLACEHOLDER
    ) {
      return frameworkCss;
    }

    return `${frameworkCss}\n\n${extraCss.trim()}`;
  }

  try {
    const formattedCss = await prettier.format(rawCss, { parser: 'css', plugins: [parserPostCSS], printWidth: 80 });
    return formattedCss;
  } catch (error) {
    console.error("Error formatting CSS:", error);
    return rawCss;
  }
};
