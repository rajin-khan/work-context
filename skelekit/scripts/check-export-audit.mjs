import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const fixturesDir = path.join(rootDir, 'scripts', 'export-audit', 'fixtures');
const referenceDir = path.join(rootDir, 'src', 'framework', 'reference');
const baselineCommit = '4a6b2bd';
const gitPrefix = execFileSync('git', ['rev-parse', '--show-prefix'], {
  cwd: rootDir,
  encoding: 'utf8',
}).trim();
const runtimeDir = fs.mkdtempSync(
  path.join(rootDir, '.export-audit-runtime-')
);

const referenceCss = fs.readFileSync(
  path.join(referenceDir, 'skelementor-utilities.css'),
  'utf8'
);
const referencePackage = JSON.parse(
  fs.readFileSync(path.join(referenceDir, 'skelementor-utilities.skele'), 'utf8')
);
const referenceClasses = JSON.parse(
  fs.readFileSync(path.join(referenceDir, 'global-classes.json'), 'utf8')
);
const referenceVariables = JSON.parse(
  fs.readFileSync(path.join(referenceDir, 'global-variables.json'), 'utf8')
);

if (typeof globalThis.btoa !== 'function') {
  globalThis.btoa = (value) => Buffer.from(value, 'binary').toString('base64');
}

const readSource = (relativePath, commit = null) => {
  if (commit) {
    return execFileSync(
      'git',
      ['show', `${commit}:${gitPrefix}${relativePath}`],
      {
        cwd: rootDir,
        encoding: 'utf8',
      }
    );
  }

  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
};

const writeRuntimeFile = (relativePath, content) => {
  const targetPath = path.join(runtimeDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
  return targetPath;
};

const copyRuntimeFile = (fromRelativePath, toRelativePath = fromRelativePath) => {
  const sourcePath = path.join(rootDir, fromRelativePath);
  const targetPath = path.join(runtimeDir, toRelativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  return targetPath;
};

const patchGeneratorImports = (source) =>
  source
    .replace("from './spacingCalculator';", "from './spacingCalculator.js';")
    .replace("from './breakpoints';", "from './breakpoints.js';")
    .replace(
      "from '../presets/skelementorFrameworkConstants';",
      "from '../presets/skelementorFrameworkConstants.js';"
    )
    .replace('console.error("Error formatting CSS:", error);', '');

const patchCanonicalImports = (source) =>
  source.replace(
    "import referenceClassSnapshot from '../framework/reference/global-classes.json';\nimport referenceVariableSnapshot from '../framework/reference/global-variables.json';",
    [
      "import fs from 'node:fs';",
      "const referenceClassSnapshot = JSON.parse(",
      "  fs.readFileSync(new URL('../framework/reference/global-classes.json', import.meta.url), 'utf8')",
      ');',
      "const referenceVariableSnapshot = JSON.parse(",
      "  fs.readFileSync(new URL('../framework/reference/global-variables.json', import.meta.url), 'utf8')",
      ');',
    ].join('\n')
  );

const patchSkelementorBuilderImports = (source) =>
  source
    .replace(
      "import skelementorUtilitiesCss from '../framework/reference/skelementor-utilities.css?raw';",
      [
        "import fs from 'node:fs';",
        "const skelementorUtilitiesCss = fs.readFileSync(",
        "  new URL('../framework/reference/skelementor-utilities.css', import.meta.url),",
        "  'utf8'",
        ');',
      ].join('\n')
    )
    .replace("from '../utils/breakpoints';", "from '../utils/breakpoints.js';")
    .replace(
      "from '../utils/canonicalArtifacts';",
      "from '../utils/canonicalArtifacts.js';"
    )
    .replace(
      "from './skelementorFrameworkConstants';",
      "from './skelementorFrameworkConstants.js';"
    );

const normalizeCss = (value) => String(value || '').replace(/\r\n/g, '\n').trim();

const decodeBase64 = (value) => Buffer.from(value, 'base64').toString('utf8');

const loadJsonFixture = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(fixturesDir, fileName), 'utf8'));

