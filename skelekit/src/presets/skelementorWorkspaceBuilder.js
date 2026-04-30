import skelementorUtilitiesCss from '../framework/reference/skelementor-utilities.css?raw';
import {
  getReferenceCanonicalSnapshots,
  matchResponsiveLabel,
} from '../utils/canonicalArtifacts';
import { buildDefaultExportSelection } from '../utils/exportSelection';
import {
  DEFAULT_PAGE_VIEWPORT_BY_PAGE,
  buildDefaultBreakpointPresets,
  buildMediaQuery,
} from '../utils/breakpoints';
import {
  SKELEMENTOR_FRAMEWORK_TYPE,
  SKELEMENTOR_HEADER_COMMENT,
  SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER,
  SKELEMENTOR_RESPONSIVE_HEADER_COMMENT,
} from './skelementorFrameworkConstants';

const PLACEHOLDER_CUSTOM_CSS = '/* Your custom styles go here */';
const DEFAULT_RESPONSIVE_SELECTOR_COLLECTION_KEY =
  'layoutSelectorGroupsByBreakpoint';

const RESPONSIVE_COLLECTION_KEYS = [
  'selectorGroupsByBreakpoint',
  'variableGroupsByBreakpoint',
  'layoutSelectorGroupsByBreakpoint',
  'layoutVariableGroupsByBreakpoint',
  'designSelectorGroupsByBreakpoint',
  'designVariableGroupsByBreakpoint',
  'typographySelectorGroupsByBreakpoint',
  'typographyVariableGroupsByBreakpoint',
];

const COLOR_GROUPS = {
  '--color-white': 'Base Colors',
  '--color-black': 'Base Colors',
  '--color-gray-dark': 'Base Colors',
  '--color-gray': 'Base Colors',
  '--color-text-gray-light': 'Base Colors',
  '--color-bg-gray-light': 'Base Colors',
  '--color-border-gray-light': 'Base Colors',
  '--color-primary': 'Brand Colors',
  '--color-secondary': 'Brand Colors',
  '--color-neutral': 'Brand Colors',
  '--color-success': 'Brand Colors',
  '--color-warning': 'Brand Colors',
  '--color-error': 'Brand Colors',
  '--color-accent': 'Brand Colors',
  '--color-surface': 'Surface Colors',
  '--color-surface-2': 'Surface Colors',
  '--color-text': 'Surface Colors',
  '--color-muted': 'Surface Colors',
};

const VARIABLE_GROUP_DEFINITIONS = [
  {
    collectionKey: 'variableGroups',
    groupName: 'Spacing Tokens',
    test: (name) => /^--space-/.test(name),
  },
  {
    collectionKey: 'variableGroups',
    groupName: 'Gap Tokens',
    test: (name) => /^--gap-/.test(name),
  },
  {
    collectionKey: 'typographyVariableGroups',
    groupName: 'Font Families',
    test: (name) => /^--font-family-/.test(name),
  },
  {
    collectionKey: 'typographyVariableGroups',
    groupName: 'Type Scale',
    test: (name) => /^--font-size-/.test(name),
  },
  {
    collectionKey: 'typographyVariableGroups',
    groupName: 'Leading',
    test: (name) => /^--leading-/.test(name),
  },
  {
    collectionKey: 'typographyVariableGroups',
    groupName: 'Tracking',
    test: (name) => /^--tracking-/.test(name),
  },
  {
    collectionKey: 'layoutVariableGroups',
    groupName: 'Width Tokens',
    test: (name) => /^--(?:w-|min-w-|max-w-)/.test(name),
  },
  {
    collectionKey: 'layoutVariableGroups',
    groupName: 'Height Tokens',
    test: (name) => /^--(?:h-|min-h-|max-h-)/.test(name),
  },
  {
    collectionKey: 'layoutVariableGroups',
    groupName: 'Flex Basis Tokens',
    test: (name) => /^--basis-/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Text Palette Tokens',
    test: (name) => /^--text-/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Background Palette Tokens',
    test: (name) => /^--bg-/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Border Palette Tokens',
    test: (name) =>
      /^--border-(?:white|black|gray(?:-light)?|blue)$/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Border Width Tokens',
    test: (name) => /^--border-(?:0|1|2|4|8|10|15|20)$/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Radius Tokens',
    test: (name) => /^--(?:rounded(?:-.+)?|border-radius-.+)$/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Shadow Tokens',
    test: (name) => /^--(?:shadow|inset-shadow)-/.test(name),
  },
  {
    collectionKey: 'designVariableGroups',
    groupName: 'Filter Tokens',
    test: (name) => /^--filter-/.test(name),
  },
];

