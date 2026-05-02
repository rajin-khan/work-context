// src/utils/cssGenerator.js
import { colord } from 'colord';
import chroma from 'chroma-js';
import prettier from 'prettier/standalone';
import parserPostCSS from 'prettier/plugins/postcss.js';
import { generateSpacingScale } from './spacingCalculator';
import { buildMediaQuery, sortBreakpointsForCss } from './breakpoints';
import {
  SKELEMENTOR_FRAMEWORK_TYPE,
  SKELEMENTOR_HEADER_COMMENT,
  SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER,
  SKELEMENTOR_RESPONSIVE_HEADER_COMMENT,
} from '../presets/skelementorFrameworkConstants';
import {
  DYNAMIC_EXPORT_SELECTION_MODE,
  FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE,
  filterFrameworkCssBySelection,
  getDynamicExportSelectionManifest,
  getExportSelectionManifest,
  getSelectedUnitIdsForManifest,
} from './exportSelection';

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

const buildComponentBlocks = (components = []) => {
  const createRule = (selector, styles = []) => {
    const properties = (styles || [])
      .map(({ prop, value }) => (prop && value ? `  ${prop}: ${value};` : ''))
      .filter(Boolean);

    return properties.length > 0
      ? `${selector} {\n${properties.join('\n')}\n}`
      : null;
  };

  return (components || []).flatMap((component) => {
    const blocks = [];
    if (!component?.name) {
      return blocks;
    }

    const baseSelector = `.${component.name}`;
    const baseBlock = createRule(baseSelector, component.styles);
    if (baseBlock) {
      blocks.push(baseBlock);
    }

    if (component.states && component.type !== 'checkbox' && component.type !== 'radio') {
      Object.entries(component.states).forEach(([state, styles]) => {
        const stateBlock = createRule(`${baseSelector}:${state}`, styles);
        if (stateBlock) {
          blocks.push(stateBlock);
        }
      });
    }

    (component.modifiers || []).forEach((modifier) => {
      const selector = modifier.tag
        ? `${baseSelector} .${modifier.name}`
        : `${baseSelector}.${modifier.name}`;
      const modifierBlock = createRule(selector, modifier.styles);
      if (modifierBlock) {
        blocks.push(modifierBlock);
      }

      Object.entries(modifier.states || {}).forEach(([state, styles]) => {
        const stateBlock = createRule(`${selector}:${state}`, styles);
        if (stateBlock) {
          blocks.push(stateBlock);
        }
      });
    });

    if (component.type === 'dropdown') {
      const menuModifier = (component.modifiers || []).find(
        (modifier) => modifier.name === 'menu'
      );
      if (menuModifier) {
        blocks.push(`.${component.name}:hover .${menuModifier.name} {\n  display: block;\n}`);
      }
    }

    if (component.type === 'checkbox' || component.type === 'radio') {
      const isCheckbox = component.type === 'checkbox';
      const inputModName = isCheckbox ? 'checkbox-input' : 'radio-input';
      const boxModName = isCheckbox ? 'checkbox-box' : 'radio-dot';
      const checkModName = isCheckbox ? 'checkbox-check' : 'radio-dot-inner';
      const inputMod = (component.modifiers || []).find(
        (modifier) => modifier.name === inputModName
      );
      const boxMod = (component.modifiers || []).find(
        (modifier) => modifier.name === boxModName
      );
      const checkMod = (component.modifiers || []).find(
        (modifier) => modifier.name === checkModName
      );

      if (inputMod && boxMod && component.states?.checked) {
        const boxStyles = component.states.checked.filter(
          (style) =>
            style.target === (isCheckbox ? 'box' : 'dot') &&
            style.prop &&
            style.value
        );
        const boxBlock = createRule(
          `${baseSelector} .${inputMod.name}:checked + .${boxMod.name}`,
          boxStyles
        );
        if (boxBlock) {
          blocks.push(boxBlock);
        }
      }

      if (inputMod && boxMod && checkMod && component.states?.checked) {
        const checkStyles = component.states.checked.filter(
          (style) =>
            style.target === (isCheckbox ? 'check' : 'dot-inner') &&
            style.prop &&
            style.value
        );
        const checkBlock = createRule(
          `${baseSelector} .${inputMod.name}:checked + .${boxMod.name} .${checkMod.name}`,
          checkStyles
        );
        if (checkBlock) {
          blocks.push(checkBlock);
        }
      }
    }

    return blocks;
  });
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

  const frameworkColors =
    data.colors || (data.colorGroups || []).flatMap((group) => group.colors || []);

  frameworkColors.forEach((color) => {
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
        leadingBlankLine: frameworkMeta.leadingBlankLine ?? true,
        trailingBlankLine: frameworkMeta.sectionTrailingBlankLine ?? false,
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
      lines.push(
        `  ${entry.item.name}: ${
          entry.item.__frameworkMeta?.rawValue ?? formatColorValue(entry.item)
        };`
      );
      return;
    }

    lines.push(`  ${entry.item.name}: ${buildVariableValue(entry.item)};`);
  });
  lines.push('}');

  Object.values(groupFrameworkRulesBySection(baseRules))
    .sort((left, right) => left.sectionOrder - right.sectionOrder)
    .forEach((section) => {
      if (section.leadingBlankLine) {
        lines.push('');
      }
      lines.push(section.sectionComment);
      const orderedRules = section.rules.sort(
        (left, right) =>
          (left.__frameworkMeta?.ruleOrder ?? 0) -
          (right.__frameworkMeta?.ruleOrder ?? 0)
      );

      orderedRules.forEach((rule, index) => {
        lines.push(renderFrameworkRule(rule));
        if (
          rule.__frameworkMeta?.trailingBlankLine &&
          index < orderedRules.length - 1
        ) {
          lines.push('');
        }
      });
      if (section.trailingBlankLine) {
        lines.push('');
      }
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
    components: data.components || [],
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

const collectVarRefsFromValue = (value) =>
  [...String(value || '').matchAll(/var\(--([a-zA-Z0-9_-]+)\)/g)].map(
    (match) => `--${match[1]}`
  );

const collectVarRefsFromGroups = (groups = []) =>
  groups.flatMap((group) =>
    (group.rules || []).flatMap((rule) =>
      (rule.properties || []).flatMap((property) =>
        collectVarRefsFromValue(property.value)
      )
    )
  );

const collectVarRefsFromVariableGroups = (groups = []) =>
  groups.flatMap((group) =>
    (group.variables || []).flatMap((variable) =>
      collectVarRefsFromValue(buildVariableValue(variable))
    )
  );

const collectVarRefsFromComponents = (components = []) =>
  components.flatMap((component) => {
    const refs = [];
    const collectStyles = (styles = []) => {
      styles.forEach((style) => {
        refs.push(...collectVarRefsFromValue(style.value));
      });
    };

    collectStyles(component.styles);
    Object.values(component.states || {}).forEach(collectStyles);
    (component.modifiers || []).forEach((modifier) => {
      collectStyles(modifier.styles);
      Object.values(modifier.states || {}).forEach(collectStyles);
    });

    return refs;
  });

const collectGeneratedColorVariableNames = (color = {}) => {
  const names = [color.name].filter(Boolean);
  if (color.shadesConfig?.enabled && color.shadesConfig?.palette?.length > 0) {
    color.shadesConfig.palette.forEach((_, index) => {
      names.push(`${color.name}-d-${index + 1}`);
    });
  }
  if (color.tintsConfig?.enabled && color.tintsConfig?.palette?.length > 0) {
    color.tintsConfig.palette.forEach((_, index) => {
      names.push(`${color.name}-l-${index + 1}`);
    });
  }
  if (color.transparentConfig?.enabled) {
    alphaSteps.forEach((step) => names.push(`${color.name}-t-${step}`));
  }
  if (color.shadowConfig?.enabled) {
    const colorBaseName = color.name.replace(/^--/, '');
    alphaSteps.forEach((step) => names.push(`--shadow-${colorBaseName}-${step}`));
  }
  return names;
};

const disableColorUtilities = (color) => ({
  ...color,
  utilityConfig: {
    text: false,
    background: false,
    border: false,
    fill: false,
  },
});

const mergeColorGroupsForRequiredVariables = (
  selectedGroups = [],
  allGroups = [],
  requiredVariableNames = new Set()
) => {
  const selectedGroupIds = new Set(selectedGroups.map((group) => group.id));
  const nextGroups = selectedGroups.map((group) => ({ ...group }));

  allGroups.forEach((group) => {
    if (selectedGroupIds.has(group.id)) {
      return;
    }

    const requiredColors = (group.colors || []).filter((color) =>
      collectGeneratedColorVariableNames(color).some((name) =>
        requiredVariableNames.has(name)
      )
    );

    if (requiredColors.length > 0) {
      nextGroups.push({
        ...group,
        colors: requiredColors.map(disableColorUtilities),
      });
    }
  });

  return nextGroups;
};

const filterVariableGroupsForSelection = (
  groups = [],
  selectedGroupIds = new Set(),
  requiredVariableNames = new Set()
) =>
  groups
    .map((group) => {
      if (selectedGroupIds.has(group.id)) {
        return group;
      }

      const variables = (group.variables || []).filter((variable) =>
        requiredVariableNames.has(variable.name)
      );

      return variables.length > 0 ? { ...group, variables } : null;
    })
    .filter(Boolean);

const collectScaleVariableNames = (groups = []) =>
  groups.flatMap((group) => generateSpacingScale(group.settings).map((item) => item.name));

const filterScaleGroupsForSelection = (
  groups = [],
  selectedGroupIds = new Set(),
  requiredVariableNames = new Set()
) =>
  groups.filter(
    (group) =>
      selectedGroupIds.has(group.id) ||
      generateSpacingScale(group.settings).some((item) =>
        requiredVariableNames.has(item.name)
      )
  );

const filterResponsiveGroupMapByIds = (collectionMap = {}, selectedGroupIds) =>
  Object.fromEntries(
    Object.entries(collectionMap || {}).map(([breakpointId, groups]) => [
      breakpointId,
      (groups || []).filter((group) => selectedGroupIds.has(group.id)),
    ])
  );

const expandRequiredVariableNames = (data, requiredVariableNames) => {
  let changed = true;
  const allVariableGroups = [
    ...(data.typographyVariableGroups || []),
    ...(data.variableGroups || []),
    ...(data.layoutVariableGroups || []),
    ...(data.designVariableGroups || []),
  ];

  while (changed) {
    changed = false;
    allVariableGroups.forEach((group) => {
      (group.variables || []).forEach((variable) => {
        if (!requiredVariableNames.has(variable.name)) {
          return;
        }

        collectVarRefsFromValue(buildVariableValue(variable)).forEach((name) => {
          if (!requiredVariableNames.has(name)) {
            requiredVariableNames.add(name);
            changed = true;
          }
        });
      });
    });
  }
};

const filterGeneratedExportDataByDynamicSelection = (data) => {
  if (data.exportSelection?.mode !== DYNAMIC_EXPORT_SELECTION_MODE) {
    return data;
  }

  const manifest = getDynamicExportSelectionManifest(data);
  const selectedIds = getSelectedUnitIdsForManifest(data.exportSelection, manifest);
  const selectedSourceIdsByKind = manifest.units.reduce((accumulator, unit) => {
    if (!selectedIds.has(unit.id)) {
      return accumulator;
    }

    if (!accumulator[unit.kind]) {
      accumulator[unit.kind] = new Set();
    }
    accumulator[unit.kind].add(unit.sourceId);
    return accumulator;
  }, {});
  const ids = (kind) => selectedSourceIdsByKind[kind] || new Set();

  const keepTypographyGenerated = ids('typography-generated').size > 0;
  const keepSpacingGenerated = ids('spacing-generated').size > 0;
  const selectedTypographyScaleIds = keepTypographyGenerated
    ? new Set((data.typographyGroups || []).map((group) => group.id))
    : new Set();
  const selectedSpacingScaleIds = keepSpacingGenerated
    ? new Set((data.spacingGroups || []).map((group) => group.id))
    : new Set();

  const filtered = {
    ...data,
    colorGroups: (data.colorGroups || []).filter((group) =>
      ids('color-group').has(group.id)
    ),
    colors: (data.colorGroups || [])
      .filter((group) => ids('color-group').has(group.id))
      .flatMap((group) => group.colors || []),
    typographyGroups: filterScaleGroupsForSelection(
      data.typographyGroups || [],
      selectedTypographyScaleIds
    ),
    typographyGeneratorConfig: (data.typographyGeneratorConfig || []).filter(
      (config) => selectedTypographyScaleIds.has(config.scaleGroupId)
    ),
    typographySelectorGroups: (data.typographySelectorGroups || []).filter((group) =>
      ids('typography-selector-group').has(group.id)
    ),
    typographyVariableGroups: (data.typographyVariableGroups || []).filter((group) =>
      ids('typography-variable-group').has(group.id)
    ),
    selectorGroups: (data.selectorGroups || []).filter((group) =>
      ids('spacing-selector-group').has(group.id)
    ),
    variableGroups: (data.variableGroups || []).filter((group) =>
      ids('spacing-variable-group').has(group.id)
    ),
    spacingGroups: filterScaleGroupsForSelection(
      data.spacingGroups || [],
      selectedSpacingScaleIds
    ),
    generatorConfig: (data.generatorConfig || []).filter(
      (config) => selectedSpacingScaleIds.has(config.scaleGroupId)
    ),
    layoutSelectorGroups: (data.layoutSelectorGroups || []).filter((group) =>
      ids('layout-selector-group').has(group.id)
    ),
    layoutVariableGroups: (data.layoutVariableGroups || []).filter((group) =>
      ids('layout-variable-group').has(group.id)
    ),
    designSelectorGroups: (data.designSelectorGroups || []).filter((group) =>
      ids('design-selector-group').has(group.id) ||
      ids('component-selector-group').has(group.id)
    ),
    designVariableGroups: (data.designVariableGroups || []).filter((group) =>
      ids('design-variable-group').has(group.id)
    ),
    components: (data.components || []).filter((component) =>
      ids('component').has(component.id)
    ),
    selectorGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.selectorGroupsByBreakpoint,
      ids('spacing-selector-group')
    ),
    variableGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.variableGroupsByBreakpoint,
      ids('spacing-variable-group')
    ),
    typographySelectorGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.typographySelectorGroupsByBreakpoint,
      ids('typography-selector-group')
    ),
    typographyVariableGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.typographyVariableGroupsByBreakpoint,
      ids('typography-variable-group')
    ),
    layoutSelectorGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.layoutSelectorGroupsByBreakpoint,
      ids('layout-selector-group')
    ),
    layoutVariableGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.layoutVariableGroupsByBreakpoint,
      ids('layout-variable-group')
    ),
    designSelectorGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.designSelectorGroupsByBreakpoint,
      new Set([
        ...ids('design-selector-group'),
        ...ids('component-selector-group'),
      ])
    ),
    designVariableGroupsByBreakpoint: filterResponsiveGroupMapByIds(
      data.designVariableGroupsByBreakpoint,
      ids('design-variable-group')
    ),
  };

  const requiredVariableNames = new Set([
    ...collectVarRefsFromGroups(filtered.typographySelectorGroups),
    ...collectVarRefsFromGroups(filtered.selectorGroups),
    ...collectVarRefsFromGroups(filtered.layoutSelectorGroups),
    ...collectVarRefsFromGroups(filtered.designSelectorGroups),
    ...collectVarRefsFromVariableGroups(filtered.typographyVariableGroups),
    ...collectVarRefsFromVariableGroups(filtered.variableGroups),
    ...collectVarRefsFromVariableGroups(filtered.layoutVariableGroups),
    ...collectVarRefsFromVariableGroups(filtered.designVariableGroups),
    ...collectVarRefsFromComponents(filtered.components),
  ]);

  Object.values(filtered.selectorGroupsByBreakpoint || {}).forEach((groups) =>
    collectVarRefsFromGroups(groups).forEach((name) => requiredVariableNames.add(name))
  );
  Object.values(filtered.typographySelectorGroupsByBreakpoint || {}).forEach((groups) =>
    collectVarRefsFromGroups(groups).forEach((name) => requiredVariableNames.add(name))
  );
  Object.values(filtered.layoutSelectorGroupsByBreakpoint || {}).forEach((groups) =>
    collectVarRefsFromGroups(groups).forEach((name) => requiredVariableNames.add(name))
  );
  Object.values(filtered.designSelectorGroupsByBreakpoint || {}).forEach((groups) =>
    collectVarRefsFromGroups(groups).forEach((name) => requiredVariableNames.add(name))
  );

  expandRequiredVariableNames(data, requiredVariableNames);

  const typographyScaleGroups = filterScaleGroupsForSelection(
    data.typographyGroups || [],
    new Set(filtered.typographyGroups.map((group) => group.id)),
    requiredVariableNames
  );
  const spacingScaleGroups = filterScaleGroupsForSelection(
    data.spacingGroups || [],
    new Set(filtered.spacingGroups.map((group) => group.id)),
    requiredVariableNames
  );

  return {
    ...filtered,
    colorGroups: mergeColorGroupsForRequiredVariables(
      filtered.colorGroups,
      data.colorGroups || [],
      requiredVariableNames
    ),
    colors: mergeColorGroupsForRequiredVariables(
      filtered.colorGroups,
      data.colorGroups || [],
      requiredVariableNames
    ).flatMap((group) => group.colors || []),
    typographyGroups: typographyScaleGroups,
    typographyScale: collectScaleVariableNames(typographyScaleGroups).length
      ? typographyScaleGroups.flatMap((group) => generateSpacingScale(group.settings))
      : [],
    typographyVariableGroups: filterVariableGroupsForSelection(
      data.typographyVariableGroups || [],
      ids('typography-variable-group'),
      requiredVariableNames
    ),
    spacingGroups: spacingScaleGroups,
    spacingScale: collectScaleVariableNames(spacingScaleGroups).length
      ? spacingScaleGroups.flatMap((group) => generateSpacingScale(group.settings))
      : [],
    variableGroups: filterVariableGroupsForSelection(
      data.variableGroups || [],
      ids('spacing-variable-group'),
      requiredVariableNames
    ),
    layoutVariableGroups: filterVariableGroupsForSelection(
      data.layoutVariableGroups || [],
      ids('layout-variable-group'),
      requiredVariableNames
    ),
    designVariableGroups: filterVariableGroupsForSelection(
      data.designVariableGroups || [],
      ids('design-variable-group'),
      requiredVariableNames
    ),
    isTypographyEnabled:
      data.isTypographyEnabled &&
      (typographyScaleGroups.length > 0 ||
        filtered.typographyGeneratorConfig.length > 0 ||
        filtered.typographySelectorGroups.length > 0),
    isSpacingEnabled:
      data.isSpacingEnabled &&
      (spacingScaleGroups.length > 0 ||
        filtered.generatorConfig.length > 0 ||
        filtered.selectorGroups.length > 0),
  };
};