const createFixtureHydrator = (generateSpacingScale) => {
  const defaultData = {
    colors: [],
    spacingScale: [],
    spacingGroups: [],
    isTypographyEnabled: false,
    typographyScale: [],
    typographyGroups: [],
    typographyGeneratorConfig: [],
    typographySelectorGroups: [],
    typographySelectorGroupsByBreakpoint: {},
    typographyVariableGroups: [],
    typographyVariableGroupsByBreakpoint: {},
    generatorConfig: [],
    selectorGroups: [],
    selectorGroupsByBreakpoint: {},
    variableGroups: [],
    variableGroupsByBreakpoint: {},
    isSpacingEnabled: false,
    customCSS: '/* Your custom styles go here */',
    layoutSelectorGroups: [],
    layoutSelectorGroupsByBreakpoint: {},
    layoutVariableGroups: [],
    layoutVariableGroupsByBreakpoint: {},
    designSelectorGroups: [],
    designSelectorGroupsByBreakpoint: {},
    designVariableGroups: [],
    designVariableGroupsByBreakpoint: {},
    breakpointPresets: [],
  };

  return (fixture) => ({
    ...defaultData,
    ...fixture,
    spacingScale:
      fixture.spacingScale ||
      (fixture.spacingGroups || []).flatMap((group) =>
        generateSpacingScale(group.settings)
      ),
    typographyScale:
      fixture.typographyScale ||
      (fixture.typographyGroups || []).flatMap((group) =>
        generateSpacingScale(group.settings)
      ),
  });
};

const buildExportDataFromWorkspace = (workspace) => ({
  colors: (workspace.colorGroups || []).flatMap((group) => group.colors || []),
  spacingScale: [],
  spacingGroups: workspace.spacingGroups || [],
  isTypographyEnabled: workspace.isTypographyEnabled || false,
  typographyScale: [],
  typographyGroups: workspace.typographyGroups || [],
  typographyGeneratorConfig: workspace.typographyGeneratorConfig || [],
  typographySelectorGroups: workspace.typographySelectorGroups || [],
  typographySelectorGroupsByBreakpoint:
    workspace.typographySelectorGroupsByBreakpoint || {},
  typographyVariableGroups: workspace.typographyVariableGroups || [],
  typographyVariableGroupsByBreakpoint:
    workspace.typographyVariableGroupsByBreakpoint || {},
  generatorConfig: workspace.generatorConfig || [],
  selectorGroups: workspace.selectorGroups || [],
  selectorGroupsByBreakpoint: workspace.selectorGroupsByBreakpoint || {},
  variableGroups: workspace.variableGroups || [],
  variableGroupsByBreakpoint: workspace.variableGroupsByBreakpoint || {},
  isSpacingEnabled: workspace.isSpacingEnabled || false,
  customCSS: workspace.customCSS || '/* Your custom styles go here */',
  layoutSelectorGroups: workspace.layoutSelectorGroups || [],
  layoutSelectorGroupsByBreakpoint: workspace.layoutSelectorGroupsByBreakpoint || {},
  layoutVariableGroups: workspace.layoutVariableGroups || [],
  layoutVariableGroupsByBreakpoint: workspace.layoutVariableGroupsByBreakpoint || {},
  designSelectorGroups: workspace.designSelectorGroups || [],
  designSelectorGroupsByBreakpoint: workspace.designSelectorGroupsByBreakpoint || {},
  designVariableGroups: workspace.designVariableGroups || [],
  designVariableGroupsByBreakpoint: workspace.designVariableGroupsByBreakpoint || {},
  breakpointPresets: workspace.breakpointPresets || [],
});

