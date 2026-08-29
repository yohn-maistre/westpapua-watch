import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://westpapua.watch',
  integrations: [sitemap()],
  output: 'static',
  session: false,
  trailingSlash: 'always',
  build: { format: 'directory' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        'upgrade-insecure-requests'
      ],
      scriptDirective: {
        resources: [{ resource: "'self'", kind: 'element' }]
      },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' }
        ]
      }
    }
  },
  vite: { build: { cssMinify: true } }
});
