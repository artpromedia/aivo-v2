import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        host: true
    },
    build: {
        target: 'esnext',
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'router-vendor': ['react-router', 'react-router-dom'],
                    'query-vendor': ['@tanstack/react-query'],
                    'chart-vendor': ['recharts'],
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
                    'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js']
                }
            }
        }
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router',
            'react-router-dom',
            '@tanstack/react-query',
            'zustand',
            'recharts',
            '@stripe/stripe-js',
            '@stripe/react-stripe-js'
        ]
    }
});
