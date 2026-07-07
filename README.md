# Kylo Parisher – Developer Portfolio

🚀 **Live Site:** [https://cywf.github.io](https://cywf.github.io)

This is my personal portfolio site - an **interactive analytics and visualization hub** that tracks repository health, workflow status, contribution activity, and cross-project work queues across my public GitHub projects.

## 🎯 Key Features

- **Repository Health Dashboard** - Live CI/CD status and workflow success rates
- **Cross-Project Command Center** - Development board tracking issues and project tasks
- **Contribution Analytics** - GitHub stats, top languages, and activity metrics
- **Legacy Dashboard Preservation** - Original Jekyll dashboard at `/dashboard`
- **7 Custom Dark Themes** - With localStorage persistence
- **Real-time GitHub API Integration** - For current repository and project data

## 📁 Project Structure

```
.
├── site/                       # Astro application
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── layouts/           # Page layouts
│   │   ├── lib/               # Data utilities and type definitions
│   │   ├── pages/             # Site routes (Astro + React)
│   │   ├── scripts/           # Data fetching and snapshot scripts
│   │   ├── styles/            # Global CSS
│   │   └── tests/             # Utility tests
│   ├── public/
│   │   ├── data/              # CI-generated JSON snapshots
│   │   └── legacy/            # Original Jekyll dashboard
│   ├── astro.config.mjs       # Astro configuration
│   └── package.json           # Dependencies and scripts
├── .github/workflows/         # GitHub Actions
├── assets/                    # Legacy Jekyll assets
├── index.html                 # Legacy Jekyll dashboard
└── README.md
```

## 🌐 Site Routes

- **`/`** - Home page with project overview
- **`/dashboard`** - Legacy Jekyll dashboard
- **`/statistics`** - Repository statistics and visualizations
- **`/discussions`** - Latest GitHub discussions
- **`/development-board`** - Cross-project task board
- **`/create-issue`** - Quick issue creation
- **`/docs`** - Documentation
- **`/visualizer`** - Mermaid diagram viewer

## 🚀 Local Development

### Prerequisites
- Node.js 20 LTS

### Setup

```bash
cd site
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to view the site.

### Build & Preview

```bash
npm run build    # Production build to site/dist/
npm run preview  # Preview production build
```

## 🔄 CI/CD & Data Snapshots

GitHub Actions workflow (`.github/workflows/pages.yml`) runs:

1. **Snapshot Generation** - Creates JSON data files in `site/public/data/`:
   - `stats.json` - Repository statistics
   - `discussions.json` - Recent discussions
   - `projects.json` - Project board items
2. **Site Build** - Astro static site generation
3. **Deployment** - GitHub Pages deployment

Workflow runs on pushes to main, every 6 hours, and manual triggers.

## 🛠️ Tech Stack

- **[Astro](https://astro.build/)** - Static site generator
- **[React](https://react.dev/)** - Interactive components
- **[Tailwind CSS](https://tailwindcss.com/)** + **[daisyUI](https://daisyui.com/)** - Styling
- **[Chart.js](https://www.chartjs.org/)** - Data visualizations
- **[Mermaid](https://mermaid.js.org/)** - Diagram rendering
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## 📄 License

MIT License - See site footer for copyright information.