const RESPONSIVE_COLLECTION_KEY_BY_BASE_COLLECTION_KEY = {
  selectorGroups: 'selectorGroupsByBreakpoint',
  typographySelectorGroups: 'typographySelectorGroupsByBreakpoint',
  layoutSelectorGroups: 'layoutSelectorGroupsByBreakpoint',
  designSelectorGroups: 'designSelectorGroupsByBreakpoint',
};

const createIdFactory = () => {
  let counter = 1;

  return (prefix) => `${prefix}-${String(counter++).padStart(4, '0')}`;
};

const createResponsiveCollectionMap = () =>
  Object.fromEntries(
    buildDefaultBreakpointPresets().map((preset) => [preset.id, []])
  );

const normalizeCss = (value) => String(value || '').replace(/\r\n/g, '\n').trim();

const skipWhitespace = (value, startIndex) => {
  let index = startIndex;
  while (index < value.length && /\s/.test(value[index])) {
    index += 1;
  }
  return index;
};

const extractComment = (value, startIndex = 0) => {
  const commentStart = value.indexOf('/*', startIndex);
  if (commentStart === -1) {
    return null;
  }

  const commentEnd = value.indexOf('*/', commentStart);
  if (commentEnd === -1) {
    return null;
  }

  return {
    comment: value.slice(commentStart, commentEnd + 2).trim(),
    endIndex: commentEnd + 2,
  };
};

