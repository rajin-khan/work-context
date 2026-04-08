import referenceClassSnapshot from '../framework/reference/global-classes.json';
import referenceVariableSnapshot from '../framework/reference/global-variables.json';

const RESPONSIVE_SUFFIX_PATTERN = /--on-(?:xxl|xl|xs|l|m|s)$/;
const READABLE_CLASS_PREFIX = 'sk-class-';
const READABLE_VARIABLE_PREFIX = 'sk-var-';
const MAX_ID_LENGTH = 64;
const COLLISION_SUFFIX_LENGTH = 6;

export const VARIABLE_TYPES = {
  COLOR: 'global-color-variable',
  FONT: 'global-font-variable',
  SIZE: 'global-size-variable',
  CUSTOM_SIZE: 'global-custom-size-variable',
};

export const getReferenceCanonicalSnapshots = () => ({
  classes: referenceClassSnapshot,
  variables: referenceVariableSnapshot,
});

export const normalizeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_/\\.]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const normalizeReservedIds = (reservedIds = []) => {
  const reserved = new Set();

  reservedIds.forEach((value) => {
    if (typeof value === 'string' && value.trim()) {
      reserved.add(value);
    }
  });

  return reserved;
};

const buildReadableId = (
  prefix,
  sourceSlug,
  reservedIds = []
) => {
  const reserved = normalizeReservedIds(reservedIds);
  const safeSourceSlug = sourceSlug || 'item';
  const baseSlugLength = Math.max(1, MAX_ID_LENGTH - prefix.length);
  let candidate = `${prefix}${safeSourceSlug.slice(0, baseSlugLength)}`;

  if (!reserved.has(candidate)) {
    return candidate;
  }

  const hashSource = stableHash(safeSourceSlug);
  for (let suffixLength = COLLISION_SUFFIX_LENGTH; suffixLength <= 12; suffixLength += 1) {
    const suffix = hashSource.slice(0, suffixLength);
    const slugLength = Math.max(
      1,
      MAX_ID_LENGTH - prefix.length - 1 - suffix.length
    );
    candidate = `${prefix}${safeSourceSlug.slice(0, slugLength)}-${suffix}`;

    if (!reserved.has(candidate)) {
      return candidate;
    }
  }

  let attempt = 1;
  while (reserved.has(candidate)) {
    const suffix = stableHash(`${safeSourceSlug}-${attempt}`).slice(0, 12);
    const slugLength = Math.max(
      1,
      MAX_ID_LENGTH - prefix.length - 1 - suffix.length
    );
    candidate = `${prefix}${safeSourceSlug.slice(0, slugLength)}-${suffix}`;
    attempt += 1;
  }

  return candidate;
};

export const buildCanonicalClassId = (label, reservedIds = []) => {
  const cleanLabel = String(label || '').replace(/^\./, '');
  return buildReadableId(
    READABLE_CLASS_PREFIX,
    normalizeSlug(cleanLabel),
    reservedIds
  );
};

export const buildCanonicalVariableId = (cssName, reservedIds = []) =>
  buildReadableId(
    READABLE_VARIABLE_PREFIX,
    normalizeSlug(String(cssName || '').replace(/^--/, '')),
    reservedIds
  );

export const stripResponsiveSuffix = (label) =>
  String(label || '').replace(RESPONSIVE_SUFFIX_PATTERN, '');

export const matchResponsiveLabel = (label) => {
  const match = String(label || '').match(
    /^(.+?)(--on-(?:xxl|xl|xs|l|m|s))$/
  );

  if (!match) {
    return null;
  }

  const suffixMap = {
    '--on-xs': { breakpoint: 'mobile', rank: 0 },
    '--on-s': { breakpoint: 'mobile_extra', rank: 1 },
    '--on-m': { breakpoint: 'tablet', rank: 2 },
    '--on-l': { breakpoint: 'tablet_extra', rank: 3 },
    '--on-xl': { breakpoint: 'laptop', rank: 4 },
    '--on-xxl': { breakpoint: 'widescreen', rank: 6 },
  };

  const definition = suffixMap[match[2]];
  if (!definition) {
    return null;
  }

  return {
    base: match[1],
    suffix: match[2],
    breakpoint: definition.breakpoint,
    rank: definition.rank,
  };
};

