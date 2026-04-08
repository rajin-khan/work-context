import {
  ALL_BREAKPOINTS_ID,
  DEFAULT_PAGE_VIEWPORT_BY_PAGE,
  RESPONSIVE_PAGE_CONFIG,
  buildDefaultBreakpointPresets,
} from './breakpoints';
import {
  buildSkelementorPresetWorkspace,
  isLegacyRawCssPresetWorkspace,
} from '../presets/skelementorPreset';

const RESPONSIVE_MAP_KEYS = Object.values(RESPONSIVE_PAGE_CONFIG).map(
  ({ mapKey }) => mapKey
);

export const migrateWorkspaceData = (workspace = {}) => {
  const tokenMigratedWorkspace = migrateLegacySkelementorTokens(workspace);
  if (isLegacyRawCssPresetWorkspace(tokenMigratedWorkspace)) {
    const presetWorkspace = buildSkelementorPresetWorkspace();
    return {
      ...presetWorkspace,
      activePage: tokenMigratedWorkspace.activePage || presetWorkspace.activePage,
    };
  }

  const breakpointPresets = migrateBreakpointPresets(
    tokenMigratedWorkspace.breakpointPresets
  );
  const pageViewportByPage = normalizePageViewportMap(
    tokenMigratedWorkspace.pageViewportByPage,
    breakpointPresets
  );

  const nextWorkspace = {
    ...tokenMigratedWorkspace,
    breakpointPresets,
    pageViewportByPage,
  };

  RESPONSIVE_MAP_KEYS.forEach((key) => {
    nextWorkspace[key] = normalizeResponsiveCollectionMap(
      tokenMigratedWorkspace[key],
      breakpointPresets
    );
  });

  return nextWorkspace;
};

export const normalizeResponsiveCollectionMap = (collectionMap = {}, presets = []) => {
  const activePresetIds = new Set(presets.map((preset) => preset.id));
  const nextMap = {};

  Object.entries(collectionMap || {}).forEach(([key, value]) => {
    if (!activePresetIds.has(key) || !Array.isArray(value)) {
      return;
    }

    nextMap[key] = value;
  });

  return nextMap;
};

const migrateBreakpointPresets = (presets) => {
  const defaultPresets = buildDefaultBreakpointPresets();
  if (!Array.isArray(presets) || presets.length === 0) {
    return defaultPresets;
  }

  const defaultById = Object.fromEntries(defaultPresets.map((preset) => [preset.id, preset]));
  const nextPresets = presets.flatMap((preset) => {
    const defaultPreset = defaultById[preset.id];
    if (!defaultPreset) {
      return [];
    }

    return {
      ...defaultPreset,
      ...preset,
      id: defaultPreset.id,
      key: defaultPreset.key,
      suffix: defaultPreset.suffix,
      isSyncSafe: true,
      isEditable: false,
    };
  });

  defaultPresets.forEach((defaultPreset) => {
    if (!nextPresets.some((preset) => preset.id === defaultPreset.id)) {
      nextPresets.push(defaultPreset);
    }
  });

  return nextPresets;
};

const normalizePageViewportMap = (pageViewportByPage = {}, presets = []) => {
  const validViewportIds = new Set([
    ALL_BREAKPOINTS_ID,
    ...presets.map((preset) => preset.id),
  ]);

  return Object.fromEntries(
    Object.keys(DEFAULT_PAGE_VIEWPORT_BY_PAGE).map((pageId) => {
      const viewportId = pageViewportByPage?.[pageId] || ALL_BREAKPOINTS_ID;
      return [
        pageId,
        validViewportIds.has(viewportId) ? viewportId : ALL_BREAKPOINTS_ID,
      ];
    })
  );
};

const migrateLegacySkelementorTokens = (workspace) => {
  const stringMap = {
    '--font-sans': '--font-family-sans',
    '--font-mono': '--font-family-mono',
    '--font-weight-normal': '--font-weight-normal',
    '--font-weight-bold': '--font-weight-bold',
    '--line-height-base': '--leading-normal',
    '--line-height-heading': '--leading-tight',
    '--container-max-width': '--max-w-xl',
    '--container-padding-x': '--space-4',
    '--radius-sm': '--rounded-sm',
    '--radius-md': '--rounded',
    '--radius-lg': '--rounded-lg',
    '--radius-full': '--rounded-full',
    '--focus-ring-color': '--color-primary',
    '--skele-white': '--color-surface',
    '--skele-black': '--text-black',
    '--skele-blue-400': '--color-primary',
    '--skele-blue-500': '--color-primary',
    '--skele-blue-600': '--color-primary',
    '--skele-danger': '--color-accent',
    '--skele-success': '--color-secondary',
    '--skele-warning': '--text-yellow',
  };

  const replaceString = (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    return Object.entries(stringMap).reduce(
      (nextValue, [legacyToken, currentToken]) =>
        nextValue.replaceAll(`var(${legacyToken})`, `var(${currentToken})`),
      value
    );
  };

  const visit = (value) => {
    if (Array.isArray(value)) {
      return value.map(visit);
    }

    if (!value || typeof value !== 'object') {
      return replaceString(value);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key === 'name' && typeof nestedValue === 'string' && stringMap[nestedValue]
          ? key
          : key,
        key === 'name' && typeof nestedValue === 'string' && stringMap[nestedValue]
          ? stringMap[nestedValue]
          : visit(nestedValue),
      ])
    );
  };

  const migratedWorkspace = visit(workspace);
  migratedWorkspace.pageViewportByPage = migratedWorkspace.pageViewportByPage || {};
  Object.keys(DEFAULT_PAGE_VIEWPORT_BY_PAGE).forEach((pageId) => {
    if (!migratedWorkspace.pageViewportByPage[pageId]) {
      migratedWorkspace.pageViewportByPage[pageId] = ALL_BREAKPOINTS_ID;
    }
  });

  return migratedWorkspace;
};
