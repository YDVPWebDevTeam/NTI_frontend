#!/usr/bin/env node

import { readdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

import { rootDir } from './shared.mjs';

const apiDir = join(rootDir, 'src/lib/api');

function collectExports(currentDir) {
  const entries = readdirSync(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolvedPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectExports(resolvedPath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name === 'index.ts') {
      continue;
    }

    files.push(resolvedPath);
  }

  return files;
}

const exports = collectExports(apiDir)
  .map((filePath) => relative(apiDir, filePath).replace(/\\/g, '/').replace(/\.ts$/, ''))
  .sort()
  .map((modulePath) => `export * from './${modulePath}';`);

const content = `// This file is auto-generated. Do not edit manually.\n${exports.join('\n')}\n`;

writeFileSync(join(apiDir, 'index.ts'), content);

console.log(`✅ Generated src/lib/api/index.ts with ${exports.length} exports`);
