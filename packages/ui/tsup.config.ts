import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable due to TypeScript config conflicts
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react', 
    'react-dom',
    '@radix-ui/react-slot',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'lucide-react',
    'react-error-boundary'
  ],
  banner: {
    js: '"use client";',
  },
});