const stageCurrentRuntime = () => {
  writeRuntimeFile(
    'current/src/utils/cssGenerator.js',
    patchGeneratorImports(readSource('src/utils/cssGenerator.js'))
  );
  writeRuntimeFile(
    'current/src/utils/spacingCalculator.js',
    readSource('src/utils/spacingCalculator.js')
  );
  writeRuntimeFile(
    'current/src/utils/breakpoints.js',
    readSource('src/utils/breakpoints.js')
  );
  writeRuntimeFile(
    'current/src/utils/canonicalArtifacts.js',
    patchCanonicalImports(readSource('src/utils/canonicalArtifacts.js'))
  );
  writeRuntimeFile(
    'current/src/presets/skelementorWorkspaceBuilder.js',
    patchSkelementorBuilderImports(
      readSource('src/presets/skelementorWorkspaceBuilder.js')
    )
  );
  writeRuntimeFile(
    'current/src/presets/skelementorFrameworkConstants.js',
    readSource('src/presets/skelementorFrameworkConstants.js')
  );
  copyRuntimeFile(
    'src/framework/reference/global-classes.json',
    'current/src/framework/reference/global-classes.json'
  );
  copyRuntimeFile(
    'src/framework/reference/skelementor-utilities.css',
    'current/src/framework/reference/skelementor-utilities.css'
  );
  copyRuntimeFile(
    'src/framework/reference/global-variables.json',
    'current/src/framework/reference/global-variables.json'
  );

  return {
    cssGeneratorPath: path.join(runtimeDir, 'current/src/utils/cssGenerator.js'),
    spacingCalculatorPath: path.join(
      runtimeDir,
      'current/src/utils/spacingCalculator.js'
    ),
    breakpointsPath: path.join(runtimeDir, 'current/src/utils/breakpoints.js'),
    skelementorBuilderPath: path.join(
      runtimeDir,
      'current/src/presets/skelementorWorkspaceBuilder.js'
    ),
    canonicalArtifactsPath: path.join(
      runtimeDir,
      'current/src/utils/canonicalArtifacts.js'
    ),
  };
};

const stageBaselineRuntime = () => {
  writeRuntimeFile(
    'baseline/src/utils/cssGenerator.js',
    patchGeneratorImports(
      readSource('src/utils/cssGenerator.js', baselineCommit)
    )
  );
  writeRuntimeFile(
    'baseline/src/utils/spacingCalculator.js',
    readSource('src/utils/spacingCalculator.js', baselineCommit)
  );

  return {
    cssGeneratorPath: path.join(
      runtimeDir,
      'baseline/src/utils/cssGenerator.js'
    ),
  };
};

const importModule = async (modulePath) =>
  import(`${pathToFileURL(modulePath).href}?t=${Date.now()}-${Math.random()}`);

const assertPackageMatchesCss = (
  label,
  css,
  canonicalArtifacts
) => {
  const {
    buildSkelePackageV2,
    extractClassNamesFromCss,
    extractRootVariablesFromCss,
  } = canonicalArtifacts;

  const packagePayload = buildSkelePackageV2(css, `${label} Audit`);
  assert.equal(packagePayload.format, 'skelementor-package');
  assert.equal(packagePayload.version, '2.0');
  assert.equal(
    decodeBase64(packagePayload.payload.css),
    css,
    `${label}: package payload CSS should match the visible export CSS`
  );

  const snapshotClasses = Object.values(
    packagePayload.canonical_snapshots.classes.items || {}
  )
    .map((item) => item.label)
    .sort();
  const cssClasses = extractClassNamesFromCss(css).sort();

  const snapshotVariables = Object.values(
    packagePayload.canonical_snapshots.variables.items || {}
  )
    .map((item) => item.css_name)
    .sort();
  const cssVariables = Object.keys(extractRootVariablesFromCss(css)).sort();

  assert.deepEqual(
    snapshotClasses,
    cssClasses,
    `${label}: class snapshots should come only from the exported CSS`
  );
  assert.deepEqual(
    snapshotVariables,
    cssVariables,
    `${label}: variable snapshots should come only from the exported CSS`
  );
};

