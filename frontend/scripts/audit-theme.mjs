import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve('src');
const violations = [];
const colorLiteral = /#[\da-f]{3,8}\b|\b(?:rgb|hsl|hwb|oklch|oklab|lab|lch)a?\(/i;
const fixedUtility = /\b(?:bg|text|border|ring|outline|stroke|fill|divide|shadow|from|via|to)-(?:white|black|transparent|gray|slate|zinc|neutral|stone|red|orange|yellow|amber|green|emerald|teal|blue|cyan|sky|purple|violet|pink|indigo|rose|fuchsia)(?:-\d+)?\b/;
function audit(directory) {
  for (const file of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, file.name);
    if (file.isDirectory()) { audit(path); continue; }
    if (!/\.(css|tsx?|svg)$/.test(file.name) || path === resolve(root, 'styles/themes.css')) continue;
    readFileSync(path, 'utf8').split('\n').forEach((line, index) => {
      if (colorLiteral.test(line) || fixedUtility.test(line)) violations.push(`${relative(root, path)}:${index + 1}`);
    });
  }
}
audit(root);
if (violations.length) {
  console.error('Move colors into src/styles/themes.css:', violations.join('\n'));
  process.exitCode = 1;
} else console.log('Theme audit passed: no color literals or fixed palette utilities outside themes.css.');
