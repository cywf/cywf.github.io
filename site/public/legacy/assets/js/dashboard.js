/**
 * GitHub Portfolio Dashboard
 * Real-time metrics and visualizations for repository health and activity
 */

// Configuration
const CONFIG = {
  github: {
    username: 'cywf',
    organization: 'PR-CYBR',
    personalRepos: ['cywf.github.io'], // Add more if needed
    apiBase: 'https://api.github.com',
  },
  cache: {
    duration: 3600000, // 1 hour in milliseconds
    key: 'github_dashboard_cache'
  },
  charts: {}
};

// Utility Functions
const Utils = {
  // Format numbers with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Calculate time ago
  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  },

  // Get from cache or fetch fresh data
  async getCached(key, fetchFn) {
    try {
      const cached = localStorage.getItem(`${CONFIG.cache.key}_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CONFIG.cache.duration) {
          console.log(`Using cached data for ${key}`);
          return data;
        }
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Save to cache
    try {
      localStorage.setItem(`${CONFIG.cache.key}_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }

    return data;
  }
};

// GitHub API Client
const GitHubAPI = {
  // Fetch with error handling
  async fetch(endpoint, options = {}) {
    const url = `${CONFIG.github.apiBase}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  },

  // Get organization repositories
  async getOrgRepos(org) {
    return this.fetch(`/orgs/${org}/repos?per_page=100&sort=updated`);
  },

  // Get user repositories
  async getUserRepos(username) {
    return this.fetch(`/users/${username}/repos?per_page=100&sort=updated`);
  },

  // Get workflow runs for a repository
  async getWorkflowRuns(owner, repo, perPage = 30) {
    return this.fetch(`/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`);
  },

  // Get commits for a repository
  async getCommits(owner, repo, since) {
    const sinceParam = since ? `&since=${since}` : '';
    return this.fetch(`/repos/${owner}/${repo}/commits?per_page=100${sinceParam}`);
  },

  // Get issues for a repository
  async getIssues(owner, repo, state = 'open') {
    return this.fetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
  },

  // Get pull requests for a repository
  async getPullRequests(owner, repo, state = 'all') {
    return this.fetch(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`);
  }
};

