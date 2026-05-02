import { createLogger, createServer } from 'vite';

const rootDir = process.cwd();

const assertCondition = (label, condition, details = '') => {
  if (!condition) {
    console.error(`${label} failed${details ? `: ${details}` : ''}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${label} passed`);
};

const logger = createLogger('error');
const originalLoggerError = logger.error;
logger.error = (message, options) => {
  if (String(message || '').startsWith('WebSocket server error:')) {
    return;
  }

  originalLoggerError(message, options);
};

const vite = await createServer({
  root: rootDir,
  logLevel: 'error',
  customLogger: logger,
  appType: 'custom',
  listen: false,
  server: {
    hmr: false,
    middlewareMode: true,
  },
});

try {
  const [
    { generateAndFormatCSS },
    {
      DYNAMIC_EXPORT_SELECTION_MODE,
      buildDynamicExportSelection,
      buildEmptyDynamicExportSelection,
      getDynamicExportSelectionManifest,
    },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/utils/cssGenerator.js'),
    vite.ssrLoadModule('/src/utils/exportSelection.js'),
  ]);

  const workspace = {
    workspaceSource: 'custom',
    colorGroups: [
      {
        id: 'color-brand',
        name: 'Brand Colors',
        colors: [
          {
            id: 'blue',
            name: '--brand-blue',
            value: '#2563eb',
            format: 'HEX',
            shadesConfig: { enabled: false, palette: [] },
            tintsConfig: { enabled: false, palette: [] },
            transparentConfig: { enabled: false },
            shadowConfig: { enabled: false },
            utilityConfig: {
              text: true,
              background: true,
              border: false,
              fill: false,
            },
          },
        ],
      },
      {
        id: 'color-muted',
        name: 'Muted Colors',
        colors: [
          {
            id: 'muted',
            name: '--muted',
            value: '#6b7280',
            format: 'HEX',
            shadesConfig: { enabled: false, palette: [] },
            tintsConfig: { enabled: false, palette: [] },
            transparentConfig: { enabled: false },
            shadowConfig: { enabled: false },
            utilityConfig: {
              text: true,
              background: false,
              border: false,
              fill: false,
            },
          },
        ],
      },
    ],
    colors: [],
    isSpacingEnabled: true,
    spacingGroups: [
      {
        id: 'space-base',
        name: 'Base Space',
        settings: {
          namingConvention: 'space',
          minSize: 16,
          maxSize: 24,
          minScaleRatio: 1.2,
          maxScaleRatio: 1.25,
          baseScaleIndex: 'm',
          negativeSteps: 1,
          positiveSteps: 1,
        },
      },
    ],
    spacingScale: [],
    generatorConfig: [
      {
        id: 'pad-generator',
        className: '.pad-*',
        properties: ['padding'],
        enabled: true,
        scaleGroupId: 'space-base',
      },
    ],
    selectorGroups: [
      {
        id: 'space-selectors',
        name: 'Spacing Selectors',
        rules: [
          {
            id: 'stack-rule',
            selector: '.stack',
            properties: [{ id: 'gap', property: 'gap', value: 'var(--space-m)' }],
          },
        ],
      },
    ],
    variableGroups: [],
    isTypographyEnabled: true,
    typographyGroups: [
      {
        id: 'type-base',
        name: 'Base Type',
        settings: {
          namingConvention: 'text',
          minSize: 16,
          maxSize: 22,
          minScaleRatio: 1.2,
          maxScaleRatio: 1.25,
          baseScaleIndex: 'm',
          negativeSteps: 1,
          positiveSteps: 1,
        },
      },
    ],
    typographyScale: [],
    typographyGeneratorConfig: [
      {
        id: 'type-generator',
        className: '.type-*',
        properties: ['font-size'],
        enabled: true,
        scaleGroupId: 'type-base',
      },
    ],
    typographySelectorGroups: [],
    typographyVariableGroups: [
      {
        id: 'type-vars',
        name: 'Type Vars',
        variables: [
          {
            id: 'font',
            name: '--font-body',
            value: 'Inter',
            mode: 'single',
          },
        ],
      },
    ],
    layoutSelectorGroups: [
      {
        id: 'layout-selectors',
        name: 'Layout Selectors',
        rules: [
          {
            id: 'shell-rule',
            selector: '.shell',
            properties: [
              { id: 'max', property: 'max-width', value: 'var(--layout-max)' },
            ],
          },
        ],
      },
    ],
    layoutVariableGroups: [
      {
        id: 'layout-vars',
        name: 'Layout Vars',
        variables: [
          {
            id: 'max',
            name: '--layout-max',
            value: '72rem',
            mode: 'single',
          },
        ],
      },
    ],
    designSelectorGroups: [],
    designVariableGroups: [],
    components: [
      {
        id: 'button-component',
        type: 'button',
        name: 'button',
        styles: [
          { id: 'display', prop: 'display', value: 'inline-flex' },
          { id: 'color', prop: 'color', value: 'var(--brand-blue)' },
        ],
        states: {
          hover: [{ id: 'opacity', prop: 'opacity', value: '0.9' }],
        },
        modifiers: [],
      },
    ],
    selectorGroupsByBreakpoint: {
      mobile: [
        {
          id: 'space-selectors',
          name: 'Spacing Selectors',
          rules: [
            {
              id: 'stack-mobile',
              selector: '.stack',
              properties: [{ id: 'gap', property: 'gap', value: 'var(--space-s)' }],
            },
          ],
        },
      ],
    },
    variableGroupsByBreakpoint: {},
    typographySelectorGroupsByBreakpoint: {},
    typographyVariableGroupsByBreakpoint: {},
    layoutSelectorGroupsByBreakpoint: {},
    layoutVariableGroupsByBreakpoint: {},
    designSelectorGroupsByBreakpoint: {},
    designVariableGroupsByBreakpoint: {},
    breakpointPresets: [
      {
        id: 'mobile',
        label: 'Mobile',
        isActive: true,
        queryType: 'max',
        maxWidth: 767,
      },
    ],
    customCSS: '.handwritten { color: hotpink; }',
  };
  workspace.colors = workspace.colorGroups.flatMap((group) => group.colors);

  const manifest = getDynamicExportSelectionManifest(workspace);
  const renamedManifest = getDynamicExportSelectionManifest({
    ...workspace,
    colorGroups: [
      {
        ...workspace.colorGroups[0],
        name: 'Renamed Brand Colors',
      },
      workspace.colorGroups[1],
    ],
  });

  assertCondition(
    'Dynamic manifest families',
    ['Colors', 'Typography', 'Spacing', 'Layouts', 'Components'].every((family) =>
      manifest.families.includes(family)
    )
  );
  assertCondition(
    'Dynamic manifest hides scale and generator rows',
    manifest.units.every(
      (unit) =>
        !unit.kind.includes('generator') && !unit.kind.includes('scale')
    )
  );
  assertCondition(
    'Dynamic manifest exposes selector and variable rows',
    manifest.units.some((unit) => unit.kind === 'spacing-selector-group') &&
      manifest.units.some((unit) => unit.kind === 'layout-selector-group') &&
      manifest.units.some((unit) => unit.kind === 'typography-variable-group')
  );
  assertCondition(
    'Dynamic manifest has stable IDs after rename',
    manifest.units.find((unit) => unit.sourceId === 'color-brand').id ===
      renamedManifest.units.find((unit) => unit.sourceId === 'color-brand').id &&
      renamedManifest.units.find((unit) => unit.sourceId === 'color-brand').label ===
        'Renamed Brand Colors'
  );

  const fullCss = await generateAndFormatCSS({
    ...workspace,
    exportSelection: buildDynamicExportSelection(manifest),
  });
  assertCondition('Dynamic select all keeps color utilities', fullCss.includes('.text-brand-blue'));
  assertCondition('Dynamic select all keeps spacing generator', fullCss.includes('.pad-m'));
  assertCondition('Dynamic select all keeps responsive selectors', fullCss.includes('@media (max-width: 767px)'));
  assertCondition('Dynamic select all keeps components', fullCss.includes('.button:hover'));
  assertCondition('Dynamic select all keeps custom CSS', fullCss.includes('.handwritten'));

  const selectOnly = (predicate) => ({
    version: manifest.version,
    mode: DYNAMIC_EXPORT_SELECTION_MODE,
    selectedUnitIds: manifest.units.filter(predicate).map((unit) => unit.id),
  });

  const noColorsCss = await generateAndFormatCSS({
    ...workspace,
    exportSelection: selectOnly((unit) => unit.family !== 'Colors'),
  });
  assertCondition('Deselecting color group removes utilities', !noColorsCss.includes('.text-muted'));
  assertCondition(
    'Required color variables remain for selected components',
    noColorsCss.includes('--brand-blue') && noColorsCss.includes('.button')
  );

  const spacingOnlyCss = await generateAndFormatCSS({
    ...workspace,
    exportSelection: selectOnly((unit) => unit.family === 'Spacing'),
  });
  assertCondition('Spacing-only keeps spacing output', spacingOnlyCss.includes('.pad-m'));
  assertCondition('Spacing-only removes typography output', !spacingOnlyCss.includes('.type-m'));
  assertCondition('Spacing-only keeps raw stylesheet', spacingOnlyCss.includes('.handwritten'));

  const emptyCss = await generateAndFormatCSS({
    ...workspace,
    exportSelection: buildEmptyDynamicExportSelection(),
  });
  assertCondition('Dynamic clear generated keeps raw stylesheet only', emptyCss.trim() === workspace.customCSS);
} finally {
  await vite.close();
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Dynamic export selection checks passed.');
