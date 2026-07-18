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

  // 7. Spline integration is opt-in, lazy, sandboxed, and respects constraints
  assert.ok(indexContent.includes('id="activate-3d-btn"'), 'Activate button should exist');
  assert.ok(!/<button id="activate-3d-btn"[^>]*aria-label=/.test(indexContent), 'Changing visible text should remain the toggle accessible name');
  assert.ok(indexContent.includes('hidden lg:inline-flex'), 'Activate button should hide on mobile');
  assert.ok(indexContent.includes('motion-reduce:hidden'), 'Activate button should hide on reduced-motion');
  assert.ok(indexContent.includes('aria-pressed="false"'), 'Activate button should initially have aria-pressed false');
  assert.ok(indexContent.includes('View 3D system'), 'Activate button should have exact label: View 3D system');

  assert.ok(indexContent.includes('setAttribute(\'sandbox\', \'allow-scripts allow-same-origin\')') || indexContent.includes('setAttribute("sandbox", "allow-scripts allow-same-origin")'), 'Iframe should have restrictive sandbox set via setAttribute');
  assert.ok(indexContent.includes('loading = \'lazy\'') || indexContent.includes('loading = "lazy"'), 'Iframe should load lazily');
  assert.ok(indexContent.includes('referrerPolicy = \'no-referrer\'') || indexContent.includes('referrerPolicy = "no-referrer"'), 'Iframe should have no-referrer policy');

  // ensure JS guards exist
  assert.ok(indexContent.includes('window.innerWidth < 1024'), 'Should defensively refuse activation for narrow viewports in JS');
  assert.ok(indexContent.includes('window.matchMedia(\'(prefers-reduced-motion: reduce)\')') || indexContent.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'), 'Should defensively refuse activation for prefers-reduced-motion in JS');

  // ensure aria toggles and labels are handled in JS
  assert.ok(indexContent.includes('removeAttribute(\'aria-hidden\')') || indexContent.includes('removeAttribute("aria-hidden")'), 'Should remove aria-hidden from slot when active');
  assert.ok(indexContent.includes('setAttribute(\'aria-hidden\', \'true\')') || indexContent.includes('setAttribute("aria-hidden", "true")'), 'Should restore aria-hidden to true on slot when closed');
  assert.ok(indexContent.includes('setAttribute(\'aria-pressed\', \'true\')') || indexContent.includes('setAttribute("aria-pressed", "true")'), 'Should set aria-pressed to true when active');
  assert.ok(indexContent.includes('setAttribute(\'aria-pressed\', \'false\')') || indexContent.includes('setAttribute("aria-pressed", "false")'), 'Should set aria-pressed to false when closed');
  assert.ok(indexContent.includes('Return to static system'), 'Should toggle button label to Return to static system');

  // ensure focus path
  assert.ok(indexContent.includes('activateBtn.focus()'), 'Should retain focus on the control');

  // ensure the url is in index.astro as an inert constant, not an active src string
  assert.ok(indexContent.includes('https://my.spline.design/cywfportfoliosystems-sMeDudMCJLkvg1dVNzK62F31/'), 'Should have inert URL constant');
  assert.ok(!indexContent.includes('src="https://my.spline.design'), 'URL should not be an active src attribute initially');

  console.log('✅ All Portfolio Experience Requirements passed.');
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
