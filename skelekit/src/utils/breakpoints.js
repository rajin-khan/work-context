export const ALL_BREAKPOINTS_ID = 'all';

export const RESPONSIVE_PAGE_IDS = [
  'Spacing Selectors',
  'Spacing Variables',
  'Typography Selectors',
  'Typography Variables',
  'Layout Selectors',
  'Layout Variables',
  'Design Selectors',
  'Design Variables',
];

export const RESPONSIVE_PAGE_CONFIG = {
  'Spacing Selectors': {
    baseKey: 'selectorGroups',
    mapKey: 'selectorGroupsByBreakpoint',
  },
  'Spacing Variables': {
    baseKey: 'variableGroups',
    mapKey: 'variableGroupsByBreakpoint',
  },
  'Typography Selectors': {
    baseKey: 'typographySelectorGroups',
    mapKey: 'typographySelectorGroupsByBreakpoint',
  },
  'Typography Variables': {
    baseKey: 'typographyVariableGroups',
    mapKey: 'typographyVariableGroupsByBreakpoint',
  },
  'Layout Selectors': {
    baseKey: 'layoutSelectorGroups',
    mapKey: 'layoutSelectorGroupsByBreakpoint',
  },
  'Layout Variables': {
    baseKey: 'layoutVariableGroups',
    mapKey: 'layoutVariableGroupsByBreakpoint',
  },
  'Design Selectors': {
    baseKey: 'designSelectorGroups',
    mapKey: 'designSelectorGroupsByBreakpoint',
  },
  'Design Variables': {
    baseKey: 'designVariableGroups',
    mapKey: 'designVariableGroupsByBreakpoint',
  },
};

export const DEFAULT_ELEMENTOR_BREAKPOINT_PRESETS = [
  {
    id: 'tablet',
    key: 'tablet',
    label: 'Tablet',
    kind: 'elementor',
    queryType: 'max',
    minWidth: null,
    maxWidth: 1024,
    isDefault: true,
    isRemovable: false,
    isSyncSafe: true,
    isEditable: false,
    isActive: true,
    suffix: '--on-m',
  },
  {
    id: 'mobile',
    key: 'mobile',
    label: 'Mobile',
    kind: 'elementor',
    queryType: 'max',
    minWidth: null,
    maxWidth: 767,
    isDefault: true,
    isRemovable: false,
    isSyncSafe: true,
    isEditable: false,
    isActive: true,
    suffix: '--on-xs',
  },
  {
    id: 'mobile_extra',
    key: 'mobile_extra',
    label: 'Mobile Extra',
    kind: 'elementor',
    queryType: 'max',
    minWidth: null,
    maxWidth: 880,
    isDefault: false,
    isRemovable: true,
    isSyncSafe: true,
    isEditable: false,
    isActive: false,
    suffix: '--on-s',
  },
  {
    id: 'tablet_extra',
    key: 'tablet_extra',
    label: 'Tablet Extra',
    kind: 'elementor',
    queryType: 'max',
    minWidth: null,
    maxWidth: 1200,
    isDefault: false,
    isRemovable: true,
    isSyncSafe: true,
    isEditable: false,
    isActive: false,
    suffix: '--on-l',
  },
  {
    id: 'laptop',
    key: 'laptop',
    label: 'Laptop',
    kind: 'elementor',
    queryType: 'max',
    minWidth: null,
    maxWidth: 1366,
    isDefault: false,
    isRemovable: true,
    isSyncSafe: true,
    isEditable: false,
    isActive: false,
    suffix: '--on-xl',
  },
  {
    id: 'widescreen',
    key: 'widescreen',
    label: 'Widescreen',
    kind: 'elementor',
    queryType: 'min',
    minWidth: 2400,
    maxWidth: null,
    isDefault: false,
    isRemovable: true,
    isSyncSafe: true,
    isEditable: false,
    isActive: false,
    suffix: '--on-xxl',
  },
];

export const DEFAULT_PAGE_VIEWPORT_BY_PAGE = RESPONSIVE_PAGE_IDS.reduce(
  (accumulator, pageId) => ({
    ...accumulator,
    [pageId]: ALL_BREAKPOINTS_ID,
  }),
  {}
);

