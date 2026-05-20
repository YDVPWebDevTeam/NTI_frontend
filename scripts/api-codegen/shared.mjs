#!/usr/bin/env node

import { mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, '../../');
export const generatedDir = join(rootDir, 'src/lib/api/generated');
export const rawSchemaPath = '/tmp/nti-openapi.json';
export const normalizedSchemaPath = '/tmp/nti-openapi.normalized.json';

export function ensureGeneratedDir() {
  mkdirSync(generatedDir, { recursive: true });
}

export function parseEnvFile(filePath) {
  const env = {};
  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split('\n')) {
    const match = line.match(/^([^=#][^=]*)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
    }
  }

  return env;
}

export function loadEnv() {
  return parseEnvFile(join(rootDir, '.env'));
}

export function requireEnv(name, env) {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} is not set in .env`);
  }

  return value;
}