export const prioritizeResponsiveClassOrder = (order = [], items = {}) => {
  const responsiveBases = {};

  order.forEach((id) => {
    const label = items[id]?.label || id;
    const match = matchResponsiveLabel(label);
    if (match) {
      responsiveBases[match.base] = true;
    }
  });

  if (Object.keys(responsiveBases).length === 0) {
    return order;
  }

  const familyPositions = {};
  const familyMembers = {};

  order.forEach((id, index) => {
    const label = items[id]?.label || id;
    const match = matchResponsiveLabel(label);
    let family = null;

    if (match && responsiveBases[match.base]) {
      family = match;
    } else if (responsiveBases[label]) {
      family = {
        base: label,
        rank: 5,
      };
    }

    if (!family) {
      return;
    }

    familyPositions[family.base] = familyPositions[family.base] || [];
    familyMembers[family.base] = familyMembers[family.base] || [];
    familyPositions[family.base].push(index);
    familyMembers[family.base].push({
      id,
      rank: family.rank,
      index,
    });
  });

  const nextOrder = [...order];
  Object.entries(familyMembers).forEach(([base, members]) => {
    if (members.length < 2) {
      return;
    }

    members.sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return left.index - right.index;
    });

    familyPositions[base].forEach((position, offset) => {
      nextOrder[position] = members[offset].id;
    });
  });

  return nextOrder;
};

export const detectVariableType = (label, value) => {
  const normalizedLabel = normalizeTokenName(label);
  const normalizedValue = String(value ?? '').trim();

  if (isColorValue(normalizedValue) || isColorLabel(normalizedLabel)) {
    return VARIABLE_TYPES.COLOR;
  }

  if (isCustomSizeValue(normalizedValue)) {
    return VARIABLE_TYPES.CUSTOM_SIZE;
  }

  if (isFontLikeLabel(normalizedLabel) || isFontValue(normalizedValue)) {
    return VARIABLE_TYPES.FONT;
  }

  if (isSizeLikeLabel(normalizedLabel) || isSizeValue(normalizedValue)) {
    return VARIABLE_TYPES.SIZE;
  }

  return VARIABLE_TYPES.SIZE;
};

export const buildVariableSnapshotFromRootVariables = (rootVariables = {}) => {
  const items = {};
  const order = [];
  const reservedIds = [];

  Object.entries(rootVariables).forEach(([cssName, value], index) => {
    const normalizedCssName = String(cssName || '').replace(/^--/, '').trim();
    if (!normalizedCssName) {
      return;
    }

    const id = buildCanonicalVariableId(normalizedCssName, reservedIds);
    reservedIds.push(id);
    items[id] = {
      id,
      type: detectVariableType(normalizedCssName, value),
      label: normalizedCssName,
      value: String(value),
      order: index + 1,
      css_name: normalizedCssName,
    };
    order.push(id);
  });

  return {
    items,
    order,
  };
};

export const buildClassSnapshotFromClassNames = (classNames = []) => {
  const items = {};
  const reservedIds = [];

  classNames.forEach((className) => {
    const id = buildCanonicalClassId(className, reservedIds);
    reservedIds.push(id);
    items[id] = {
      id,
      label: className,
      type: 'class',
      variants: [],
    };
  });

  const order = prioritizeResponsiveClassOrder(Object.keys(items), items);

  return {
    items,
    order,
  };
};

