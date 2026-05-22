#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

import openapiTS, { astToString } from 'openapi-typescript';

import { ensureGeneratedDir, normalizedSchemaPath, rootDir } from './shared.mjs';

ensureGeneratedDir();

const schema = JSON.parse(readFileSync(normalizedSchemaPath, 'utf8'));

const ast = await openapiTS(schema, {
  alphabetize: true,
});
const output = astToString(ast);

writeFileSync(
  `${rootDir}/src/lib/api/generated/schema.gen.ts`,
  `/* eslint-disable */\n// This file is auto-generated. Do not edit manually.\n${output}`,
);

console.log('✅ Generated src/lib/api/generated/schema.gen.ts');