const assertResponsiveOutput = (css) => {
  const normalized = normalizeCss(css);
  const beforeFirstMedia = normalized.split('@media')[0];

  assert.match(
    normalized,
    /@media \(max-width: 1024px\)/,
    'responsive fixture: tablet media query should be exported'
  );
  assert.match(
    normalized,
    /@media \(max-width: 767px\)/,
    'responsive fixture: mobile media query should be exported'
  );
  assert.match(
    normalized,
    /@media \(max-width: 767px\)[\s\S]*:root[\s\S]*--space-stack-gap: var\(--space-s\);/,
    'responsive fixture: mobile root overrides should live inside the mobile media block'
  );
  assert.match(
    normalized,
    /@media \(max-width: 767px\)[\s\S]*\.audit-card\s*\{[\s\S]*padding: var\(--space-s\);/,
    'responsive fixture: mobile selector overrides should live inside the mobile media block'
  );
  assert.match(
    normalized,
    /@media \(max-width: 1024px\)[\s\S]*\.audit-grid\s*\{[\s\S]*grid-template-columns: 1fr;/,
    'responsive fixture: tablet layout selector overrides should live inside the tablet media block'
  );
  assert.ok(
    beforeFirstMedia.includes('--space-stack-gap: var(--space-m);'),
    'responsive fixture: base root variables should remain outside media queries'
  );
  assert.ok(
    !beforeFirstMedia.includes('--space-stack-gap: var(--space-s);'),
    'responsive fixture: mobile-only root overrides should not leak into base CSS'
  );
};

const RESPONSIVE_BREAKPOINT_IDS = [
  'widescreen',
  'laptop',
  'tablet_extra',
  'tablet',
  'mobile_extra',
  'mobile',
];

const RESPONSIVE_SELECTOR_COLLECTION_KEYS = [
  'selectorGroupsByBreakpoint',
  'typographySelectorGroupsByBreakpoint',
  'layoutSelectorGroupsByBreakpoint',
  'designSelectorGroupsByBreakpoint',
];

const normalizeResponsiveInventory = (inventory = {}) =>
  Object.fromEntries(
    RESPONSIVE_BREAKPOINT_IDS.map((breakpointId) => [
      breakpointId,
      inventory[breakpointId] || [],
    ])
  );

const sortResponsiveInventory = (inventory = {}) =>
  Object.fromEntries(
    Object.entries(normalizeResponsiveInventory(inventory)).map(
      ([breakpointId, labels]) => [breakpointId, [...labels].sort()]
    )
  );

const collectResponsiveSnapshotInventory = (
  snapshot,
  matchResponsiveLabel
) =>
  normalizeResponsiveInventory(
    (snapshot.order || []).reduce((accumulator, id) => {
      const item = snapshot.items?.[id];
      const label = item?.label || '';
      const responsiveMeta = matchResponsiveLabel(label);
      if (!responsiveMeta) {
        return accumulator;
      }

      if (!accumulator[responsiveMeta.breakpoint]) {
        accumulator[responsiveMeta.breakpoint] = [];
      }

      accumulator[responsiveMeta.breakpoint].push(label);
      return accumulator;
    }, {})
  );

const collectResponsiveWorkspaceInventory = (
  workspace,
  matchResponsiveLabel
) => {
  const byCollection = Object.fromEntries(
    RESPONSIVE_SELECTOR_COLLECTION_KEYS.map((collectionKey) => {
      const collectionInventory = {};

      Object.entries(workspace[collectionKey] || {}).forEach(
        ([breakpointId, groups]) => {
          const labels = (groups || []).flatMap((group) =>
            (group.rules || [])
              .map((rule) => String(rule.selector || '').replace(/^\./, ''))
              .filter((label) => Boolean(matchResponsiveLabel(label)))
          );

          if (labels.length > 0) {
            collectionInventory[breakpointId] = labels;
          }
        }
      );

      return [collectionKey, normalizeResponsiveInventory(collectionInventory)];
    })
  );

  const byBreakpoint = normalizeResponsiveInventory(
    RESPONSIVE_SELECTOR_COLLECTION_KEYS.reduce((accumulator, collectionKey) => {
      const collectionInventory = byCollection[collectionKey] || {};

      Object.entries(collectionInventory).forEach(([breakpointId, labels]) => {
        if (!accumulator[breakpointId]) {
          accumulator[breakpointId] = [];
        }

        accumulator[breakpointId].push(...labels);
      });

      return accumulator;
    }, {})
  );

  return {
    byCollection,
    byBreakpoint,
  };
};

const assertSkelementorPresetOutput = (workspace, css, canonicalArtifacts) => {
  const expectedResponsiveInventory = collectResponsiveSnapshotInventory(
    referenceClasses,
    canonicalArtifacts.matchResponsiveLabel
  );
  const actualResponsiveInventory = collectResponsiveWorkspaceInventory(
    workspace,
    canonicalArtifacts.matchResponsiveLabel
  );

  assert.deepEqual(
    sortResponsiveInventory(actualResponsiveInventory.byBreakpoint),
    sortResponsiveInventory(expectedResponsiveInventory),
    'skelementor preset: responsive --on-* selector inventory should match the canonical class snapshot inventory'
  );
  assert.deepEqual(
    actualResponsiveInventory.byCollection.selectorGroupsByBreakpoint,
    normalizeResponsiveInventory(),
    'skelementor preset: spacing responsive selector inventory should not contain framework --on-* classes'
  );
  assert.deepEqual(
    actualResponsiveInventory.byCollection.typographySelectorGroupsByBreakpoint,
    normalizeResponsiveInventory(),
    'skelementor preset: typography responsive selector inventory should not contain framework --on-* classes'
  );
  assert.deepEqual(
    actualResponsiveInventory.byCollection.designSelectorGroupsByBreakpoint,
    normalizeResponsiveInventory(),
    'skelementor preset: design responsive selector inventory should not contain framework --on-* classes'
  );
  assert.deepEqual(
    sortResponsiveInventory(
      actualResponsiveInventory.byCollection.layoutSelectorGroupsByBreakpoint
    ),
    sortResponsiveInventory(expectedResponsiveInventory),
    'skelementor preset: layout responsive selector inventory should match the canonical --on-* class inventory'
  );

  assert.equal(
    css,
    referenceCss,
    'skelementor preset: exported CSS should match the canonical framework stylesheet'
  );

  const packagePayload = canonicalArtifacts.buildSkelePackageV2(
    css,
    'Skelementor Preset Audit'
  );

  assert.equal(
    decodeBase64(packagePayload.payload.css),
    referenceCss,
    'skelementor preset: packaged CSS payload should match the canonical framework stylesheet'
  );
  assert.deepEqual(
    packagePayload.canonical_snapshots.classes,
    referenceClasses,
    'skelementor preset: class snapshots should match the canonical framework snapshots'
  );
  assert.deepEqual(
    packagePayload.canonical_snapshots.variables,
    referenceVariables,
    'skelementor preset: variable snapshots should match the canonical framework snapshots'
  );
  assert.deepEqual(
    referencePackage.canonical_snapshots.classes,
    referenceClasses,
    'skelementor preset: reference package class snapshots should stay aligned with reference classes'
  );
  assert.deepEqual(
    referencePackage.canonical_snapshots.variables,
    referenceVariables,
    'skelementor preset: reference package variable snapshots should stay aligned with reference variables'
  );

  const normalized = normalizeCss(css);
  const mediaIndices = [
    normalized.indexOf('@media (min-width: 2400px)'),
    normalized.indexOf('@media (max-width: 1366px)'),
    normalized.indexOf('@media (max-width: 1200px)'),
    normalized.indexOf('@media (max-width: 1024px)'),
    normalized.indexOf('@media (max-width: 880px)'),
    normalized.indexOf('@media (max-width: 767px)'),
  ];

  mediaIndices.forEach((index, order) => {
    assert.notEqual(
      index,
      -1,
      `skelementor preset: expected Elementor media-query block #${order + 1}`
    );
  });
  assert.deepEqual(
    [...mediaIndices].sort((left, right) => left - right),
    mediaIndices,
    'skelementor preset: media-query blocks should stay in canonical Elementor order'
  );
};

const currentRuntime = stageCurrentRuntime();
const baselineRuntime = stageBaselineRuntime();

const [
  currentGeneratorModule,
  currentSpacingModule,
  currentBreakpointsModule,
  currentSkelementorBuilderModule,
  currentCanonicalModule,
  baselineGeneratorModule,
] = await Promise.all([
  importModule(currentRuntime.cssGeneratorPath),
  importModule(currentRuntime.spacingCalculatorPath),
  importModule(currentRuntime.breakpointsPath),
  importModule(currentRuntime.skelementorBuilderPath),
  importModule(currentRuntime.canonicalArtifactsPath),
  importModule(baselineRuntime.cssGeneratorPath),
]);

const hydrateFixture = createFixtureHydrator(
  currentSpacingModule.generateSpacingScale
);

const blankFixture = hydrateFixture(loadJsonFixture('blank.json'));
const legacyFixture = hydrateFixture(loadJsonFixture('legacy.json'));
const responsiveFixture = hydrateFixture(loadJsonFixture('responsive.json'));

const blankCurrentCss = normalizeCss(
  await currentGeneratorModule.generateAndFormatCSS(blankFixture)
);
const blankBaselineCss = normalizeCss(
  await baselineGeneratorModule.generateAndFormatCSS(blankFixture)
);

assert.equal(
  blankCurrentCss,
  blankBaselineCss,
  'blank fixture: current CSS should match the stable baseline output'
);
console.log('Blank CSS matches stable baseline');
assertPackageMatchesCss('blank fixture', blankCurrentCss, currentCanonicalModule);
console.log('Blank package stays dynamic');

const legacyCurrentCss = normalizeCss(
  await currentGeneratorModule.generateAndFormatCSS(legacyFixture)
);
const legacyBaselineCss = normalizeCss(
  await baselineGeneratorModule.generateAndFormatCSS(legacyFixture)
);

assert.equal(
  legacyCurrentCss,
  legacyBaselineCss,
  'legacy fixture: current CSS should match the stable baseline output'
);
console.log('Legacy CSS matches stable baseline');
assertPackageMatchesCss(
  'legacy fixture',
  legacyCurrentCss,
  currentCanonicalModule
);
console.log('Legacy package stays dynamic');

const responsiveCurrentCss = normalizeCss(
  await currentGeneratorModule.generateAndFormatCSS(responsiveFixture)
);
assertResponsiveOutput(responsiveCurrentCss);
console.log('Responsive CSS exports expected media-query overrides');
assertPackageMatchesCss(
  'responsive fixture',
  responsiveCurrentCss,
  currentCanonicalModule
);
console.log('Responsive package stays dynamic');

const skelementorPresetWorkspace =
  currentSkelementorBuilderModule.buildSkelementorPresetWorkspace();
const skelementorPresetFixture = buildExportDataFromWorkspace(
  skelementorPresetWorkspace
);
const skelementorPresetCss = await currentGeneratorModule.generateAndFormatCSS(
  skelementorPresetFixture
);

assertSkelementorPresetOutput(
  skelementorPresetWorkspace,
  skelementorPresetCss,
  currentCanonicalModule
);
console.log('Skelementor preset export matches canonical framework CSS and snapshots');

fs.rmSync(runtimeDir, { recursive: true, force: true });
console.log('Export audit checks passed.');
