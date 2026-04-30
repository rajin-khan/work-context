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

const findFirstDifference = (left, right) => {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) {
      return index;
    }
  }

  return -1;
};

const printDifference = (generated, reference) => {
  const index = findFirstDifference(generated, reference);
  if (index === -1) {
    return;
  }

  const start = Math.max(0, index - 120);
  const end = index + 120;
  console.error(`First export mismatch at byte ${index}.`);
  console.error('Generated excerpt:');
  console.error(JSON.stringify(generated.slice(start, end)));
  console.error('Reference excerpt:');
  console.error(JSON.stringify(reference.slice(start, end)));
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
    { buildSkelementorPresetWorkspace },
    { generateAndFormatCSS },
    { buildAllExportSelection },
  ] =
    await Promise.all([
      vite.ssrLoadModule('/src/presets/skelementorPreset.jsx'),
      vite.ssrLoadModule('/src/utils/cssGenerator.js'),
      vite.ssrLoadModule('/src/utils/exportSelection.js'),
    ]);

  const referenceCss = fs.readFileSync(referenceCssPath, 'utf8');
  const workspace = buildSkelementorPresetWorkspace();
  const generatedCss = await generateAndFormatCSS({
    ...workspace,
    exportSelection: buildAllExportSelection(),
    colors: (workspace.colorGroups || []).flatMap((group) => group.colors || []),
  });

  if (generatedCss !== referenceCss) {
    printDifference(generatedCss, referenceCss);
    process.exitCode = 1;
  } else {
    console.log('Framework export matches reference CSS byte-for-byte.');
  }
} finally {
  await vite.close();
}
