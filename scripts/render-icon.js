// Renders the brand SVG icon to the PNGs Expo needs, using the real Nunito font.
// Run: node scripts/render-icon.js
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'icon.svg');
const nunitoDir = path.join(root, 'node_modules', '@expo-google-fonts', 'nunito');
const fontFiles = [
  path.join(nunitoDir, '800ExtraBold', 'Nunito_800ExtraBold.ttf'),
  path.join(nunitoDir, '700Bold', 'Nunito_700Bold.ttf'),
];

const svg = fs.readFileSync(svgPath, 'utf8');

function render(svgString, size) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles, loadSystemFonts: true, defaultFontFamily: 'Nunito' },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}

// 1) Full app icon (iOS + Expo Go) — 1024x1024
fs.writeFileSync(path.join(root, 'assets', 'icon.png'), render(svg, 1024));

// 2) Android adaptive foreground — same art scaled to ~66% safe zone on a
//    transparent canvas so the "?" badge never gets cropped by round/squircle masks.
const padded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g transform="translate(512,512) scale(0.66) translate(-512,-512)">
    ${svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}
  </g>
</svg>`;
fs.writeFileSync(path.join(root, 'assets', 'adaptive-icon.png'), render(padded, 1024));

// 3) Web favicon — 48x48
fs.writeFileSync(path.join(root, 'assets', 'favicon.png'), render(svg, 48));

console.log('Wrote assets/icon.png (1024), assets/adaptive-icon.png (1024), assets/favicon.png (48)');
