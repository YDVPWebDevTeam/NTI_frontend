#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

import { normalizedSchemaPath, rawSchemaPath } from './shared.mjs';

const rawSpec = JSON.parse(readFileSync(rawSchemaPath, 'utf8'));

const EXCLUDED_PATHS = new Set(['/api/v1', '/api/v1/demo/pdf']);
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function getMeaningfulSegments(pathname) {
  return pathname
    .split('/')
    .filter(Boolean)
    .filter((segment) => !segment.startsWith('{'));
}

function deriveFallbackTag(pathname) {
  const segments = getMeaningfulSegments(pathname);

  if (segments[0] === 'auth' && segments[1] === 'admin') {
    return 'admin-auth';
  }

  if (segments[0] === 'admin' && segments[1]) {
    return `admin-${toKebabCase(segments[1])}`;
  }

  return toKebabCase(segments[0] ?? 'default');
}

function normalizeOperation(pathname, method, operation) {
  const operationId = operation?.operationId?.trim();

  if (!operationId) {
    throw new Error(`Missing operationId for ${method.toUpperCase()} ${pathname}`);
  }

  const tags = Array.isArray(operation?.tags)
    ? operation.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  return {
    ...operation,
    operationId,
    tags: tags.length > 0 ? tags : [deriveFallbackTag(pathname)],
  };
}

const spec = {
  ...rawSpec,
  paths: Object.fromEntries(
    Object.entries(rawSpec.paths ?? {})
      .filter(([path]) => path.startsWith('/api/v1/'))
      .filter(([path]) => !EXCLUDED_PATHS.has(path))
      .map(([path, pathItem]) => {
        const normalizedPath = path.replace(/^\/api\/v1/, '') || '/';
        const normalizedPathItem = Object.fromEntries(
          Object.entries(pathItem ?? {}).map(([method, operation]) => {
            if (!HTTP_METHODS.includes(method)) {
              return [method, operation];
            }

            return [method, normalizeOperation(normalizedPath, method, operation)];
          }),
        );

        return [normalizedPath, normalizedPathItem];
      }),
  ),
};

const operationIds = new Set();

for (const [pathname, pathItem] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!HTTP_METHODS.includes(method)) {
      continue;
    }

    const operationId = operation.operationId;

    if (operationIds.has(operationId)) {
      throw new Error(`Duplicate operationId "${operationId}" detected at ${method.toUpperCase()} ${pathname}`);
    }

    operationIds.add(operationId);
  }
}

writeFileSync(normalizedSchemaPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`✅ Saved normalized schema to ${normalizedSchemaPath}`);
