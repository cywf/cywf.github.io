# Kylo Parisher – Developer Portfolio  
🚀 **Live Site:** [https://cywf.github.io](https://cywf.github.io)

This is my personal portfolio site - an **interactive analytics and visualization hub** that tracks repository health, workflow status, contribution activity, and cross-project work queues across my public GitHub projects.

## 🎯 Features

### 📊 Real-Time Metrics
- **Repository Health Dashboard** - Live CI/CD status, active repositories, and workflow success rates
- **AI-Agent Monitoring** - Build status for PR-CYBR agent repositories with category badges
- **Contribution Analytics** - GitHub stats, top languages, and contribution streaks
- **Deployment Insights** - GitHub Pages deployment status and history

### 🎨 Tech Stack
- **Astro** - Modern static site generator for optimal performance
- **React** - Interactive UI components
- **TailwindCSS + daisyUI** - Beautiful, customizable dark themes
- **Chart.js** - Interactive data visualizations (doughnut, bar, line charts)
- **GitHub REST API** - Real-time data fetching with local caching
- **Mermaid** - Architecture and workflow diagrams

### 🎨 Theme System
7 customizable dark themes with localStorage persistence:
- **Nightfall** (default) - Cool blue tones with excellent contrast
- **Dracula** - Classic dark theme with purple accents
- **Cyberpunk** - Bright neon colors on dark background
- **Dark Neon** - Magenta and cyan highlights
- **Hackerman** - Matrix-inspired green terminal aesthetic
- **Gamecore** - Warm orange and red gaming vibes
- **Neon Accent** - Purple and pink gradient accents

### 🔄 Data Management
- Automatic data caching (1-hour duration) via localStorage
- CI-generated snapshots for statistics, discussions, and project data
- Real-time GitHub API integration for:
  - Workflow runs and CI/CD status
  - Repository commits and activity
  - Issues and pull requests
  - Agent build statuses
- Client-side privacy: no external tracking or analytics

## 📁 Project Structure

```
.
├── site/                       # Astro application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── MermaidViewer.tsx
│   │   ├── layouts/
│   │   │   └── Layout.astro   # Main layout with nav & footer
│   │   ├── pages/             # All site routes
│   │   │   ├── index.astro    # Home page
│   │   │   ├── dashboard.astro
│   │   │   ├── statistics.astro
│   │   │   ├── discussions.astro
│   │   │   ├── development-board.astro
│   │   │   ├── create-issue.astro
│   │   │   ├── docs.astro
│   │   │   ├── visualizer.astro
│   │   │   └── 404.astro
│   │   ├── scripts/           # Data fetching scripts
│   │   │   ├── fetch_repo_data.ts
│   │   │   ├── fetch_discussions.ts
│   │   │   └── fetch_projects.ts
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   │   ├── legacy/            # Original Jekyll dashboard
│   │   │   ├── assets/        # CSS & JS from original
│   │   │   └── index.html     # Original dashboard
│   │   ├── data/              # CI-generated JSON snapshots
│   │   └── diagrams/          # Mermaid diagram files
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── package.json
├── .github/
│   ├── workflows/
│   │   └── pages.yml          # Build & deploy workflow
│   └── ISSUE_TEMPLATE/        # Issue templates
├── assets/                    # Original Jekyll assets (legacy)
├── index.html                 # Original Jekyll dashboard (legacy)
├── _config.yml               # Jekyll config (legacy)
└── README.md
```

## 🌐 Site Routes

- **`/`** - Home page with project info and quick links
- **`/dashboard`** - Original portfolio dashboard (embedded legacy version)
- **`/statistics`** - Repository statistics with Chart.js visualizations
- **`/discussions`** - Latest GitHub discussions
- **`/development-board`** - Cross-project command center (Projects v2 or issues-based fallback)
- **`/create-issue`** - Quick shortcuts to create issues with templates
- **`/docs`** - Documentation renderer with README and migration notes
- **`/visualizer`** - Mermaid diagram viewer for architecture visualization

## 🚀 Local Development

This site is built with Astro and automatically deployed via GitHub Actions.

### Prerequisites
- Node.js 20 LTS
- npm

### Setup & Run

```bash
cd site
npm install
npm run dev
```

Visit `http://localhost:4321` to view the site.

### Build

```bash
cd site
npm run build
```

The static site will be generated in `site/dist/`.

### Preview Build

```bash
cd site
npm run preview
```

## 🔒 Legacy Dashboard

The original Jekyll dashboard is preserved and accessible at `/dashboard`. It includes:
- Original assets (CSS, JS) copied to `site/public/legacy/assets/`
- Original `index.html` at `site/public/legacy/index.html`
- Full GitHub API integration with 1-hour localStorage caching
- All original visualizations and metrics

The dashboard is embedded via iframe to maintain its original functionality while being part of the new Astro site.

## 🔄 CI/CD & Data Snapshots

The `.github/workflows/pages.yml` workflow:
1. Copies legacy dashboard assets to the Astro public directory
2. Runs data snapshot scripts to generate JSON files:
   - `stats.json` - Aggregated statistics across public `cywf` repositories
   - `discussions.json` - Latest 25 discussions across public `cywf` repositories
   - `projects.json` - Cross-project board items from linked Projects v2 boards (with issues fallback)
3. Builds the Astro site
4. Deploys to GitHub Pages

The workflow runs on pushes, manual dispatches, and every 6 hours to keep snapshots fresh. Data snapshots are server-side only - the `GITHUB_TOKEN` is never exposed to clients.

## ♿ Accessibility

- WCAG AA compliant color contrast across all themes
- Keyboard-accessible navigation and theme switcher
- Skip-to-content link for screen readers
- Breadcrumb navigation on all pages
- Semantic HTML and ARIA labels
- Respects `prefers-reduced-motion`

## 📊 Performance

- Lighthouse scores ≥ 90 (Performance, Best Practices, SEO, Accessibility)
- Astro's optimized static site generation
- Component-level hydration with React
- Efficient caching strategies
- Minimal JavaScript for core pages

## About Me  
I'm Kylo Parisher (KP), a security engineer, AI/ML researcher, instructor, and founder of PR‑CYBR. My mission is to build resilient systems that protect and empower communities.

I balance roles as an AI & ML research engineer, security instructor, and lifelong student. My work spans cybersecurity, executive protection, psionics, space systems, and quantum exploration. Guided by the Seven Hermetic Principles, I focus on ethical innovation and intergenerational stewardship through initiatives like the G8 System.

## PR‑CYBR  
[PR‑CYBR](https://github.com/pr-cybr) is a Puerto Rico initiative I founded to promote digital resilience and education. It aims to build community protection and drive innovation in cybersecurity, AI/ML, and technology.

## Contact & Links  
- [GitHub](https://github.com/cywf)  
- [LinkedIn](https://www.linkedin.com/in/kparisher/)
- [Discord: ALT-F4 Society](https://discord.gg/a6XmRJNAb2)
- [PR‑CYBR](https://github.com/pr-cybr)

## 📄 License

MIT License - See the footer of the site for copyright information.

## Portfolio snapshot contracts and readiness operations

The Astro site under `site/` is static-first for GitHub Pages. Public pages consume committed JSON envelopes in `site/public/data/` with the shape `{ "fetchedAt": string, "data": ... }`.

Snapshot contracts:

- `repositories.json` separates `originals` from `forks` and captures repository metadata, issue/PR pressure, docs/wiki/pages signals, topics, license, CI workflow presence when available, readiness score, readiness band, recommended action, and `dataWarnings`.
- `stats.json` aggregates original non-fork repository totals, open issues excluding PRs, open PRs, language bytes, docs coverage, readiness distribution, and warnings.
- `work-items.json` provides a repo-backed work queue so `/development-board` remains useful even when GitHub Projects data is unavailable.
- `docs-index.json` powers the public wiki/docs index grouped by portfolio category.
- `discussions.json` and `projects.json` remain optional snapshots. Empty Projects data must not make the development board empty.

Production readiness is scored with a documented 100-point rubric in `site/src/lib/readiness.ts`: README (10), description (5), homepage/demo (10), wiki/docs (10), license (10), CI workflow (15), recent activity within 90 days (10), reviewable open PR count (10), manageable tracked issue count (10), and release/tag signal (10). Bands are Production-ready, Stable, Active but needs hardening, Prototype, and Dormant/incomplete.

Wasm enhancement policy: Labs and visualizations must stay browser-local, require no server calls or browser secrets, avoid SharedArrayBuffer/thread requirements for GitHub Pages, and always provide a JavaScript fallback before optional Wasm acceleration is loaded.

Local workflow:

```bash
cd site
npm ci
npm test
npm run typecheck
npm run build
```

Refresh snapshots when network/API access is available:

```bash
cd site
npx tsx src/scripts/fetch_portfolio_snapshots.ts
```