const stripCssComments = (cssContent) =>
  String(cssContent || '').replace(/\/\*[\s\S]*?\*\//g, '');

const findMatchingBraceIndex = (content, openBraceIndex) => {
  let depth = 0;

  for (let index = openBraceIndex; index < content.length; index += 1) {
    const char = content[index];
    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};

const mapMediaQueryToBreakpoint = (query = '') => {
  const normalizedQuery = query.replace(/\s+/g, ' ').trim();

  if (normalizedQuery.includes('max-width: 767px')) {
    return 'mobile';
  }

  if (normalizedQuery.includes('max-width: 880px')) {
    return 'mobile_extra';
  }

  if (normalizedQuery.includes('max-width: 1024px')) {
    return 'tablet';
  }

  if (normalizedQuery.includes('max-width: 1200px')) {
    return 'tablet_extra';
  }

  if (normalizedQuery.includes('max-width: 1366px')) {
    return 'laptop';
  }

  if (normalizedQuery.includes('min-width: 2400px')) {
    return 'widescreen';
  }

  return 'desktop';
};

const collectClassRulesFromCss = (cssContent, inheritedBreakpoint = 'desktop') => {
  const sanitizedCss = stripCssComments(cssContent);
  const classRules = [];
  let cursor = 0;

  while (cursor < sanitizedCss.length) {
    const nextOpenBrace = sanitizedCss.indexOf('{', cursor);
    if (nextOpenBrace === -1) {
      break;
    }

    const selectorText = sanitizedCss.slice(cursor, nextOpenBrace).trim();
    const nextCloseBrace = findMatchingBraceIndex(sanitizedCss, nextOpenBrace);
    if (nextCloseBrace === -1) {
      break;
    }

    const blockContent = sanitizedCss.slice(nextOpenBrace + 1, nextCloseBrace);
    cursor = nextCloseBrace + 1;

    if (!selectorText) {
      continue;
    }

    if (selectorText.startsWith('@media')) {
      classRules.push(
        ...collectClassRulesFromCss(
          blockContent,
          mapMediaQueryToBreakpoint(selectorText)
        )
      );
      continue;
    }

    selectorText
      .split(',')
      .map((selector) => selector.trim())
      .forEach((selector) => {
        const classMatch = selector.match(/^\.([A-Za-z0-9_-]+(?:--on-(?:xxl|xl|xs|l|m|s))?)$/);
        if (!classMatch) {
          return;
        }

        classRules.push({
          className: classMatch[1],
          declarations: blockContent,
          breakpoint: inheritedBreakpoint,
        });
      });
  }

  return classRules;
};

const buildVariableLookup = (variableSnapshot = { items: {} }) =>
  Object.values(variableSnapshot.items || {}).reduce((lookup, item) => {
    lookup[item.css_name] = item;
    return lookup;
  }, {});

const splitCssValueTokens = (value) => {
  const tokens = [];
  let currentToken = '';
  let depth = 0;

  for (const char of String(value || '').trim()) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    }

    if (char === ' ' && depth === 0) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      continue;
    }

    currentToken += char;
  }

  if (currentToken) {
    tokens.push(currentToken);
  }

  return tokens;
};

const getPreferredValueTypeForProperty = (property) => {
  if (
    [
      'color',
      'border-color',
      'outline-color',
      'fill',
      'stroke',
    ].includes(property)
  ) {
    return VARIABLE_TYPES.COLOR;
  }

  if (
    [
      'font-size',
      'line-height',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'border-radius',
      'border-width',
      'top',
      'right',
      'bottom',
      'left',
      'inset',
      'outline-offset',
    ].includes(property)
  ) {
    return VARIABLE_TYPES.SIZE;
  }

  return null;
};

const buildValueToken = (rawValue, variableLookup, preferredType = null) => {
  const value = String(rawValue || '').trim();
  const variableMatch = value.match(/^var\(--([a-zA-Z0-9_-]+)\)$/);
  if (variableMatch) {
    const variable = variableLookup[variableMatch[1]];
    if (variable) {
      return {
        $$type: preferredType || variable.type,
        value: variable.id,
      };
    }
  }

  return {
    $$type: 'string',
    value,
  };
};

const buildDimensionsValue = (values, variableLookup) => {
  const tokens = values.map((value) =>
    value ? buildValueToken(value, variableLookup, VARIABLE_TYPES.SIZE) : null
  );

  if (tokens.length === 1) {
    return {
      'block-start': tokens[0],
      'block-end': tokens[0],
      'inline-start': tokens[0],
      'inline-end': tokens[0],
    };
  }

  if (tokens.length === 2) {
    return {
      'block-start': tokens[0],
      'block-end': tokens[0],
      'inline-start': tokens[1],
      'inline-end': tokens[1],
    };
  }

  if (tokens.length === 3) {
    return {
      'block-start': tokens[0],
      'block-end': tokens[2],
      'inline-start': tokens[1],
      'inline-end': tokens[1],
    };
  }

  return {
    'block-start': tokens[0] || null,
    'inline-end': tokens[1] || null,
    'block-end': tokens[2] || null,
    'inline-start': tokens[3] || null,
  };
};

