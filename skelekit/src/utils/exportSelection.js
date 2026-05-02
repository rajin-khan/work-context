import referenceClassSnapshot from '../framework/reference/global-classes.json';
import { generateSpacingScale } from './spacingCalculator';

export const EXPORT_SELECTION_VERSION = 1;
export const DYNAMIC_EXPORT_SELECTION_MODE = 'dynamic-workspace';
export const FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE = 'framework-dynamic-workspace';

const RESPONSIVE_SUFFIX_PATTERN = /--on-(xxl|xl|xs|l|m|s)$/;
const TYPOGRAPHY_TEXT_SIZES = new Set([
  '2xs',
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
]);
const TYPOGRAPHY_TEXT_MISC = new Set([
  'start',
  'center',
  'end',
]);
const COLOR_KEYS = [
  'primary',
  'secondary',
  'neutral',
  'success',
  'warning',
  'error',
];
const BASE_COLOR_CLASSES = new Set([
  'white',
  'black',
  'gray-dark',
  'gray',
  'gray-light',
]);
const CORE_OPACITY = new Set(['0', '25', '50', '75', '100']);
const OPTIONAL_FAMILIES = new Set([
  'effects:shadows',
  'effects:inset-shadows',
  'effects:filters',
  'spacing:negative-margin',
  'colors:primary',
  'colors:secondary',
  'colors:neutral',
  'colors:success',
  'colors:warning',
  'colors:error',
  'effects:opacity-steps',
]);

const FAMILY_ORDER = [
  'Typography',
  'Spacing',
  'Sizing',
  'Colors',
  'Borders',
  'Layout',
  'Flexbox',
  'Effects',
  'Components',
];

const DYNAMIC_FAMILY_ORDER = [
  'Colors',
  'Typography',
  'Spacing',
  'Layouts',
  'Design',
  'Components',
];

const classLabels = referenceClassSnapshot.order.map(
  (id) => referenceClassSnapshot.items[id]?.label
).filter(Boolean);

