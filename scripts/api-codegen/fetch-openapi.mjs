#!/usr/bin/env node

import { writeFileSync } from 'fs';

import { loadEnv, rawSchemaPath, requireEnv } from './shared.mjs';

const env = loadEnv();
const apiDocsUrl = requireEnv('API_DOCS_URL', env);
const username = env.API_DOCS_USERNAME;
const password = env.API_DOCS_PASSWORD;

const headers =
  username && password
    ? {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      }
    : {};

console.log(`📡 Fetching OpenAPI schema from ${apiDocsUrl}`);

const response = await globalThis.fetch(apiDocsUrl, { headers });

if (!response.ok) {
  throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
}

const schema = await response.json();
writeFileSync(rawSchemaPath, `${JSON.stringify(schema, null, 2)}\n`);

console.log(`✅ Saved raw schema to ${rawSchemaPath}`);