const buildDirectionalDimensionsValue = (properties, baseProperty, variableLookup) => {
  const shorthandValue = properties[baseProperty];
  if (shorthandValue) {
    const shorthandTokens = splitCssValueTokens(shorthandValue);
    if (shorthandTokens.length === 1) {
      return buildValueToken(
        shorthandTokens[0],
        variableLookup,
        VARIABLE_TYPES.SIZE
      );
    }

    return buildDimensionsValue(shorthandTokens, variableLookup);
  }

  const sides = {
    'block-start': properties[`${baseProperty}-top`] || null,
    'block-end': properties[`${baseProperty}-bottom`] || null,
    'inline-start': properties[`${baseProperty}-left`] || null,
    'inline-end': properties[`${baseProperty}-right`] || null,
  };

  if (Object.values(sides).every((value) => value === null)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(sides).map(([key, value]) => [
      key,
      value
        ? buildValueToken(value, variableLookup, VARIABLE_TYPES.SIZE)
        : null,
    ])
  );
};

const buildGapValue = (properties, variableLookup) => {
  if (properties.gap) {
    return buildValueToken(properties.gap, variableLookup, VARIABLE_TYPES.SIZE);
  }

  if (!properties['row-gap'] && !properties['column-gap']) {
    return null;
  }

  return {
    $$type: 'layout-direction',
    value: {
      row: properties['row-gap']
        ? buildValueToken(
            properties['row-gap'],
            variableLookup,
            VARIABLE_TYPES.SIZE
          )
        : null,
      column: properties['column-gap']
        ? buildValueToken(
            properties['column-gap'],
            variableLookup,
            VARIABLE_TYPES.SIZE
          )
        : null,
    },
  };
};

const buildBackgroundValue = (properties, variableLookup) => {
  if (!properties['background-color']) {
    return null;
  }

  return {
    $$type: 'background',
    value: {
      color: buildValueToken(
        properties['background-color'],
        variableLookup,
        VARIABLE_TYPES.COLOR
      ),
    },
  };
};

const extractPropertiesFromDeclarations = (declarations) => {
  const properties = {};
  const declarationRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);?/g;
  let match = declarationRegex.exec(declarations);

  while (match) {
    properties[match[1].trim()] = match[2].trim();
    match = declarationRegex.exec(declarations);
  }

  return properties;
};

const buildVariantProps = (declarations, variableLookup) => {
  const properties = extractPropertiesFromDeclarations(declarations);
  const variantProps = {};

  const paddingValue = buildDirectionalDimensionsValue(
    properties,
    'padding',
    variableLookup
  );
  if (paddingValue) {
    variantProps.padding =
      paddingValue.$$type
        ? paddingValue
        : {
            $$type: 'dimensions',
            value: paddingValue,
          };
  }

  const marginValue = buildDirectionalDimensionsValue(
    properties,
    'margin',
    variableLookup
  );
  if (marginValue) {
    variantProps.margin =
      marginValue.$$type
        ? marginValue
        : {
            $$type: 'dimensions',
            value: marginValue,
          };
  }

  const gapValue = buildGapValue(properties, variableLookup);
  if (gapValue) {
    variantProps.gap = gapValue;
  }

  const backgroundValue = buildBackgroundValue(properties, variableLookup);
  if (backgroundValue) {
    variantProps.background = backgroundValue;
  }

  if (
    properties['flex-grow'] ||
    properties['flex-shrink'] ||
    properties['flex-basis']
  ) {
    variantProps.flex = {
      $$type: 'flex',
      value: {
        flexGrow: properties['flex-grow']
          ? {
              $$type: 'number',
              value: Number.parseFloat(properties['flex-grow']),
            }
          : null,
        flexShrink: properties['flex-shrink']
          ? {
              $$type: 'number',
              value: Number.parseFloat(properties['flex-shrink']),
            }
          : null,
        flexBasis: properties['flex-basis']
          ? buildValueToken(
              properties['flex-basis'],
              variableLookup,
              VARIABLE_TYPES.SIZE
            )
          : null,
      },
    };
  }

  Object.entries(properties).forEach(([property, value]) => {
    if (
      [
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'gap',
        'row-gap',
        'column-gap',
        'background-color',
        'flex-grow',
        'flex-shrink',
        'flex-basis',
        'cursor',
      ].includes(property)
    ) {
      return;
    }

    if (property === 'opacity') {
      const numericValue = Number.parseFloat(value);
      if (Number.isFinite(numericValue)) {
        variantProps.opacity = {
          $$type: 'size',
          value: {
            size:
              numericValue <= 1
                ? Math.round(numericValue * 100)
                : numericValue,
            unit: '%',
          },
        };
        return;
      }
    }

    if (['z-index', 'order'].includes(property)) {
      const numericValue = Number.parseFloat(value);
      if (Number.isFinite(numericValue)) {
        variantProps[property] = {
          $$type: 'number',
          value: numericValue,
        };
        return;
      }
    }

    variantProps[property] = buildValueToken(
      value,
      variableLookup,
      getPreferredValueTypeForProperty(property)
    );
  });

  return variantProps;
};

