import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const nonBlockingCssPlugin = () => ({
  name: 'non-blocking-css',
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet" href="([^"]+\.css)">/g,
      (match, href) => {
        if (href.includes('fonts.googleapis.com')) {
          return match
        }

        return [
          `<link rel="preload" href="${href}" as="style">`,
          `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'">`,
          `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
        ].join('')
      },
    )
  },
})

export default defineConfig({
  plugins: [react(), nonBlockingCssPlugin()],
})
