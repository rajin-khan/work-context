import fs from 'node:fs';
import path from 'node:path';
import { createLogger, createServer } from 'vite';

const rootDir = process.cwd();
const referenceCssPath = path.join(
  rootDir,
  'src',
  'framework',
  'reference',
  'skelementor-utilities.css'
);

const assertCondition = (label, condition, details = '') => {
  if (!condition) {
    console.error(`${label} failed${details ? `: ${details}` : ''}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${label} passed`);
};

const decodeBase64 = (value) => Buffer.from(value, 'base64').toString('utf8');

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
    { buildSkelementorPresetWorkspace },
    { generateAndFormatCSS },
    {
      buildAllExportSelection,
      buildDynamicExportSelection,
      buildDefaultExportSelection,
      FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE,
      getExportSelectionManifest,
      getFrameworkDynamicExportSelectionManifest,
      getSelectedExportStats,
    },
    { buildSkelePackageV2 },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/presets/skelementorPreset.jsx'),
    vite.ssrLoadModule('/src/utils/cssGenerator.js'),
    vite.ssrLoadModule('/src/utils/exportSelection.js'),
    vite.ssrLoadModule('/src/utils/canonicalArtifacts.js'),
  ]);

  const manifest = getExportSelectionManifest();
  const uniqueClasses = new Set(
    manifest.units.flatMap((unit) => unit.classNames)
  );
  const defaultSelection = buildDefaultExportSelection();
  const defaultStats = getSelectedExportStats(defaultSelection);
  const referenceCss = fs.readFileSync(referenceCssPath, 'utf8');
  const workspace = buildSkelementorPresetWorkspace();
  const responsiveBreakpointCounts = Object.fromEntries(
    Object.entries(workspace.layoutSelectorGroupsByBreakpoint || {}).map(
      ([key, groups]) => [
        key,
        (groups || []).reduce(
          (count, group) => count + (group.rules || []).length,
          0
        ),
      ]
    )
  );
  const baseExportData = {
    ...workspace,
    colors: (workspace.colorGroups || []).flatMap((group) => group.colors || []),
  };
  const frameworkDynamicManifest =
    getFrameworkDynamicExportSelectionManifest(baseExportData);
  const frameworkDynamicClasses = new Set(
    frameworkDynamicManifest.units.flatMap((unit) => unit.classNames)
  );

  assertCondition(
    'Manifest class inventory',
    manifest.totalClassCount === 1252 && uniqueClasses.size === 1252,
    `${manifest.totalClassCount} total, ${uniqueClasses.size} unique`
  );
  assertCondition(
    'Preset dynamic families match sidebar',
    JSON.stringify(frameworkDynamicManifest.families) ===
      JSON.stringify([
        'Colors',
        'Typography',
        'Spacing',
        'Layouts',
        'Design',
        'Components',
      ]),
    JSON.stringify(frameworkDynamicManifest.families)
  );
  assertCondition(
    'Preset dynamic manifest hides scale and generator rows',
    frameworkDynamicManifest.units.every(
      (unit) =>
        !unit.kind.includes('generator') && !unit.kind.includes('scale')
    )
  );
  assertCondition(
    'Preset dynamic manifest exposes selector and variable rows',
    frameworkDynamicManifest.units.some((unit) =>
      unit.kind.includes('selector-group')
    ) &&
      frameworkDynamicManifest.units.some((unit) =>
        unit.kind.includes('variable-group')
      )
  );
  assertCondition(
    'Preset dynamic manifest maps all classes',
    frameworkDynamicManifest.totalClassCount === 1252 &&
      frameworkDynamicClasses.size === 1252,
    `${frameworkDynamicManifest.totalClassCount} total, ${frameworkDynamicClasses.size} unique`
  );
  assertCondition(
    'Responsive classes are folded into base families',
    !manifest.families.includes('Responsive') &&
      manifest.units.every((unit) => unit.family !== 'Responsive')
  );
  assertCondition(
    'Preset breakpoint data matches Skelementor CSS',
    ['widescreen', 'laptop', 'tablet_extra', 'tablet', 'mobile_extra', 'mobile']
      .every((key) => responsiveBreakpointCounts[key] === 69),
    JSON.stringify(responsiveBreakpointCounts)
  );
  assertCondition(
    'Default coverage',
    defaultStats.percentage >= 65 && defaultStats.percentage <= 75,
    `${defaultStats.percentage}%`
  );

  const allCss = await generateAndFormatCSS({
    ...baseExportData,
    exportSelection: buildAllExportSelection(),
  });
  assertCondition('Select all parity', allCss === referenceCss);
  const frameworkDynamicAllCss = await generateAndFormatCSS({
    ...baseExportData,
    exportSelection: buildDynamicExportSelection(frameworkDynamicManifest),
  });
  assertCondition(
    'Framework dynamic select all parity',
    frameworkDynamicAllCss === referenceCss
  );
  const frameworkDynamicEmptyCss = await generateAndFormatCSS({
    ...baseExportData,
    exportSelection: {
      version: frameworkDynamicManifest.version,
      mode: FRAMEWORK_DYNAMIC_EXPORT_SELECTION_MODE,
      selectedUnitIds: [],
    },
  });
  assertCondition(
    'Framework dynamic empty selection removes generated CSS',
    frameworkDynamicEmptyCss === ''
  );

  const defaultCss = await generateAndFormatCSS({
    ...baseExportData,
    exportSelection: defaultSelection,
  });
  assertCondition('Default export is filtered', defaultCss !== referenceCss);
  assertCondition('Default keeps typography', defaultCss.includes('.text-2xs'));
  assertCondition('Default keeps responsive structural utilities', defaultCss.includes('.hidden--on-s'));
  assertCondition('Default keeps base colors', defaultCss.includes('.text-white'));
  assertCondition('Default removes negative margin', !defaultCss.includes('.-m-1'));
  assertCondition('Default removes semantic colors', !defaultCss.includes('.text-primary'));
  assertCondition('Default removes shadows', !defaultCss.includes('.shadow-sm'));
  assertCondition('Default removes filters', !defaultCss.includes('.brightness-75'));

  const emptyCss = await generateAndFormatCSS({
    ...baseExportData,
    exportSelection: {
      version: manifest.version,
      selectedUnitIds: [],
    },
  });
  assertCondition('Empty selection removes generated CSS', emptyCss === '');

  const legacyFixture = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, 'scripts', 'export-audit', 'fixtures', 'legacy.json'),
      'utf8'
    )
  );
  const selectFamily = (family) => ({
    version: manifest.version,
    selectedUnitIds: manifest.units
      .filter((unit) => unit.family === family)
      .map((unit) => unit.id),
  });
  const typographyOnlyCss = await generateAndFormatCSS({
    ...legacyFixture,
    exportSelection: selectFamily('Typography'),
  });
  assertCondition(
    'Typography-only generic export removes other variables',
    typographyOnlyCss.includes('.audit-text') &&
      !typographyOnlyCss.includes('--space') &&
      !typographyOnlyCss.includes('brand-primary') &&
      !typographyOnlyCss.includes('.audit-pad')
  );
  const spacingOnlyCss = await generateAndFormatCSS({
    ...legacyFixture,
    exportSelection: selectFamily('Spacing'),
  });
  assertCondition(
    'Spacing-only generic export removes other variables',
    spacingOnlyCss.includes('.audit-pad') &&
      spacingOnlyCss.includes('--space') &&
      !spacingOnlyCss.includes('.audit-text') &&
      !spacingOnlyCss.includes('brand-primary')
  );

  const packagePayload = buildSkelePackageV2(defaultCss, 'Filtered Export');
  assertCondition(
    'Filtered package payload',
    decodeBase64(packagePayload.payload.css) === defaultCss
  );
} finally {
  await vite.close();
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Export selection checks passed.');
