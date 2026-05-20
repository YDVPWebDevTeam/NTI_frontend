#!/usr/bin/env node
/* global console */

import { spawnSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

import { normalizedSchemaPath, rootDir } from './shared.mjs';

const outputDir = join(rootDir, 'src/lib/api');
const orvalConfigPath = join(rootDir, 'scripts/api-codegen/orval.config.cjs');

if (!existsSync(normalizedSchemaPath)) {
  throw new Error(`Normalized schema not found at ${normalizedSchemaPath}. Run generate:openapi first.`);
}

rmSync(outputDir, { force: true, recursive: true });

const result = spawnSync('npx', ['orval', '--config', orvalConfigPath], {
  cwd: rootDir,
  stdio: 'inherit',
});

if (result.status !== 0) {
  throw new Error(`Orval generation failed with exit code ${result.status ?? 'unknown'}`);
}

console.log('✅ Generated OpenAPI client with Orval');
