# Kylo Parisher – Developer Portfolio Dashboard  
🚀 **Live Dashboard:** [https://cywf.github.io](https://cywf.github.io)

This is my personal portfolio site transformed into an **interactive analytics and visualization hub** that tracks repository health, workflow status, and contribution activity across the PR-CYBR organization and my personal projects.

## 🎯 Features

### 📊 Real-Time Metrics
- **Repository Health Dashboard** - Live CI/CD status, active repositories, and workflow success rates
- **AI-Agent Monitoring** - Build status for PR-CYBR agent repositories with category badges
- **Contribution Analytics** - GitHub stats, top languages, and contribution streaks
- **Deployment Insights** - GitHub Pages deployment status and history

### 🎨 Tech Stack
- **Jekyll** - Static site generator with GitHub Pages
- **Chart.js** - Interactive data visualizations (doughnut, bar, line charts)
- **GitHub REST API** - Real-time data fetching with local caching
- **TailwindCSS-inspired** - Dark modern theme with responsive design
- **GitHub Readme Stats** - Embedded statistics cards

### 🔄 Data Management
- Automatic data caching (1-hour duration) via localStorage
- Real-time GitHub API integration for:
  - Workflow runs and CI/CD status
  - Repository commits and activity
  - Issues and pull requests
  - Agent build statuses

## 📁 Project Structure

```
.
├── assets/
│   ├── css/
│   │   └── dashboard.css      # Dark theme styles
│   └── js/
│       └── dashboard.js       # GitHub API client & Chart.js integration
├── index.html                 # Main dashboard page
├── _config.yml               # Jekyll configuration
└── README.md                 # This file
```

## 🚀 Local Development

This site is built with Jekyll and automatically deployed via GitHub Actions.

To run locally:
```bash
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000` to view the dashboard.

> **Note:** The dashboard's real-time metrics require GitHub API access. When running locally, you may see CORS errors in the browser console. The dashboard works best when deployed to GitHub Pages at [https://cywf.github.io](https://cywf.github.io), where all API calls function properly.

## About Me  
I'm Kylo Parisher (KP), a security engineer, AI/ML researcher, instructor, and founder of PR‑CYBR. My mission is to build resilient systems that protect and empower communities.

I balance roles as an AI & ML research engineer, security instructor, and lifelong student. My work spans cybersecurity, executive protection, psionics, space systems, and quantum exploration. Guided by the Seven Hermetic Principles, I focus on ethical innovation and intergenerational stewardship through initiatives like the G8 System.

## PR‑CYBR  
[PR‑CYBR](https://github.com/pr-cybr) is a Puerto Rico initiative I founded to promote digital resilience and education. It aims to build community protection and drive innovation in cybersecurity, AI/ML, and technology.

## Contact & Links  
- [GitHub](https://github.com/cywf)  
- [LinkedIn](https://www.linkedin.com/in/kparisher/)
- [Discord: ALT-F4 Society](https://discord.gg/nQgTBZZrA4)
- [PR‑CYBR](https://github.com/pr-cybr)