// Dashboard Manager
const Dashboard = {
  // Initialize dashboard
  async init() {
    console.log('Initializing dashboard...');
    this.showLoading();

    try {
      await Promise.all([
        this.loadRepositoryHealth(),
        this.loadAIAgentMetrics(),
        this.loadDeploymentInfo()
      ]);

      this.hideLoading();
      this.updateLastRefreshed();
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      this.showError('Failed to load dashboard data. Please try again later.');
    }
  },

  // Show loading state
  showLoading() {
    const containers = document.querySelectorAll('[data-loading]');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>Loading data...</span>
        </div>
      `;
    });
  },

  // Hide loading state
  hideLoading() {
    const containers = document.querySelectorAll('[data-loading]');
    containers.forEach(container => {
      const loader = container.querySelector('.loading');
      if (loader) loader.remove();
    });
  },

  // Show error message
  showError(message) {
    const containers = document.querySelectorAll('[data-loading]');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="error-message">
          <strong>Error:</strong> ${message}
        </div>
      `;
    });
  },

  // Load repository health metrics
  async loadRepositoryHealth() {
    const data = await Utils.getCached('repo_health', async () => {
      // Fetch repositories
      const [orgRepos, userRepos] = await Promise.all([
        GitHubAPI.getOrgRepos(CONFIG.github.organization),
        GitHubAPI.getUserRepos(CONFIG.github.username)
      ]);

      const allRepos = [...orgRepos, ...userRepos];
      
      // Calculate metrics
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let totalWorkflows = 0;
      let successfulWorkflows = 0;
      let activeRepos = 0;
      let totalIssues = 0;
      let totalPRs = 0;
      let mergedPRs = 0;

      // Sample subset of repos to avoid rate limiting
      const sampleRepos = allRepos.slice(0, 10);

      for (const repo of sampleRepos) {
        try {
          // Check for recent commits
          const commits = await GitHubAPI.getCommits(repo.owner.login, repo.name, weekAgo);
          if (commits.length > 0) activeRepos++;

          // Get workflow runs
          try {
            const runs = await GitHubAPI.getWorkflowRuns(repo.owner.login, repo.name);
            if (runs.workflow_runs) {
              totalWorkflows += runs.workflow_runs.length;
              successfulWorkflows += runs.workflow_runs.filter(r => r.conclusion === 'success').length;
            }
          } catch (e) {
            // Repo might not have workflows
          }

          // Get issues
          const issues = await GitHubAPI.getIssues(repo.owner.login, repo.name);
          totalIssues += issues.filter(i => !i.pull_request).length;

          // Get PRs
          const prs = await GitHubAPI.getPullRequests(repo.owner.login, repo.name);
          totalPRs += prs.length;
          mergedPRs += prs.filter(pr => pr.merged_at).length;

        } catch (error) {
          console.warn(`Failed to fetch data for ${repo.name}:`, error);
        }
      }

      return {
        totalRepos: allRepos.length,
        activeRepos,
        workflowSuccessRate: totalWorkflows > 0 ? (successfulWorkflows / totalWorkflows * 100).toFixed(1) : 0,
        totalIssues,
        totalPRs,
        mergedPRs,
        prMergeRate: totalPRs > 0 ? (mergedPRs / totalPRs * 100).toFixed(1) : 0
      };
    });

    this.renderRepositoryHealth(data);
  },

  // Render repository health section
  renderRepositoryHealth(data) {
    // Update metric cards
    document.getElementById('active-repos-count').textContent = Utils.formatNumber(data.activeRepos);
    document.getElementById('total-repos-count').textContent = `of ${Utils.formatNumber(data.totalRepos)} total`;
    
    document.getElementById('open-issues-count').textContent = Utils.formatNumber(data.totalIssues);
    
    document.getElementById('workflow-success-rate').textContent = `${data.workflowSuccessRate}%`;
    
    document.getElementById('pr-count').textContent = Utils.formatNumber(data.mergedPRs);
    document.getElementById('pr-total-count').textContent = `of ${Utils.formatNumber(data.totalPRs)} total`;

    // Create CI/CD chart
    this.createCICDChart(data.workflowSuccessRate);
    
    // Create issues chart
    this.createIssuesChart(data.totalIssues);
  },

  // Create CI/CD doughnut chart
  createCICDChart(successRate) {
    const ctx = document.getElementById('cicd-chart');
    if (!ctx) return;

    if (CONFIG.charts.cicd) {
      CONFIG.charts.cicd.destroy();
    }

    const failureRate = (100 - parseFloat(successRate)).toFixed(1);
    
    CONFIG.charts.cicd = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Success', 'Failed'],
        datasets: [{
          data: [parseFloat(successRate), parseFloat(failureRate)],
          backgroundColor: ['#10b981', '#f87171'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#d1d5db',
              font: {
                family: "'Courier New', monospace"
              }
            }
          }
        }
      }
    });
  },

  // Create issues bar chart (placeholder with sample data)
  createIssuesChart(totalIssues) {
    const ctx = document.getElementById('issues-chart');
    if (!ctx) return;

    if (CONFIG.charts.issues) {
      CONFIG.charts.issues.destroy();
    }

    // Sample distribution
    const open = totalIssues;
    const closed = Math.floor(totalIssues * 1.5); // Estimate

    CONFIG.charts.issues = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Open', 'Closed'],
        datasets: [{
          label: 'Issues',
          data: [open, closed],
          backgroundColor: ['#fbbf24', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#d1d5db',
              font: {
                family: "'Courier New', monospace"
              }
            },
            grid: {
              color: '#374151'
            }
          },
          x: {
            ticks: {
              color: '#d1d5db',
              font: {
                family: "'Courier New', monospace"
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  },

  // Load AI Agent metrics
  async loadAIAgentMetrics() {
    const data = await Utils.getCached('ai_agents', async () => {
      const orgRepos = await GitHubAPI.getOrgRepos(CONFIG.github.organization);
      
      // Filter for PR-CYBR-* agent repositories
      const agentRepos = orgRepos.filter(repo => 
        repo.name.startsWith('PR-CYBR-') || 
        repo.name.includes('-AGENT')
      );

      const agents = [];

      for (const repo of agentRepos.slice(0, 20)) { // Limit to avoid rate limits
        try {
          const runs = await GitHubAPI.getWorkflowRuns(repo.owner.login, repo.name, 5);
          const latestRun = runs.workflow_runs?.[0];
          
          agents.push({
            name: repo.name,
            status: latestRun?.conclusion || 'unknown',
            category: this.categorizeAgent(repo.name),
            url: repo.html_url
          });
        } catch (error) {
          agents.push({
            name: repo.name,
            status: 'unknown',
            category: this.categorizeAgent(repo.name),
            url: repo.html_url
          });
        }
      }

      return agents;
    });

    this.renderAIAgentMetrics(data);
  },

  // Categorize agent by name
  categorizeAgent(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('frontend') || nameLower.includes('backend') || nameLower.includes('core')) {
      return 'core';
    } else if (nameLower.includes('infra') || nameLower.includes('deploy')) {
      return 'infra';
    } else {
      return 'support';
    }
  },

  // Render AI agent metrics
  renderAIAgentMetrics(agents) {
    const container = document.getElementById('agent-badges-container');
    if (!container) return;

    container.innerHTML = agents.map(agent => `
      <div class="agent-badge">
        <div class="agent-name">${agent.name}</div>
        <span class="agent-status ${agent.status === 'success' ? 'success' : agent.status === 'failure' ? 'failure' : 'pending'}">
          ${agent.status === 'success' ? '✓ PASS' : agent.status === 'failure' ? '✗ FAIL' : '⋯ PENDING'}
        </span>
        <div class="category-badge ${agent.category}">${agent.category.toUpperCase()}</div>
        <a href="${agent.url}" target="_blank" style="font-size: 0.75rem; display: block; margin-top: 0.5rem;">View →</a>
      </div>
    `).join('');
  },

  // Load deployment info
  async loadDeploymentInfo() {
    const data = await Utils.getCached('deployment_info', async () => {
      const runs = await GitHubAPI.getWorkflowRuns(CONFIG.github.username, 'cywf.github.io', 5);
      const latestRun = runs.workflow_runs?.[0];
      
      return {
        status: latestRun?.conclusion || 'unknown',
        updatedAt: latestRun?.updated_at || new Date().toISOString(),
        url: latestRun?.html_url || '#'
      };
    });

    this.renderDeploymentInfo(data);
  },

  // Render deployment info
  renderDeploymentInfo(data) {
    const container = document.getElementById('deployment-info');
    if (!container) return;

    const statusColor = data.status === 'success' ? '#10b981' : '#f87171';
    
    container.innerHTML = `
      <div class="deployment-status">
        <div class="status-indicator" style="background-color: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></div>
        <div>
          <div style="font-family: 'Courier New', monospace; font-weight: 600; color: var(--text-primary);">
            Latest Deployment: ${data.status === 'success' ? 'Success' : 'Failed'}
          </div>
          <div class="deployment-text">
            Deployed ${Utils.timeAgo(data.updatedAt)} · 
            <a href="${data.url}" target="_blank">View workflow →</a>
          </div>
        </div>
      </div>
    `;
  },

  // Update last refreshed timestamp
  updateLastRefreshed() {
    const element = document.getElementById('last-updated');
    if (element) {
      element.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
  }
};

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
  Dashboard.init();
}

// Refresh button handler
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      // Clear cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CONFIG.cache.key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload dashboard
      await Dashboard.init();
    });
  }
});