const normalizeUnitId = (family, label) =>
  `${family}:${label}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const matchColorKey = (value) => {
  if (BASE_COLOR_CLASSES.has(value)) {
    return 'base-neutrals';
  }

  return COLOR_KEYS.find(
    (key) =>
      value === key ||
      value.startsWith(`${key}-l-`) ||
      value.startsWith(`${key}-d-`)
  );
};

const classifyClassName = (className) => {
  const responsiveMatch = className.match(RESPONSIVE_SUFFIX_PATTERN);
  if (responsiveMatch) {
    return classifyClassName(className.replace(RESPONSIVE_SUFFIX_PATTERN, ''));
  }

  if (className.startsWith('text-')) {
    const value = className.slice(5);
    if (TYPOGRAPHY_TEXT_SIZES.has(value)) {
      return { family: 'Typography', label: 'Type scale', key: 'typography:type-scale', defaultSelected: true };
    }
    if (TYPOGRAPHY_TEXT_MISC.has(value)) {
      return { family: 'Typography', label: 'Alignment', key: 'typography:alignment', defaultSelected: true };
    }
    const colorKey = matchColorKey(value);
    if (colorKey) {
      return { family: 'Colors', label: colorKey === 'base-neutrals' ? 'Base neutrals' : colorKey, key: `colors:${colorKey}`, defaultSelected: colorKey === 'base-neutrals' };
    }
  }

  if (className.startsWith('bg-') || className.startsWith('border-')) {
    const prefix = className.startsWith('bg-') ? 'bg-' : 'border-';
    const value = className.slice(prefix.length);
    const colorKey = matchColorKey(value);
    if (colorKey) {
      return { family: 'Colors', label: colorKey === 'base-neutrals' ? 'Base neutrals' : colorKey, key: `colors:${colorKey}`, defaultSelected: colorKey === 'base-neutrals' };
    }
  }

  if (className.startsWith('font-')) {
    return { family: 'Typography', label: 'Font weight', key: 'typography:font-weight', defaultSelected: true };
  }
  if (className.startsWith('leading-')) {
    return { family: 'Typography', label: 'Line height', key: 'typography:line-height', defaultSelected: true };
  }
  if (['uppercase', 'lowercase', 'underline', 'no-underline', 'italic'].includes(className)) {
    return { family: 'Typography', label: 'Transform and style', key: 'typography:style', defaultSelected: true };
  }
  if (className.startsWith('tracking-')) {
    return { family: 'Typography', label: 'Letter spacing', key: 'typography:letter-spacing', defaultSelected: true };
  }

  if (/^-(?:m|mx|my|mt|mb|ml|mr)-/.test(className)) {
    return { family: 'Spacing', label: 'Negative margin', key: 'spacing:negative-margin', defaultSelected: false };
  }
  if (/^(?:m|mx|my|mt|mb|ml|mr)-/.test(className)) {
    return { family: 'Spacing', label: 'Margin', key: 'spacing:margin', defaultSelected: true };
  }
  if (/^(?:p|px|py|pt|pb)-/.test(className)) {
    return { family: 'Spacing', label: 'Padding', key: 'spacing:padding', defaultSelected: true };
  }
  if (/^(?:gap|gap-x|gap-y)-/.test(className)) {
    return { family: 'Spacing', label: 'Gap', key: 'spacing:gap', defaultSelected: true };
  }

  if (className.startsWith('w-')) {
    return { family: 'Sizing', label: 'Width', key: 'sizing:width', defaultSelected: true };
  }
  if (className.startsWith('min-w-')) {
    return { family: 'Sizing', label: 'Min width', key: 'sizing:min-width', defaultSelected: true };
  }
  if (className.startsWith('max-w-')) {
    return { family: 'Sizing', label: 'Max width', key: 'sizing:max-width', defaultSelected: true };
  }
  if (className.startsWith('h-')) {
    return { family: 'Sizing', label: 'Height', key: 'sizing:height', defaultSelected: true };
  }
  if (className.startsWith('min-h-')) {
    return { family: 'Sizing', label: 'Min height', key: 'sizing:min-height', defaultSelected: true };
  }
  if (className.startsWith('max-h-')) {
    return { family: 'Sizing', label: 'Max height', key: 'sizing:max-height', defaultSelected: true };
  }

  if (/^border-(?:0|1|2|4|8|10|15|20|t-|r-|b-|l-|x-|y-)/.test(className)) {
    return { family: 'Borders', label: 'Border width', key: 'borders:width', defaultSelected: true };
  }
  if (['border-solid', 'border-dashed', 'border-none'].includes(className)) {
    return { family: 'Borders', label: 'Border style', key: 'borders:style', defaultSelected: true };
  }
  if (className.startsWith('rounded')) {
    return { family: 'Borders', label: 'Radius', key: 'borders:radius', defaultSelected: true };
  }

  if (['block', 'inline-block', 'flex', 'inline-flex', 'hidden'].includes(className)) {
    return { family: 'Layout', label: 'Display', key: 'layout:display', defaultSelected: true };
  }
  if (className.startsWith('overflow-')) {
    return { family: 'Layout', label: 'Overflow', key: 'layout:overflow', defaultSelected: true };
  }
  if (className.startsWith('object-')) {
    return { family: 'Layout', label: 'Object fit', key: 'layout:object-fit', defaultSelected: true };
  }
  if (className.startsWith('aspect-')) {
    return { family: 'Layout', label: 'Aspect ratio', key: 'layout:aspect-ratio', defaultSelected: true };
  }
  if (['static', 'relative', 'absolute', 'fixed', 'sticky'].includes(className)) {
    return { family: 'Layout', label: 'Position', key: 'layout:position', defaultSelected: true };
  }
  if (className.startsWith('z-')) {
    return { family: 'Layout', label: 'Z-index', key: 'layout:z-index', defaultSelected: true };
  }

  if (/^flex-(?:row|col)/.test(className)) {
    return { family: 'Flexbox', label: 'Direction', key: 'flexbox:direction', defaultSelected: true };
  }
  if (className.startsWith('flex-wrap') || className === 'flex-nowrap') {
    return { family: 'Flexbox', label: 'Wrap', key: 'flexbox:wrap', defaultSelected: true };
  }
  if (className.startsWith('justify-')) {
    return { family: 'Flexbox', label: 'Justify', key: 'flexbox:justify', defaultSelected: true };
  }
  if (className.startsWith('items-')) {
    return { family: 'Flexbox', label: 'Align items', key: 'flexbox:align-items', defaultSelected: true };
  }
  if (className.startsWith('self-')) {
    return { family: 'Flexbox', label: 'Align self', key: 'flexbox:align-self', defaultSelected: true };
  }
  if (className.startsWith('content-')) {
    return { family: 'Flexbox', label: 'Align content', key: 'flexbox:align-content', defaultSelected: true };
  }
  if (className.startsWith('order-')) {
    return { family: 'Flexbox', label: 'Order', key: 'flexbox:order', defaultSelected: true };
  }
  if (className === 'flex-grow' || className === 'flex-shrink') {
    return { family: 'Flexbox', label: 'Grow and shrink', key: 'flexbox:grow-shrink', defaultSelected: true };
  }
  if (className.startsWith('basis-')) {
    return { family: 'Flexbox', label: 'Basis', key: 'flexbox:basis', defaultSelected: true };
  }

  if (className.startsWith('shadow-')) {
    return { family: 'Effects', label: 'Shadows', key: 'effects:shadows', defaultSelected: false };
  }
  if (className.startsWith('inset-shadow-')) {
    return { family: 'Effects', label: 'Inset shadows', key: 'effects:inset-shadows', defaultSelected: false };
  }
  if (
    className === 'filter-none' ||
    /^(?:blur|brightness|contrast|saturate|hue-rotate|grayscale|invert|sepia)/.test(className)
  ) {
    return { family: 'Effects', label: 'Filters', key: 'effects:filters', defaultSelected: false };
  }
  if (className.startsWith('opacity-')) {
    const value = className.slice(8);
    return CORE_OPACITY.has(value)
      ? { family: 'Effects', label: 'Core opacity', key: 'effects:opacity-core', defaultSelected: true }
      : { family: 'Effects', label: 'Opacity steps', key: 'effects:opacity-steps', defaultSelected: false };
  }

  if (className.startsWith('btn-')) {
    return { family: 'Components', label: 'Buttons', key: 'components:buttons', defaultSelected: true };
  }
  if (className === 'card') {
    return { family: 'Components', label: 'Card', key: 'components:card', defaultSelected: true };
  }
  if (className === 'cont') {
    return { family: 'Components', label: 'Container', key: 'components:container', defaultSelected: true };
  }

  return { family: 'Layout', label: 'Other', key: 'layout:other', defaultSelected: true };
};

const createManifest = () => {
  const unitsByKey = {};

  classLabels.forEach((className) => {
    const classification = classifyClassName(className);
    if (!unitsByKey[classification.key]) {
      unitsByKey[classification.key] = {
        id: normalizeUnitId(classification.family, classification.label),
        family: classification.family,
        label: classification.label,
        classNames: [],
        variableNames: [],
        isOptional: OPTIONAL_FAMILIES.has(classification.key),
        defaultSelected: classification.defaultSelected,
      };
    }

    unitsByKey[classification.key].classNames.push(className);
  });

  const units = Object.values(unitsByKey).sort((left, right) => {
    const familyDelta =
      FAMILY_ORDER.indexOf(left.family) - FAMILY_ORDER.indexOf(right.family);
    if (familyDelta !== 0) {
      return familyDelta;
    }

    return left.label.localeCompare(right.label);
  });

  return {
    version: EXPORT_SELECTION_VERSION,
    totalClassCount: classLabels.length,
    families: FAMILY_ORDER,
    units,
  };
};

let cachedManifest = null;

export const getExportSelectionManifest = () => {
  if (!cachedManifest) {
    cachedManifest = createManifest();
  }

  return cachedManifest;
};

const countColorUtilityClasses = (color = {}) => {
  const baseCount = 1;
  const shadeCount = color.shadesConfig?.enabled
    ? color.shadesConfig?.palette?.length || 0
    : 0;
  const tintCount = color.tintsConfig?.enabled
    ? color.tintsConfig?.palette?.length || 0
    : 0;
  const transparentCount = color.transparentConfig?.enabled ? 10 : 0;
  const shadowCount = color.shadowConfig?.enabled ? 10 : 0;
  const variantCount = baseCount + shadeCount + tintCount + transparentCount + shadowCount;
  const enabledUtilityCount = [
    color.utilityConfig?.text,
    color.utilityConfig?.background,
    color.utilityConfig?.border,
    color.utilityConfig?.fill,
  ].filter(Boolean).length;

  return variantCount * enabledUtilityCount;
};

const normalizeLabel = (value, fallback) =>
  String(value || '').trim() || fallback;

const dynamicUnit = ({
  family,
  id,
  label,
  kind,
  itemCount = 0,
  classCount = 0,
}) => ({
  id: `dynamic:${kind}:${id}`,
  family,
  label,
  kind,
  sourceId: id,
  classNames: Array.from({ length: classCount }, (_, index) => `${id}-${index}`),
  itemCount: classCount || itemCount,
  isOptional: false,
  defaultSelected: true,
});

const frameworkDynamicUnit = ({
  family,
  id,
  label,
  kind = 'framework-concept',
  classNames = [],
  variableNames = [],
}) => ({
  id: `framework:${id}`,
  family,
  label,
  kind,
  sourceId: id,
  classNames: [...new Set(classNames)].sort(),
  variableNames: [...new Set(variableNames)].sort(),
  itemCount: new Set(classNames).size,
  isOptional: false,
  defaultSelected: true,
});

const countRules = (group) => group?.rules?.length || 0;
const countVariables = (group) => group?.variables?.length || 0;

export const getDynamicExportSelectionManifest = (data = {}) => {
  const units = [];

  (data.colorGroups || []).forEach((group, index) => {
    const classCount = (group.colors || []).reduce(
      (total, color) => total + countColorUtilityClasses(color),
      0
    );
    units.push(
      dynamicUnit({
        family: 'Colors',
        id: group.id,
        label: normalizeLabel(group.name, `Color Group ${index + 1}`),
        kind: 'color-group',
        itemCount: group.colors?.length || 0,
        classCount,
      })
    );
  });

  if (
    (data.typographyGroups || []).length > 0 ||
    (data.typographyGeneratorConfig || []).length > 0
  ) {
    units.push(
      dynamicUnit({
        family: 'Typography',
        id: 'generated',
        label: 'Generated Utilities',
        kind: 'typography-generated',
        itemCount:
          (data.typographyGroups || []).reduce(
            (total, group) => total + generateSpacingScale(group.settings).length,
            0
          ) +
          (data.typographyGeneratorConfig || []).length,
      })
    );
  }
  (data.typographySelectorGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Typography',
        id: group.id,
        label: normalizeLabel(group.name, `Typography Selectors ${index + 1}`),
        kind: 'typography-selector-group',
        itemCount: countRules(group),
      })
    );
  });
  (data.typographyVariableGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Typography',
        id: group.id,
        label: normalizeLabel(group.name, `Typography Variables ${index + 1}`),
        kind: 'typography-variable-group',
        itemCount: countVariables(group),
      })
    );
  });

  if (
    (data.spacingGroups || []).length > 0 ||
    (data.generatorConfig || []).length > 0
  ) {
    units.push(
      dynamicUnit({
        family: 'Spacing',
        id: 'generated',
        label: 'Generated Utilities',
        kind: 'spacing-generated',
        itemCount:
          (data.spacingGroups || []).reduce(
            (total, group) => total + generateSpacingScale(group.settings).length,
            0
          ) +
          (data.generatorConfig || []).length,
      })
    );
  }
  (data.selectorGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Spacing',
        id: group.id,
        label: normalizeLabel(group.name, `Spacing Selectors ${index + 1}`),
        kind: 'spacing-selector-group',
        itemCount: countRules(group),
      })
    );
  });
  (data.variableGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Spacing',
        id: group.id,
        label: normalizeLabel(group.name, `Spacing Variables ${index + 1}`),
        kind: 'spacing-variable-group',
        itemCount: countVariables(group),
      })
    );
  });

  (data.layoutSelectorGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Layouts',
        id: group.id,
        label: normalizeLabel(group.name, `Layout Selectors ${index + 1}`),
        kind: 'layout-selector-group',
        itemCount: countRules(group),
      })
    );
  });
  (data.layoutVariableGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Layouts',
        id: group.id,
        label: normalizeLabel(group.name, `Layout Variables ${index + 1}`),
        kind: 'layout-variable-group',
        itemCount: countVariables(group),
      })
    );
  });

  (data.designSelectorGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: group.name === 'COMPONENT PRESETS' ? 'Components' : 'Design',
        id: group.id,
        label: normalizeLabel(group.name, `Design Selectors ${index + 1}`),
        kind:
          group.name === 'COMPONENT PRESETS'
            ? 'component-selector-group'
            : 'design-selector-group',
        itemCount: countRules(group),
      })
    );
  });
  (data.designVariableGroups || []).forEach((group, index) => {
    units.push(
      dynamicUnit({
        family: 'Design',
        id: group.id,
        label: normalizeLabel(group.name, `Design Variables ${index + 1}`),
        kind: 'design-variable-group',
        itemCount: countVariables(group),
      })
    );
  });

  (data.components || []).forEach((component, index) => {
    units.push(
      dynamicUnit({
        family: 'Components',
        id: component.id,
        label: normalizeLabel(component.name, `Component ${index + 1}`),
        kind: 'component',
        classCount:
          1 +
          Object.keys(component.states || {}).length +
          (component.modifiers || []).reduce(
            (total, modifier) =>
              total + 1 + Object.keys(modifier.states || {}).length,
            0
          ),
      })
    );
  });

  const families = DYNAMIC_FAMILY_ORDER.filter((family) =>
    units.some((unit) => unit.family === family)
  );

  return {
    version: EXPORT_SELECTION_VERSION,
    mode: DYNAMIC_EXPORT_SELECTION_MODE,
    totalClassCount: units.reduce(
      (total, unit) => total + (unit.classNames.length || unit.itemCount || 0),
      0
    ),
    families,
    units,
  };
};

const normalizeFrameworkClassName = (className) =>
  className.replace(RESPONSIVE_SUFFIX_PATTERN, '');

const frameworkColorKeyForClass = (className) => {
  const normalized = normalizeFrameworkClassName(className);
  if (normalized.startsWith('text-')) {
    return matchColorKey(normalized.slice(5));
  }
  if (normalized.startsWith('bg-')) {
    return matchColorKey(normalized.slice(3));
  }
  if (normalized.startsWith('border-')) {
    return matchColorKey(normalized.slice(7));
  }
  return null;
};

const classNamesFromRules = (rules = []) =>
  rules.flatMap((rule) =>
    splitSelectors(rule.selector || '')
      .map(classNameFromSelector)
      .filter(Boolean)
  );

const variableNamesFromGroup = (group = {}) =>
  (group.variables || []).map((variable) => variable.name).filter(Boolean);

const addResponsiveClassNamesToBaseUnits = (units) => {
  const baseClassToUnits = new Map();
  units.forEach((unit) => {
    unit.classNames = unit.classNames || [];
    unit.classNames.forEach((className) => {
      if (RESPONSIVE_SUFFIX_PATTERN.test(className)) {
        return;
      }
      const entries = baseClassToUnits.get(className) || [];
      entries.push(unit);
      baseClassToUnits.set(className, entries);
    });
  });

  classLabels.forEach((className) => {
    if (!RESPONSIVE_SUFFIX_PATTERN.test(className)) {
      return;
    }

    const baseClassName = normalizeFrameworkClassName(className);
    (baseClassToUnits.get(baseClassName) || []).forEach((unit) => {
      unit.classNames.push(className);
    });
  });
};

const getFrameworkDynamicFallbackManifest = () => {
  const baseManifest = getExportSelectionManifest();
  const units = baseManifest.units.map((unit) =>
    frameworkDynamicUnit({
      family:
        unit.family === 'Layout' ||
        unit.family === 'Sizing' ||
        unit.family === 'Flexbox'
          ? 'Layouts'
          : unit.family === 'Borders' || unit.family === 'Effects'
            ? 'Design'
            : unit.family,
      id: normalizeUnitId(unit.family, unit.label),
      label: unit.label,
      kind: 'framework-selector-group',
      classNames: unit.classNames,
    })
  );

  return {
    version: EXPORT_SELECTION_VERSION,
    mode: FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE,
    totalClassCount: classLabels.length,
    families: DYNAMIC_FAMILY_ORDER.filter((family) =>
      units.some((unit) => unit.family === family)
    ),
    units,
  };
};

export const getFrameworkDynamicExportSelectionManifest = (data = null) => {
  if (!data) {
    return getFrameworkDynamicFallbackManifest();
  }

  const rawUnits = [];

  (data.colorGroups || []).forEach((group, index) => {
    const colorKeys = new Set(
      (group.colors || []).flatMap((color) => {
        const key = String(color.name || '')
          .replace(/^--(?:color-)?/, '')
          .replace(/^text-/, '')
          .replace(/^bg-/, '')
          .replace(/^border-/, '');
        return [key];
      })
    );
    rawUnits.push({
      family: 'Colors',
      id: `color-group-${group.id}`,
      label: normalizeLabel(group.name, `Color Group ${index + 1}`),
      kind: 'framework-color-group',
      classNames: classLabels.filter((className) => {
        const colorKey = frameworkColorKeyForClass(className);
        return colorKey && colorKeys.has(colorKey);
      }),
      variableNames: (group.colors || []).map((color) => color.name).filter(Boolean),
    });
  });

  [
    ['Typography', 'typography-selector-group', data.typographySelectorGroups || []],
    ['Spacing', 'spacing-selector-group', data.selectorGroups || []],
    ['Layouts', 'layout-selector-group', data.layoutSelectorGroups || []],
    ['Design', 'design-selector-group', data.designSelectorGroups || []],
  ].forEach(([family, kind, groups]) => {
    groups.forEach((group, index) => {
      const isComponentPreset = group.name === 'COMPONENT PRESETS';
      rawUnits.push({
        family: isComponentPreset ? 'Components' : family,
        id: `${kind}-${group.id}`,
        label: normalizeLabel(group.name, `${family} Selectors ${index + 1}`),
        kind: isComponentPreset ? 'component-selector-group' : kind,
        classNames: classNamesFromRules(group.rules),
      });
    });
  });

  [
    ['Typography', 'typography-variable-group', data.typographyVariableGroups || []],
    ['Spacing', 'spacing-variable-group', data.variableGroups || []],
    ['Layouts', 'layout-variable-group', data.layoutVariableGroups || []],
    ['Design', 'design-variable-group', data.designVariableGroups || []],
  ].forEach(([family, kind, groups]) => {
    groups.forEach((group, index) => {
      rawUnits.push({
        family,
        id: `${kind}-${group.id}`,
        label: normalizeLabel(group.name, `${family} Variables ${index + 1}`),
        kind,
        variableNames: variableNamesFromGroup(group),
      });
    });
  });

  addResponsiveClassNamesToBaseUnits(rawUnits);

  const units = rawUnits.map(frameworkDynamicUnit);
  const mappedClassNames = new Set(units.flatMap((unit) => unit.classNames));
  const unmappedClassNames = classLabels.filter(
    (className) => !mappedClassNames.has(className)
  );
  if (unmappedClassNames.length > 0) {
    units.push(
      frameworkDynamicUnit({
        family: 'Design',
        id: 'framework-other',
        label: 'Other Generated Utilities',
        kind: 'framework-generated',
        classNames: unmappedClassNames,
      })
    );
  }

  units.sort((left, right) => {
    const familyDelta =
      DYNAMIC_FAMILY_ORDER.indexOf(left.family) -
      DYNAMIC_FAMILY_ORDER.indexOf(right.family);
    if (familyDelta !== 0) {
      return familyDelta;
    }
    return left.label.localeCompare(right.label);
  });

  return {
    version: EXPORT_SELECTION_VERSION,
    mode: FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE,
    totalClassCount: classLabels.length,
    families: DYNAMIC_FAMILY_ORDER.filter((family) =>
      units.some((unit) => unit.family === family)
    ),
    units,
  };
};

export const buildDynamicExportSelection = (manifest = null) => ({
  version: EXPORT_SELECTION_VERSION,
  mode: manifest?.mode || DYNAMIC_EXPORT_SELECTION_MODE,
  deselectedUnitIds: [],
});

export const buildEmptyDynamicExportSelection = (manifest = null) => ({
  version: EXPORT_SELECTION_VERSION,
  mode: manifest?.mode || DYNAMIC_EXPORT_SELECTION_MODE,
  deselectedUnitIds: [],
  selectedUnitIds: [],
});

export const getSelectedUnitIdsForManifest = (
  exportSelection = null,
  manifest = getExportSelectionManifest()
) => {
  if (!exportSelection) {
    return new Set(manifest.units.map((unit) => unit.id));
  }

  if (
    exportSelection.mode === DYNAMIC_EXPORT_SELECTION_MODE ||
    exportSelection.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE
  ) {
    if (Array.isArray(exportSelection.selectedUnitIds)) {
      return new Set(exportSelection.selectedUnitIds);
    }

    const deselectedIds = new Set(exportSelection.deselectedUnitIds || []);
    return new Set(
      manifest.units
        .filter((unit) => !deselectedIds.has(unit.id))
        .map((unit) => unit.id)
    );
  }

  return new Set(
    exportSelection.selectedUnitIds || manifest.units.map((unit) => unit.id)
  );
};

export const buildDefaultExportSelection = () => ({
  version: EXPORT_SELECTION_VERSION,
  selectedUnitIds: getExportSelectionManifest()
    .units
    .filter((unit) => unit.defaultSelected)
    .map((unit) => unit.id),
});

export const buildAllExportSelection = () => ({
  version: EXPORT_SELECTION_VERSION,
  selectedUnitIds: getExportSelectionManifest().units.map((unit) => unit.id),
});

export const buildRequiredExportSelection = () => ({
  version: EXPORT_SELECTION_VERSION,
  selectedUnitIds: getExportSelectionManifest()
    .units
    .filter((unit) => !unit.isOptional)
    .map((unit) => unit.id),
});

export const getSelectedExportStats = (
  exportSelection = null,
  manifest = getExportSelectionManifest()
) => {
  const selectedIds = getSelectedUnitIdsForManifest(exportSelection, manifest);
  const selectedClassCount = manifest.units.reduce(
    (total, unit) =>
      selectedIds.has(unit.id)
        ? total + (unit.classNames.length || unit.itemCount || 0)
        : total,
    0
  );

  return {
    selectedClassCount,
    totalClassCount: manifest.totalClassCount,
    percentage:
      manifest.totalClassCount > 0
        ? Math.round((selectedClassCount / manifest.totalClassCount) * 100)
        : 0,
  };
};

export const getSelectedClassNames = (exportSelection = null) => {
  const manifest =
    exportSelection?.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE
      ? getFrameworkDynamicExportSelectionManifest(exportSelection.__manifestData)
      : getExportSelectionManifest();
  const selectedIds = getSelectedUnitIdsForManifest(exportSelection, manifest);

  return new Set(
    manifest.units.flatMap((unit) =>
      selectedIds.has(unit.id) ? unit.classNames : []
    )
  );
};

const getSelectedFrameworkVariableNames = (exportSelection = null) => {
  if (exportSelection?.mode !== FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE) {
    return new Set();
  }

  const manifest = getFrameworkDynamicExportSelectionManifest(
    exportSelection.__manifestData
  );
  const selectedIds = getSelectedUnitIdsForManifest(exportSelection, manifest);
  return new Set(
    manifest.units.flatMap((unit) =>
      selectedIds.has(unit.id) ? unit.variableNames || [] : []
    )
  );
};

export const isAllExportSelected = (exportSelection = null) => {
  if (!exportSelection) {
    return true;
  }

  if (
    exportSelection.mode === DYNAMIC_EXPORT_SELECTION_MODE ||
    exportSelection.mode === FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE
  ) {
    return (
      !Array.isArray(exportSelection.selectedUnitIds) &&
      (exportSelection.deselectedUnitIds || []).length === 0
    );
  }

  return (
    exportSelection.selectedUnitIds?.length ===
    getExportSelectionManifest().units.length
  );
};

const findMatchingBraceIndex = (content, openBraceIndex) => {
  let depth = 0;
  for (let index = openBraceIndex; index < content.length; index += 1) {
    if (content[index] === '{') {
      depth += 1;
    } else if (content[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};

const splitSelectors = (selectorText) =>
  selectorText.split(',').map((selector) => selector.trim()).filter(Boolean);

const classNameFromSelector = (selector) => {
  const match = selector.match(/^\.(-?[A-Za-z0-9][A-Za-z0-9_-]*)$/);
  return match?.[1] || null;
};

const collectVariableReferences = (value) =>
  [...String(value || '').matchAll(/var\(--([a-zA-Z0-9_-]+)\)/g)].map(
    (match) => match[1]
  );

const renderRule = (selectorText, body, keptSelectors) => {
  const originalSelectors = splitSelectors(selectorText);
  if (keptSelectors.length === originalSelectors.length) {
    return `${selectorText} {${body}}`;
  }

  const trimmedBody = body.trim();
  if (!body.includes('\n')) {
    return `${keptSelectors.join(', ')} { ${trimmedBody} }`;
  }

  return `${keptSelectors.join(',\n')} {\n${trimmedBody}\n}`;
};

const filterCssRules = (cssContent, selectedClassNames) => {
  const output = [];
  const requiredVariables = new Set();
  let pendingComments = [];
  let cursor = 0;
  let keptRuleCount = 0;

  const flushPending = () => {
    if (pendingComments.length > 0) {
      if (output.length > 0) {
        output.push('');
      }
      output.push(...pendingComments);
      pendingComments = [];
    }
  };

  while (cursor < cssContent.length) {
    while (cursor < cssContent.length && /\s/.test(cssContent[cursor])) {
      cursor += 1;
    }
    if (cursor >= cssContent.length) {
      break;
    }

    if (cssContent.startsWith('/*', cursor)) {
      const endIndex = cssContent.indexOf('*/', cursor);
      if (endIndex === -1) {
        break;
      }
      pendingComments.push(cssContent.slice(cursor, endIndex + 2).trim());
      cursor = endIndex + 2;
      continue;
    }

    const openBraceIndex = cssContent.indexOf('{', cursor);
    if (openBraceIndex === -1) {
      break;
    }

    const selectorText = cssContent.slice(cursor, openBraceIndex).trim();
    const closeBraceIndex = findMatchingBraceIndex(cssContent, openBraceIndex);
    if (closeBraceIndex === -1) {
      break;
    }

    const body = cssContent.slice(openBraceIndex + 1, closeBraceIndex);
    cursor = closeBraceIndex + 1;

    if (selectorText.startsWith('@media')) {
      const filtered = filterCssRules(body, selectedClassNames);
      if (filtered.keptRuleCount > 0) {
        flushPending();
        output.push(`${selectorText} {\n${filtered.css}\n}`);
        filtered.requiredVariables.forEach((variableName) =>
          requiredVariables.add(variableName)
        );
        keptRuleCount += filtered.keptRuleCount;
      }
      continue;
    }

    const keptSelectors = splitSelectors(selectorText).filter((selector) => {
      const className = classNameFromSelector(selector);
      return className && selectedClassNames.has(className);
    });

    if (keptSelectors.length === 0) {
      continue;
    }

    flushPending();
    output.push(renderRule(selectorText, body, keptSelectors));
    collectVariableReferences(body).forEach((variableName) =>
      requiredVariables.add(variableName)
    );
    keptRuleCount += keptSelectors.length;
  }

  return {
    css: output.join('\n'),
    requiredVariables,
    keptRuleCount,
  };
};

const parseRootDeclarations = (rootBody) =>
  [...rootBody.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)].map(
    (match) => ({
      name: match[1].replace(/^--/, ''),
      value: match[2].trim(),
      line: `  ${match[1]}: ${match[2].trim()};`,
    })
  );

const expandVariableDependencies = (declarations, requiredVariables) => {
  let changed = true;
  while (changed) {
    changed = false;
    declarations.forEach((declaration) => {
      if (!requiredVariables.has(declaration.name)) {
        return;
      }

      collectVariableReferences(declaration.value).forEach((variableName) => {
        if (!requiredVariables.has(variableName)) {
          requiredVariables.add(variableName);
          changed = true;
        }
      });
    });
  }
};

export const filterFrameworkCssBySelection = (cssContent, exportSelection) => {
  if (!exportSelection || isAllExportSelected(exportSelection)) {
    return cssContent;
  }

  const selectedClassNames = getSelectedClassNames(exportSelection);
  const rootMatch = cssContent.match(/:root\s*\{([\s\S]*?)\}\s*/);
  if (!rootMatch) {
    return cssContent;
  }

  const beforeRoot = cssContent.slice(0, rootMatch.index).trimEnd();
  const afterRoot = cssContent.slice(rootMatch.index + rootMatch[0].length);
  const filteredRules = filterCssRules(afterRoot, selectedClassNames);
  getSelectedFrameworkVariableNames(exportSelection).forEach((variableName) => {
    filteredRules.requiredVariables.add(variableName.replace(/^--/, ''));
  });
  const rootDeclarations = parseRootDeclarations(rootMatch[1]);
  expandVariableDependencies(rootDeclarations, filteredRules.requiredVariables);

  const rootLines = [
    ':root {',
    ...rootDeclarations
      .filter((declaration) =>
        filteredRules.requiredVariables.has(declaration.name)
      )
      .map((declaration) => declaration.line),
    '}',
  ];

  return [beforeRoot, rootLines.join('\n'), filteredRules.css]
    .filter((part) => part.trim())
    .join('\n\n')
    .trimEnd() + '\n';
};
