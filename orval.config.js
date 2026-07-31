import { defineConfig } from 'orval';
// Gera tipos + hooks TanStack Query a partir do OpenAPI do backend (openapi.json).
// Rode `npm run generate` com o backend no ar (ele baixa o spec e regenera).
export default defineConfig({
    gearflow: {
        input: './openapi.json',
        output: {
            mode: 'split',
            target: './src/api/generated/endpoints.ts',
            schemas: './src/api/generated/model',
            client: 'react-query',
            httpClient: 'axios',
            prettier: false,
            clean: true,
            override: {
                mutator: { path: './src/api/mutator.ts', name: 'customInstance' },
                query: { useQuery: true, useMutation: true },
            },
        },
    },
});