const applyClassPropHeuristics = (className, props, variableLookup) => {
  const nextProps = { ...props };

  if (/^border-(0|1|2|4|8|10|15|20)$/.test(className)) {
    nextProps['border-color'] =
      nextProps['border-color'] ||
      buildValueToken('var(--border-black)', variableLookup, VARIABLE_TYPES.COLOR);
    nextProps['border-style'] =
      nextProps['border-style'] || { $$type: 'string', value: 'solid' };
  }

  if (/^z-/.test(className)) {
    nextProps.position = nextProps.position || {
      $$type: 'string',
      value: 'relative',
    };
  }

  return nextProps;
};

export const buildClassSnapshotFromCss = (
  cssContent,
  variableSnapshot = { items: {} }
) => {
  const items = {};
  const order = [];
  const reservedIds = [];
  const idByLabel = {};
  const variableLookup = buildVariableLookup(variableSnapshot);

  collectClassRulesFromCss(cssContent).forEach((rule) => {
    const id =
      idByLabel[rule.className] ||
      buildCanonicalClassId(rule.className, reservedIds);

    if (!items[id]) {
      reservedIds.push(id);
      idByLabel[rule.className] = id;
      items[id] = {
        id,
        label: rule.className,
        type: 'class',
        variants: [],
      };
      order.push(id);
    }

    const responsiveMatch = matchResponsiveLabel(rule.className);
    items[id].variants.push({
      meta: {
        breakpoint: responsiveMatch?.breakpoint || rule.breakpoint || 'desktop',
        state: null,
      },
      props: applyClassPropHeuristics(
        rule.className,
        buildVariantProps(rule.declarations, variableLookup),
        variableLookup
      ),
    });
  });

  return {
    items,
    order: prioritizeResponsiveClassOrder(order, items),
  };
};

export const extractRootVariablesFromCss = (cssContent) => {
  const rootVariables = {};
  const rootBlockRegex = /:root\s*\{([\s\S]*?)\}/g;
  let rootMatch = rootBlockRegex.exec(cssContent);

  while (rootMatch) {
    const declarationRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let declarationMatch = declarationRegex.exec(rootMatch[1]);

    while (declarationMatch) {
      const cssName = declarationMatch[1].replace(/^--/, '');
      if (!(cssName in rootVariables)) {
        rootVariables[cssName] = declarationMatch[2].trim();
      }
      declarationMatch = declarationRegex.exec(rootMatch[1]);
    }

    rootMatch = rootBlockRegex.exec(cssContent);
  }

  return rootVariables;
};

