const path = require('path');

module.exports = {
  api: {
    input: {
      target: '/tmp/nti-openapi.normalized.json',
    },
    output: {
      target: path.join(__dirname, '../../src/lib/api/index.ts'),
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      clean: true,
      prettier: false,
      tsconfig: {
        compilerOptions: {
          target: 'ES2020',
        },
      },
      override: {
        mutator: {
          path: path.join(__dirname, '../../src/lib/api-client/openapi-runtime/runtime.js'),
          name: 'orvalMutator',
        },
        query: {
          useQuery: true,
          useMutation: true,
          shouldExportQueryKey: true,
          version: 5,
        },
      },
    },
  },
};
