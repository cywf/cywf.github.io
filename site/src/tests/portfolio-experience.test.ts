import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, '../../');

async function runTests() {
  console.log('Testing Portfolio Experience Requirements...');

  // 1. Navigation Structure
  const layoutPath = path.join(siteDir, 'src/layouts/Layout.astro');
  const layoutContent = await fs.readFile(layoutPath, 'utf-8');
  assert.ok(!layoutContent.includes('navbar-center'), 'Layout should not use overlapping navbar-center class');
  assert.ok(layoutContent.includes('hidden xl:flex'), 'Desktop navigation should be preserved');
  assert.ok(layoutContent.includes('dropdown-content mt-3'), 'Mobile dropdown should be preserved');

  // 2. No Spline dependencies
  const packageJsonPath = path.join(siteDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  assert.ok(!packageJson.dependencies?.['@splinetool/runtime'], 'Should not include @splinetool/runtime');
  assert.ok(!packageJson.dependencies?.['@splinetool/react-spline'], 'Should not include @splinetool/react-spline');

  // 3. Fallback component exists and is safe
  const constellationPath = path.join(siteDir, 'src/components/SystemConstellation.astro');
  const constellationContent = await fs.readFile(constellationPath, 'utf-8');
  assert.ok(constellationContent.includes('aria-hidden="true"'), 'Constellation should be aria-hidden');
  assert.ok(constellationContent.includes('pointer-events-none'), 'Constellation should be pointer-events-none');
  assert.ok(constellationContent.includes('@media (prefers-reduced-motion: reduce)'), 'Constellation should respect reduced motion');
  assert.ok(constellationContent.includes('id="spline-hero-slot"'), 'Constellation should provide future Spline slot');
  assert.ok(constellationContent.includes('focusable="false"'), 'Decorative SVG should have focusable="false"');
  assert.ok(!constellationContent.includes('mix-blend-screen'), 'Visual should not use mix-blend-screen');

  // 4. Index.astro has no 100vw/100vh layers or canvas or remote scripts
  const indexPath = path.join(siteDir, 'src/pages/index.astro');
  const indexContent = await fs.readFile(indexPath, 'utf-8');
  assert.ok(!indexContent.includes('100vw'), 'Index should not contain 100vw classes');
  assert.ok(!indexContent.includes('100vh'), 'Index should not contain 100vh classes');
  assert.ok(!indexContent.includes('<canvas'), 'Index should not contain a raw canvas element');
  assert.ok(!indexContent.includes('unpkg.com'), 'Index should not load unpkg scripts');
  assert.ok(indexContent.includes('href="/developer-hq"'), 'Index should preserve evidence-first links');
  assert.ok(indexContent.includes('<SystemConstellation />'), 'Index should mount SystemConstellation');
  assert.ok(indexContent.includes('pointer-events-auto'), 'Aside and foreground should be interactive');

  // 5. Layout navbar inner container
  assert.ok(layoutContent.includes('max-w-7xl'), 'Navbar container should contain max-w-7xl');
  assert.ok(layoutContent.includes('w-full'), 'Navbar container should contain w-full');

  // 6. Combined content has no spline packages or URLs
  const combinedContent = indexContent + constellationContent + JSON.stringify(packageJson);
  const badStrings = ['prod.spline.design', '<spline-viewer', '@splinetool/runtime', '@splinetool/react-spline'];
  for (const bad of badStrings) {
    assert.ok(!combinedContent.includes(bad), `Combined content should not contain ${bad}`);
  }

  console.log('✅ All Portfolio Experience Requirements passed.');
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