export const extractClassNamesFromCss = (cssContent) => {
  const classNames = new Set();
  const classRegex = /^\s*\.([A-Za-z0-9_-]+(?:--on-(?:xxl|xl|xs|l|m|s))?)\s*\{/gm;
  let match = classRegex.exec(cssContent);

  while (match) {
    classNames.add(match[1]);
    match = classRegex.exec(cssContent);
  }

  return Array.from(classNames);
};

export const buildCanonicalSnapshotsFromCss = (cssContent) => {
  const rootVariables = extractRootVariablesFromCss(cssContent);
  const variableSnapshot = buildVariableSnapshotFromRootVariables(rootVariables);

  return {
    classes: buildClassSnapshotFromCss(cssContent, variableSnapshot),
    variables: variableSnapshot,
  };
};

export const buildSkelePackageV2 = (cssContent, sourceName = 'Skelekit Export') => {
  const canonicalSnapshots = buildCanonicalSnapshotsFromCss(cssContent);

  return {
    version: '2.0',
    format: 'skelementor-package',
    source: sourceName,
    created_at: new Date().toISOString(),
    payload: {
      encoding: 'base64',
      css: encodeBase64(cssContent),
    },
    canonical_snapshots: canonicalSnapshots,
  };
};

export const diffSnapshots = (leftSnapshot = {}, rightSnapshot = {}) => {
  const leftJson = JSON.stringify(leftSnapshot);
  const rightJson = JSON.stringify(rightSnapshot);

  return {
    matches: leftJson === rightJson,
    leftCount: Object.keys(leftSnapshot.items || {}).length,
    rightCount: Object.keys(rightSnapshot.items || {}).length,
  };
};

export const encodeBase64 = (value) => {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch (error) {
    return btoa(value);
  }
};

export const stableHash = (value) => {
  const bytes = new TextEncoder().encode(String(value));
  const words = [];

  for (let index = 0; index < bytes.length; index += 1) {
    words[index >> 2] |= bytes[index] << (24 - (index % 4) * 8);
  }

  words[bytes.length >> 2] |= 0x80 << (24 - (bytes.length % 4) * 8);
  words[(((bytes.length + 8) >> 6) + 1) * 16 - 1] = bytes.length * 8;

  const rotateLeft = (num, bits) => (num << bits) | (num >>> (32 - bits));

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let blockStart = 0; blockStart < words.length; blockStart += 16) {
    const schedule = new Array(80);

    for (let index = 0; index < 16; index += 1) {
      schedule[index] = words[blockStart + index] | 0;
    }

    for (let index = 16; index < 80; index += 1) {
      schedule[index] = rotateLeft(
        schedule[index - 3] ^
          schedule[index - 8] ^
          schedule[index - 14] ^
          schedule[index - 16],
        1
      );
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      let f = 0;
      let k = 0;

      if (index < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp =
        (rotateLeft(a, 5) + f + e + k + (schedule[index] | 0)) | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30) | 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4]
    .map((valuePart) => (valuePart >>> 0).toString(16).padStart(8, '0'))
    .join('');
};

const normalizeTokenName = (value) =>
  String(value || '').trim().toLowerCase().replace(/_/g, '-');

const isColorValue = (value) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
  /^rgba?\(/i.test(value) ||
  /^hsla?\(/i.test(value);

const isColorLabel = (label) => label.includes('color');

const isFontLikeLabel = (label) => {
  if (label.includes('font-size')) {
    return false;
  }

  return (
    ['font-family', 'font-stack', 'typeface'].some((keyword) =>
      label.includes(keyword)
    ) || /(^|-)font($|-)/.test(label)
  );
};

const isSizeLikeLabel = (label) =>
  [
    'font-size',
    'space',
    'spacing',
    'margin',
    'padding',
    'gap',
    'size',
    'width',
    'height',
    'radius',
    'border-radius',
    'border-width',
    'outline-offset',
    'inset',
    'top',
    'right',
    'bottom',
    'left',
    'line-height',
    'leading',
  ].some((keyword) => label.includes(keyword));

const isCssFunctionValue = (value) => /^(clamp|calc|min|max)\(/i.test(value);

const isCustomSizeValue = (value) =>
  isCssFunctionValue(value) || /^-?\d*\.?\d+$/.test(value);

const isSizeValue = (value) =>
  /^-?\d*\.?\d+(px|em|rem|%|pt|pc|cm|mm|in|ex|ch|vw|vh|vmin|vmax)$/i.test(
    value
  ) || value.toLowerCase() === 'auto';

const isFontValue = (value) => {
  if (!value || isCssFunctionValue(value) || isSizeValue(value)) {
    return false;
  }

  return value.includes(',') || /[A-Za-z]/.test(value);
};