const cleanCommentLabel = (comment) =>
  String(comment || '')
    .replace(/^\/\*+/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ');

const parseDeclarations = (body) => {
  const declarations = [];
  const declarationRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match = declarationRegex.exec(body);

  while (match) {
    declarations.push({
      property: match[1].trim(),
      value: match[2].trim(),
    });
    match = declarationRegex.exec(body);
  }

  return declarations;
};

const parseRootVariables = (rootBody) =>
  parseDeclarations(rootBody).map((declaration) => ({
    name: `--${declaration.property.replace(/^--/, '')}`,
    value: declaration.value,
  }));

const parseRuleBlock = (ruleBlock, createId) => {
  const openBraceIndex = ruleBlock.indexOf('{');
  const selector = ruleBlock.slice(0, openBraceIndex).trim();
  const rawBody = ruleBlock.slice(openBraceIndex + 1, -1);
  const trimmedBody = rawBody.trim();

  let inlineComment = '';
  let propertyBody = trimmedBody;

  if (propertyBody.startsWith('/*')) {
    const commentEnd = propertyBody.indexOf('*/');
    inlineComment = propertyBody.slice(0, commentEnd + 2).trim();
    propertyBody = propertyBody.slice(commentEnd + 2).trim();
  }

  const exportStyle =
    inlineComment || rawBody.includes('\n') ? 'block' : 'compact';

  return {
    id: createId('ske-rule'),
    selector,
    properties: parseDeclarations(propertyBody).map((declaration) => ({
      id: createId('ske-prop'),
      property: declaration.property,
      value: declaration.value,
    })),
    __frameworkMeta: {
      type: SKELEMENTOR_FRAMEWORK_TYPE,
      exportStyle,
      inlineComment,
    },
  };
};

const parseRuleBlocks = (body, createId) => {
  const rules = [];
  let cursor = 0;

  while (cursor < body.length) {
    cursor = skipWhitespace(body, cursor);
    if (cursor >= body.length) {
      break;
    }

    const openBraceIndex = body.indexOf('{', cursor);
    if (openBraceIndex === -1) {
      break;
    }

    let depth = 1;
    let index = openBraceIndex + 1;
    while (index < body.length && depth > 0) {
      if (body[index] === '{') {
        depth += 1;
      } else if (body[index] === '}') {
        depth -= 1;
      }
      index += 1;
    }

    const ruleBlock = body.slice(cursor, index).trim();
    if (ruleBlock) {
      const rule = parseRuleBlock(ruleBlock, createId);
      let lookahead = index;
      while (lookahead < body.length && /\s/.test(body[lookahead])) {
        lookahead += 1;
      }

      rule.__frameworkMeta.trailingBlankLine = /\n\s*\n/.test(
        body.slice(index, lookahead)
      );
      rules.push(rule);
      cursor = lookahead;
      continue;
    }
    cursor = index;
  }

  return rules;
};

const parseSectionBodies = (cssBlock, createId) => {
  const sections = [];
  let cursor = 0;

  while (cursor < cssBlock.length) {
    const whitespaceStart = cursor;
    cursor = skipWhitespace(cssBlock, cursor);
    const leadingWhitespace = cssBlock.slice(whitespaceStart, cursor);
    if (cursor >= cssBlock.length) {
      break;
    }

    const extractedComment = extractComment(cssBlock, cursor);
    if (!extractedComment || cssBlock.indexOf('/*', cursor) !== cursor) {
      break;
    }

    const { comment, endIndex } = extractedComment;
    cursor = endIndex;
    const bodyStart = cursor;
    let bodyEnd = cssBlock.length;
    let depth = 0;

    for (let index = bodyStart; index < cssBlock.length - 1; index += 1) {
      if (cssBlock[index] === '{') {
        depth += 1;
      } else if (cssBlock[index] === '}') {
        depth = Math.max(0, depth - 1);
      }

      if (
        depth === 0 &&
        cssBlock[index] === '/' &&
        cssBlock[index + 1] === '*'
      ) {
        bodyEnd = index;
        break;
      }
    }

    const rawBody = cssBlock.slice(bodyStart, bodyEnd);
    const body = rawBody.trim();
    sections.push({
      comment,
      leadingBlankLine: sections.length === 0 || /\n\s*\n/.test(leadingWhitespace),
      trailingBlankLine: /\n\s*\n\s*$/.test(rawBody),
      rules: parseRuleBlocks(body, createId),
    });
    cursor = bodyEnd;
  }

  return sections.filter((section) => section.rules.length > 0);
};

const parseMediaBlocks = (responsiveCss, createId) => {
  const blocks = [];
  let cursor = 0;

  while (cursor < responsiveCss.length) {
    const mediaStart = responsiveCss.indexOf('@media', cursor);
    if (mediaStart === -1) {
      break;
    }

    const openBraceIndex = responsiveCss.indexOf('{', mediaStart);
    const query = responsiveCss.slice(mediaStart + 6, openBraceIndex).trim();

    let depth = 1;
    let index = openBraceIndex + 1;
    while (index < responsiveCss.length && depth > 0) {
      if (responsiveCss[index] === '{') {
        depth += 1;
      } else if (responsiveCss[index] === '}') {
        depth -= 1;
      }
      index += 1;
    }

    const body = responsiveCss.slice(openBraceIndex + 1, index - 1).trim();
    const extractedComment = extractComment(body, 0);
    const comment = extractedComment?.comment || '';
    const rules = parseRuleBlocks(
      extractedComment ? body.slice(extractedComment.endIndex).trim() : body,
      createId
    );

    blocks.push({
      query,
      comment,
      rules,
    });
    cursor = index;
  }

  return blocks;
};

const createEmptyWorkspaceShape = () => ({
  workspaceSource: 'skelementor-preset',
  activePage: 'Colors',
  colorGroups: [],
  isSpacingEnabled: true,
  spacingGroups: [],
  generatorConfig: [],
  isTypographyEnabled: true,
  typographyGroups: [],
  typographyGeneratorConfig: [],
  typographySelectorGroups: [],
  typographyVariableGroups: [],
  components: [],
  selectorGroups: [],
  selectorGroupsByBreakpoint: createResponsiveCollectionMap(),
  variableGroups: [],
  variableGroupsByBreakpoint: createResponsiveCollectionMap(),
  layoutSelectorGroups: [],
  layoutSelectorGroupsByBreakpoint: createResponsiveCollectionMap(),
  layoutVariableGroups: [],
  layoutVariableGroupsByBreakpoint: createResponsiveCollectionMap(),
  designSelectorGroups: [],
  designSelectorGroupsByBreakpoint: createResponsiveCollectionMap(),
  designVariableGroups: [],
  designVariableGroupsByBreakpoint: createResponsiveCollectionMap(),
  typographySelectorGroupsByBreakpoint: createResponsiveCollectionMap(),
  typographyVariableGroupsByBreakpoint: createResponsiveCollectionMap(),
  breakpointPresets: buildDefaultBreakpointPresets().map((preset) => ({
    ...preset,
    isActive: true,
  })),
  pageViewportByPage: {
    ...DEFAULT_PAGE_VIEWPORT_BY_PAGE,
  },
  exportSelection: buildDefaultExportSelection(),
  customCSS: PLACEHOLDER_CUSTOM_CSS,
});

const findVariableGroupDefinition = (name) =>
  VARIABLE_GROUP_DEFINITIONS.find((definition) => definition.test(name)) || {
    collectionKey: 'designVariableGroups',
    groupName: 'Framework Tokens',
  };

const findOrCreateNamedColorGroup = (workspace, groupMap, createId, groupName) => {
  const existing = groupMap[groupName];
  if (existing) {
    return existing;
  }

  const nextGroup = {
    id: createId('ske-color-group'),
    name: groupName,
    colors: [],
  };
  groupMap[groupName] = nextGroup;
  workspace.colorGroups.push(nextGroup);
  return nextGroup;
};

const findOrCreateVariableGroup = (
  workspace,
  groupMap,
  createId,
  collectionKey,
  groupName
) => {
  const cacheKey = `${collectionKey}:${groupName}`;
  const existing = groupMap[cacheKey];
  if (existing) {
    return existing;
  }

  const nextGroup = {
    id: createId('ske-var-group'),
    name: groupName,
    variables: [],
  };
  groupMap[cacheKey] = nextGroup;
  workspace[collectionKey].push(nextGroup);
  return nextGroup;
};

const classifyBaseSectionCollection = (comment) => {
  const label = cleanCommentLabel(comment);

  if (/\bTYPOGRAPHY\b/i.test(label)) {
    return 'typographySelectorGroups';
  }

  if (/\bGAP\b/i.test(label) || /^(?:MARGIN|PADDING|NEGATIVE MARGIN)/i.test(label)) {
    return 'selectorGroups';
  }

  if (
    /^(?:DISPLAY|OVERFLOW|OBJECT FIT|ASPECT RATIO|POSITION|Z-INDEX|FLEXBOX|WIDTH|MAX WIDTH|HEIGHT|MIN HEIGHT)/i.test(
      label
    )
  ) {
    return 'layoutSelectorGroups';
  }

  return 'designSelectorGroups';
};

const buildBreakpointLookup = () =>
  Object.fromEntries(
    buildDefaultBreakpointPresets().map((preset) => [buildMediaQuery(preset), preset])
  );

const buildResponsiveSnapshotLookup = () => {
  const { classes } = getReferenceCanonicalSnapshots();
  const byBreakpoint = {};
  const byLabel = {};

  (classes.order || []).forEach((id) => {
    const item = classes.items?.[id];
    const label = item?.label;
    const responsiveMeta = matchResponsiveLabel(label);
    if (!responsiveMeta) {
      return;
    }

    const snapshotBreakpoint =
      item?.variants?.[0]?.meta?.breakpoint || responsiveMeta.breakpoint;

    if (snapshotBreakpoint !== responsiveMeta.breakpoint) {
      throw new Error(
        `Responsive snapshot drift for ${label}: expected ${responsiveMeta.breakpoint}, received ${snapshotBreakpoint}`
      );
    }

    const entry = {
      label,
      breakpointId: snapshotBreakpoint,
      baseSelector: `.${responsiveMeta.base}`,
      suffix: responsiveMeta.suffix,
    };

    if (!byBreakpoint[snapshotBreakpoint]) {
      byBreakpoint[snapshotBreakpoint] = [];
    }

    byBreakpoint[snapshotBreakpoint].push(entry);
    byLabel[label] = entry;
  });

  return {
    byBreakpoint,
    byLabel,
  };
};

const buildResponsiveFrameworkRules = (
  mediaBlock,
  breakpointId,
  responsiveSnapshotLookup
) => {
  const expectedEntries = responsiveSnapshotLookup.byBreakpoint[breakpointId] || [];
  const expectedLabels = new Set(expectedEntries.map((entry) => entry.label));
  const actualLabels = [];

  mediaBlock.rules.forEach((rule) => {
    const selectorLabel = String(rule.selector || '').replace(/^\./, '');
    const responsiveMeta = matchResponsiveLabel(selectorLabel);

    if (!responsiveMeta) {
      throw new Error(
        `Unexpected non-responsive selector "${rule.selector}" in ${breakpointId} Skelementor breakpoint block`
      );
    }

    if (!expectedLabels.has(selectorLabel)) {
      throw new Error(
        `Unexpected responsive selector "${rule.selector}" in ${breakpointId} Skelementor breakpoint block`
      );
    }

    actualLabels.push(selectorLabel);
  });

  const missingLabels = expectedEntries
    .filter((entry) => !actualLabels.includes(entry.label))
    .map((entry) => entry.label);

  if (missingLabels.length > 0) {
    throw new Error(
      `Missing responsive selectors for ${breakpointId}: ${missingLabels.join(', ')}`
    );
  }

  return mediaBlock.rules.map((rule, ruleOrder) => {
    const selectorLabel = String(rule.selector || '').replace(/^\./, '');
    const snapshotEntry = responsiveSnapshotLookup.byLabel[selectorLabel];

    return {
      ...rule,
      __frameworkMeta: {
        ...rule.__frameworkMeta,
        ruleOrder,
        responsiveLabel: snapshotEntry.label,
        responsiveSuffix: snapshotEntry.suffix,
        responsiveBaseSelector: snapshotEntry.baseSelector,
      },
    };
  });
};

const groupResponsiveRulesByCollectionKey = (
  rules,
  baseSelectorCollectionKeyBySelector
) =>
  rules.reduce((collectionMap, rule) => {
    const responsiveBaseSelector =
      rule.__frameworkMeta?.responsiveBaseSelector ||
      `.${matchResponsiveLabel(String(rule.selector || '').replace(/^\./, ''))?.base || ''}`;
    const baseCollectionKey =
      baseSelectorCollectionKeyBySelector[responsiveBaseSelector];
    const collectionKey =
      RESPONSIVE_COLLECTION_KEY_BY_BASE_COLLECTION_KEY[baseCollectionKey] ||
      DEFAULT_RESPONSIVE_SELECTOR_COLLECTION_KEY;

    if (!collectionMap[collectionKey]) {
      collectionMap[collectionKey] = [];
    }

    collectionMap[collectionKey].push(rule);
    return collectionMap;
  }, {});

const assignFrameworkVariable = (
  workspace,
  rootVariable,
  createId,
  colorGroupMap,
  variableGroupMap,
  rootOrder
) => {
  const frameworkMeta = {
    type: SKELEMENTOR_FRAMEWORK_TYPE,
    rootOrder,
  };

  if (COLOR_GROUPS[rootVariable.name]) {
    const colorGroup = findOrCreateNamedColorGroup(
      workspace,
      colorGroupMap,
      createId,
      COLOR_GROUPS[rootVariable.name]
    );
    colorGroup.colors.push({
      id: createId('ske-color'),
      name: rootVariable.name,
      value: rootVariable.value,
      format: 'HEX',
      shadesConfig: { enabled: false, count: 8, palette: [] },
      tintsConfig: { enabled: false, count: 8, palette: [] },
      transparentConfig: { enabled: false },
      shadowConfig: { enabled: false },
      utilityConfig: {
        text: false,
        background: false,
        border: false,
        fill: false,
      },
      __frameworkMeta: {
        ...frameworkMeta,
        rawValue: rootVariable.value,
      },
    });
    return;
  }

  if (/^--color-/.test(rootVariable.name)) {
    const colorGroup = findOrCreateNamedColorGroup(
      workspace,
      colorGroupMap,
      createId,
      'Semantic Color Tokens'
    );
    colorGroup.colors.push({
      id: createId('ske-color'),
      name: rootVariable.name,
      value: rootVariable.value,
      format: 'HEX',
      shadesConfig: { enabled: false, count: 8, palette: [] },
      tintsConfig: { enabled: false, count: 8, palette: [] },
      transparentConfig: { enabled: false },
      shadowConfig: { enabled: false },
      utilityConfig: {
        text: false,
        background: false,
        border: false,
        fill: false,
      },
      __frameworkMeta: {
        ...frameworkMeta,
        rawValue: rootVariable.value,
      },
    });
    return;
  }

  const definition = findVariableGroupDefinition(rootVariable.name);
  if (!definition) {
    return;
  }

  const variableGroup = findOrCreateVariableGroup(
    workspace,
    variableGroupMap,
    createId,
    definition.collectionKey,
    definition.groupName
  );

  variableGroup.variables.push({
    id: createId('ske-var'),
    name: rootVariable.name,
    value: rootVariable.value,
    mode: 'single',
    minValue: 0,
    maxValue: 0,
    __frameworkMeta: frameworkMeta,
  });
};

const assignFrameworkSection = (
  workspace,
  section,
  createId,
  sectionOrder,
  collectionKey,
  breakpointMeta = null
) => {
  const nextGroup = {
    id: createId('ske-selector-group'),
    name: cleanCommentLabel(section.comment),
    rules: section.rules.map((rule, ruleOrder) => ({
      ...rule,
      __frameworkMeta: {
        ...rule.__frameworkMeta,
        type: SKELEMENTOR_FRAMEWORK_TYPE,
        sectionComment: section.comment,
        sectionOrder,
        leadingBlankLine: section.leadingBlankLine ?? true,
        sectionTrailingBlankLine: section.trailingBlankLine ?? false,
        ruleOrder: rule.__frameworkMeta?.ruleOrder ?? ruleOrder,
        ...(breakpointMeta || {}),
      },
    })),
  };

  if (breakpointMeta?.breakpointId) {
    workspace[collectionKey][breakpointMeta.breakpointId] = [
      ...(workspace[collectionKey][breakpointMeta.breakpointId] || []),
      nextGroup,
    ];
    return;
  }

  workspace[collectionKey].push(nextGroup);
  return nextGroup;
};

const buildSkelementorWorkspace = () => {
  const workspace = createEmptyWorkspaceShape();
  const createId = createIdFactory();
  const colorGroupMap = {};
  const variableGroupMap = {};
  const baseSelectorCollectionKeyBySelector = {};
  const responsiveSnapshotLookup = buildResponsiveSnapshotLookup();

  const headerCommentMatch = extractComment(skelementorUtilitiesCss, 0);
  const headerComment = headerCommentMatch?.comment || SKELEMENTOR_HEADER_COMMENT;
  const rootMatch = skelementorUtilitiesCss.match(/:root\s*\{([\s\S]*?)\}\s*/);
  const rootVariables = parseRootVariables(rootMatch?.[1] || '');

  rootVariables.forEach((rootVariable, index) => {
    assignFrameworkVariable(
      workspace,
      rootVariable,
      createId,
      colorGroupMap,
      variableGroupMap,
      index
    );
  });

  const afterRoot = skelementorUtilitiesCss
    .slice((rootMatch?.index || 0) + (rootMatch?.[0]?.length || 0))
    .trim();
  const responsiveHeaderIndex = afterRoot.indexOf(
    SKELEMENTOR_RESPONSIVE_HEADER_COMMENT
  );
  const baseCss =
    responsiveHeaderIndex === -1
      ? afterRoot
      : afterRoot.slice(0, responsiveHeaderIndex).trim();
  const responsiveCss =
    responsiveHeaderIndex === -1
      ? ''
      : afterRoot
          .slice(
            responsiveHeaderIndex + SKELEMENTOR_RESPONSIVE_HEADER_COMMENT.length
          )
          .trim();

  parseSectionBodies(baseCss, createId).forEach((section, sectionOrder) => {
    const collectionKey = classifyBaseSectionCollection(section.comment);
    const group = assignFrameworkSection(
      workspace,
      section,
      createId,
      sectionOrder,
      collectionKey
    );

    group.rules.forEach((rule) => {
      baseSelectorCollectionKeyBySelector[rule.selector] = collectionKey;
    });
  });

  const breakpointLookup = buildBreakpointLookup();
  parseMediaBlocks(responsiveCss, createId).forEach((mediaBlock) => {
    const preset = breakpointLookup[mediaBlock.query];
    if (!preset) {
      return;
    }

    const orderedResponsiveRules = buildResponsiveFrameworkRules(
      mediaBlock,
      preset.id,
      responsiveSnapshotLookup
    );
    const groupedResponsiveRules = groupResponsiveRulesByCollectionKey(
      orderedResponsiveRules,
      baseSelectorCollectionKeyBySelector
    );

    Object.entries(groupedResponsiveRules).forEach(
      ([collectionKey, collectionRules]) => {
        assignFrameworkSection(
          workspace,
          {
            ...mediaBlock,
            rules: collectionRules,
          },
          createId,
          SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER.indexOf(preset.id),
          collectionKey,
          {
            breakpointId: preset.id,
            mediaOrder: SKELEMENTOR_RESPONSIVE_BREAKPOINT_ORDER.indexOf(preset.id),
            mediaQuery: mediaBlock.query,
          }
        );
      }
    );
  });

  workspace.__frameworkMeta = {
    type: SKELEMENTOR_FRAMEWORK_TYPE,
    headerComment,
    responsiveHeaderComment: SKELEMENTOR_RESPONSIVE_HEADER_COMMENT,
  };

  return workspace;
};

let cachedWorkspace = null;

export const buildSkelementorPresetWorkspace = () => {
  if (!cachedWorkspace) {
    cachedWorkspace = buildSkelementorWorkspace();
  }

  return JSON.parse(JSON.stringify(cachedWorkspace));
};

export const isLegacyRawCssPresetWorkspace = (workspace = {}) => {
  const collectionKeys = [
    'colorGroups',
    'spacingGroups',
    'typographyGroups',
    'typographySelectorGroups',
    'typographyVariableGroups',
    'components',
    'selectorGroups',
    'variableGroups',
    'layoutSelectorGroups',
    'layoutVariableGroups',
    'designSelectorGroups',
    'designVariableGroups',
  ];

  const isEmptyStructuredWorkspace = collectionKeys.every(
    (key) => Array.isArray(workspace[key]) && workspace[key].length === 0
  );
  const hasEmptyResponsiveCollections = RESPONSIVE_COLLECTION_KEYS.every((key) => {
    const collection = workspace[key] || {};
    return Object.values(collection).every(
      (groups) => Array.isArray(groups) && groups.length === 0
    );
  });

  return (
    !workspace.__frameworkMeta &&
    isEmptyStructuredWorkspace &&
    hasEmptyResponsiveCollections &&
    normalizeCss(workspace.customCSS) === normalizeCss(skelementorUtilitiesCss)
  );
};