export const buildDefaultBreakpointPresets = () =>
  DEFAULT_ELEMENTOR_BREAKPOINT_PRESETS.map((preset) => ({ ...preset }));

export const isResponsivePage = (pageId) => RESPONSIVE_PAGE_IDS.includes(pageId);

export const getResponsivePageConfig = (pageId) => RESPONSIVE_PAGE_CONFIG[pageId] || null;

export const getActiveBreakpointPresets = (presets = []) =>
  presets.filter((preset) => preset?.isActive);

export const getBreakpointPresetById = (presets = [], id) =>
  presets.find((preset) => preset.id === id) || null;

export const buildViewportOptions = (presets = []) => [
  { id: ALL_BREAKPOINTS_ID, label: 'All Breakpoints' },
  ...sortBreakpointsForToolbar(getActiveBreakpointPresets(presets)).map((preset) => ({
    id: preset.id,
    label: preset.label,
  })),
];

export const sortBreakpointsForToolbar = (presets = []) => {
  const sortOrder = {
    widescreen: 0,
    laptop: 1,
    tablet_extra: 2,
    tablet: 3,
    mobile_extra: 4,
    mobile: 5,
  };

  return [...presets].sort((left, right) => {
    const leftOrder = sortOrder[left.key] ?? 100;
    const rightOrder = sortOrder[right.key] ?? 100;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.label.localeCompare(right.label);
  });
};

export const sortBreakpointsForCss = (presets = []) => {
  const maxBreakpoints = [];
  const rangeBreakpoints = [];
  const minBreakpoints = [];

  presets.forEach((preset) => {
    if (!preset?.isActive) {
      return;
    }

    if (preset.queryType === 'min') {
      minBreakpoints.push(preset);
      return;
    }

    if (preset.queryType === 'range') {
      rangeBreakpoints.push(preset);
      return;
    }

    maxBreakpoints.push(preset);
  });

  maxBreakpoints.sort((left, right) => (right.maxWidth || 0) - (left.maxWidth || 0));
  rangeBreakpoints.sort((left, right) => {
    const maxCompare = (right.maxWidth || 0) - (left.maxWidth || 0);
    if (maxCompare !== 0) {
      return maxCompare;
    }

    return (left.minWidth || 0) - (right.minWidth || 0);
  });
  minBreakpoints.sort((left, right) => (left.minWidth || 0) - (right.minWidth || 0));

  return [...maxBreakpoints, ...rangeBreakpoints, ...minBreakpoints];
};

export const buildMediaQuery = (preset) => {
  if (!preset) {
    return '';
  }

  if (preset.queryType === 'min' && preset.minWidth) {
    return `(min-width: ${preset.minWidth}px)`;
  }

  if (preset.queryType === 'range' && preset.minWidth && preset.maxWidth) {
    return `(min-width: ${preset.minWidth}px) and (max-width: ${preset.maxWidth}px)`;
  }

  if (preset.maxWidth) {
    return `(max-width: ${preset.maxWidth}px)`;
  }

  return '';
};

export const getBreakpointDescription = (preset) => {
  if (!preset) {
    return '';
  }

  if (preset.queryType === 'min') {
    return `min-width ${preset.minWidth}px`;
  }

  if (preset.queryType === 'range') {
    return `${preset.minWidth}px to ${preset.maxWidth}px`;
  }

  return `max-width ${preset.maxWidth}px`;
};

export const getResponsiveCollection = (baseCollection = [], collectionMap = {}, viewport = ALL_BREAKPOINTS_ID) => {
  if (viewport === ALL_BREAKPOINTS_ID) {
    return baseCollection;
  }

  return collectionMap[viewport] || [];
};

export const replaceResponsiveCollection = (collectionMap = {}, viewport, collection) => {
  if (!viewport || viewport === ALL_BREAKPOINTS_ID) {
    return collectionMap;
  }

  return {
    ...collectionMap,
    [viewport]: collection,
  };
};

export const removeResponsiveCollection = (collectionMap = {}, viewport) => {
  if (!viewport || !collectionMap[viewport]) {
    return collectionMap;
  }

  const nextMap = { ...collectionMap };
  delete nextMap[viewport];
  return nextMap;
};