const getSelectedExportFamilies = (exportSelection = null) => {
  if (!exportSelection) {
    return null;
  }

  if (
    exportSelection.mode === DYNAMIC_EXPORT_SELECTION_MODE ||
    exportSelection.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE
  ) {
    return null;
  }

  const manifest = getExportSelectionManifest();
  const selectedIds = new Set(exportSelection.selectedUnitIds || []);

  return new Set(
    manifest.units
      .filter((unit) => selectedIds.has(unit.id))
      .map((unit) => unit.family)
  );
};

const keepResponsiveCollectionsForFamily = (
  collectionMap = {},
  keepFamily = false
) =>
  Object.fromEntries(
    Object.entries(collectionMap || {}).map(([key, groups]) => [
      key,
      keepFamily ? groups : [],
    ])
  );

const filterGeneratedExportDataBySelection = (data) => {
  if (data.exportSelection?.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE) {
    return data;
  }

  if (data.exportSelection?.mode === DYNAMIC_EXPORT_SELECTION_MODE) {
    return filterGeneratedExportDataByDynamicSelection(data);
  }

  const selectedFamilies = getSelectedExportFamilies(data.exportSelection);
  if (!selectedFamilies) {
    return data;
  }

  const keepTypography = selectedFamilies.has('Typography');
  const keepSpacing = selectedFamilies.has('Spacing');
  const keepColors = selectedFamilies.has('Colors');
  const keepLayout =
    selectedFamilies.has('Layout') ||
    selectedFamilies.has('Sizing') ||
    selectedFamilies.has('Flexbox');
  const keepDesign =
    selectedFamilies.has('Borders') || selectedFamilies.has('Effects');

  return {
    ...data,
    colors: keepColors ? data.colors : [],
    isTypographyEnabled: keepTypography && data.isTypographyEnabled,
    typographyScale: keepTypography ? data.typographyScale : [],
    typographyGroups: keepTypography ? data.typographyGroups : [],
    typographyGeneratorConfig: keepTypography ? data.typographyGeneratorConfig : [],
    typographySelectorGroups: keepTypography ? data.typographySelectorGroups : [],
    typographyVariableGroups: keepTypography ? data.typographyVariableGroups : [],
    typographySelectorGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.typographySelectorGroupsByBreakpoint,
      keepTypography
    ),
    typographyVariableGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.typographyVariableGroupsByBreakpoint,
      keepTypography
    ),
    isSpacingEnabled: keepSpacing && data.isSpacingEnabled,
    spacingScale: keepSpacing ? data.spacingScale : [],
    spacingGroups: keepSpacing ? data.spacingGroups : [],
    generatorConfig: keepSpacing ? data.generatorConfig : [],
    selectorGroups: keepSpacing ? data.selectorGroups : [],
    variableGroups: keepSpacing ? data.variableGroups : [],
    selectorGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.selectorGroupsByBreakpoint,
      keepSpacing
    ),
    variableGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.variableGroupsByBreakpoint,
      keepSpacing
    ),
    layoutSelectorGroups: keepLayout ? data.layoutSelectorGroups : [],
    layoutVariableGroups: keepLayout ? data.layoutVariableGroups : [],
    layoutSelectorGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.layoutSelectorGroupsByBreakpoint,
      keepLayout
    ),
    layoutVariableGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.layoutVariableGroupsByBreakpoint,
      keepLayout
    ),
    designSelectorGroups: keepDesign ? data.designSelectorGroups : [],
    designVariableGroups: keepDesign ? data.designVariableGroups : [],
    designSelectorGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.designSelectorGroupsByBreakpoint,
      keepDesign
    ),
    designVariableGroupsByBreakpoint: keepResponsiveCollectionsForFamily(
      data.designVariableGroupsByBreakpoint,
      keepDesign
    ),
  };
};

