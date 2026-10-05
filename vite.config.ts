import { defineConfig } from 'vite';
import { renderPage } from './build/render.ts';

// Контент готов уже в HTTP-ответе: в браузере не нужен UI-фреймворк.
export default defineConfig({
  plugins: [{
    name: 'alter-static-content',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replace('<!--app-html-->', renderPage()) },
  }],
});