export const generateAndFormatCSS = async (data) => {
  const exportData = filterGeneratedExportDataBySelection(data);
  const {
    colors = [],
    spacingScale = [],
    spacingGroups = [],
    isTypographyEnabled,
    typographyScale = [],
    typographyGeneratorConfig = [],
    typographyGroups = [],
    typographySelectorGroups = [],
    typographyVariableGroups = [],
    generatorConfig = [],
    selectorGroups = [],
    selectorGroupsByBreakpoint = {},
    variableGroups = [],
    variableGroupsByBreakpoint = {},
    isSpacingEnabled,
    customCSS,
    layoutSelectorGroups = [],
    layoutSelectorGroupsByBreakpoint = {},
    layoutVariableGroups = [],
    layoutVariableGroupsByBreakpoint = {},
    designSelectorGroups = [],
    designSelectorGroupsByBreakpoint = {},
    designVariableGroups = [],
    designVariableGroupsByBreakpoint = {},
    components = [],
    typographySelectorGroupsByBreakpoint = {},
    typographyVariableGroupsByBreakpoint = {},
    breakpointPresets = [],
  } = exportData;

  const frameworkCss = buildFrameworkCssFromWorkspace(exportData);
  const selectedFrameworkCss = frameworkCss
    ? filterFrameworkCssBySelection(
        frameworkCss,
        exportData.exportSelection?.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE
          ? { ...exportData.exportSelection, __manifestData: exportData }
          : exportData.exportSelection
      )
    : '';
  const hasExplicitEmptyExportSelection =
    Array.isArray(exportData.exportSelection?.selectedUnitIds) &&
    exportData.exportSelection.selectedUnitIds.length === 0;

  if (hasExplicitEmptyExportSelection) {
    const hasExtraCustomCss =
      customCSS &&
      customCSS.trim() !== '' &&
      !customCSS.includes(DEFAULT_CUSTOM_CSS_PLACEHOLDER);

    return hasExtraCustomCss ? customCSS : '';
  }

  if (frameworkCss) {
    const extraExportData = buildExtraExportData(exportData);
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
      (extraExportData.components || []).length > 0 ||
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
      return selectedFrameworkCss;
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
    components.length > 0 ||
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

  if (components && components.length > 0) {
    const componentBlocks = buildComponentBlocks(components);
    if (componentBlocks.length > 0) {
      cssLines.push('\n/* Component Classes */');
      cssLines.push(...componentBlocks);
    }
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
    const extraExportData = buildExtraExportData(exportData);
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
      return selectedFrameworkCss;
    }

    return `${selectedFrameworkCss}\n\n${extraCss.trim()}`;
  }

  try {
    const formattedCss = await prettier.format(rawCss, { parser: 'css', plugins: [parserPostCSS], printWidth: 80 });
    return formattedCss;
  } catch (error) {
    console.error("Error formatting CSS:", error);
    return rawCss;
  }
};
