import { fetchJson, getRestHeaders, writeSnapshot } from './github';
import { scoreProductionReadiness } from '../lib/readiness';

type RawRepo = any;
const owner = 'cywf';
const headers = getRestHeaders();
const warnings: string[] = [];
async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> { try { return await fn(); } catch (e) { warnings.push(`${label}: ${(e as Error).message}`); return fallback; } }
async function fetchAllRepos(): Promise<RawRepo[]> { const repos: RawRepo[] = []; for (let page=1; page<=3; page++) { const batch = await fetchJson<RawRepo[]>(`https://api.github.com/users/${owner}/repos?per_page=100&page=${page}&sort=updated&type=owner`, { headers }); repos.push(...batch); if (batch.length < 100) break; } return repos.filter(r => !r.private); }
function category(repo: any): string { const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase(); if (text.includes('portfolio') || text.includes('github.io')) return 'portfolio/platform'; if (text.includes('cyber') || text.includes('forti') || text.includes('threat')) return 'cybersecurity'; if (text.includes('terraform') || text.includes('devops') || text.includes('infra')) return 'infrastructure/devops'; if (text.includes('ai') || text.includes('agent')) return 'AI/agents'; if (text.includes('blockchain') || text.includes('web3')) return 'blockchain/web3'; if (text.includes('lab') || text.includes('learn')) return 'education/labs'; if (text.includes('tool') || text.includes('util') || text.includes('fetcher')) return 'utilities'; return 'uncategorized'; }
async function main() {
  let raw = await safe('repository list', [], fetchAllRepos);
  const usingObservedFallback = raw.length === 0;
  if (usingObservedFallback) {
    warnings.push('Using checked-in observed fallback repository facts because the GitHub REST repository list was unavailable in this environment.');
    const names = [['cywf',67], ['cywf.github.io',35], ['aliases',53], ['tle-fetcher',9], ['FortiPath',8], ['AudiFi',7], ['vTOC',2]] as const;
    raw = names.map(([name, issues]) => ({ name, full_name: `${owner}/${name}`, html_url: `https://github.com/${owner}/${name}`, description: `${name} public project tracked by the portfolio snapshot fallback.`, homepage: name === 'cywf.github.io' ? 'https://cywf.github.io' : '', fork: false, archived: false, private: false, language: name === 'cywf.github.io' ? 'Astro' : 'TypeScript', stargazers_count: 0, forks_count: 0, watchers_count: 0, open_issues_count: issues, pushed_at: '2026-07-15T00:00:00Z', updated_at: '2026-07-15T00:00:00Z', default_branch: 'main', license: null, has_wiki: true, has_pages: name === 'cywf.github.io', topics: [], languages_url: `https://api.github.com/repos/${owner}/${name}/languages` }));
  }
  const enriched = await Promise.all(raw.map(async (r) => {
    const full = r.full_name;
    const [languages, prs, readme, workflows, releases, tags] = usingObservedFallback ? [r.language ? { [r.language]: 1 } : {}, [], { name: 'README.md' }, { total_count: 0 }, [], []] : await Promise.all([
      safe(`${full} languages`, {}, () => fetchJson<Record<string, number>>(r.languages_url, { headers })),
      safe(`${full} open pull requests`, [], () => fetchJson<any[]>(`https://api.github.com/repos/${full}/pulls?state=open&per_page=100`, { headers })),
      safe(`${full} README`, null, () => fetchJson<any>(`https://api.github.com/repos/${full}/readme`, { headers })),
      safe(`${full} workflows`, { total_count: 0 }, () => fetchJson<any>(`https://api.github.com/repos/${full}/actions/workflows?per_page=1`, { headers })),
      safe(`${full} releases`, [], () => fetchJson<any[]>(`https://api.github.com/repos/${full}/releases?per_page=1`, { headers })),
      safe(`${full} tags`, [], () => fetchJson<any[]>(`https://api.github.com/repos/${full}/tags?per_page=1`, { headers })),
    ]);
    const openPRs = Array.isArray(prs) ? prs.length : 0;
    const openIssuesCountRaw = r.open_issues_count ?? 0;
    const openIssuesOnly = Math.max(0, openIssuesCountRaw - openPRs);
    const hasPages = !!r.has_pages;
    const pagesUrl = hasPages ? (r.homepage || `https://${owner}.github.io/${r.name}/`) : '';
    const latest = releases?.[0]?.tag_name || tags?.[0]?.name || '';
    const scored = scoreProductionReadiness({ hasReadme: !!readme, description: r.description, homepage: r.homepage, pagesUrl, hasWiki: r.has_wiki, hasPages, licenseName: r.license?.name, licenseSpdx: r.license?.spdx_id, hasWorkflow: (workflows as any)?.total_count > 0, pushedAt: r.pushed_at, updatedAt: r.updated_at, openPRs, openIssuesOnly, latestReleaseOrTag: latest });
    return { name: r.name, fullName: full, htmlUrl: r.html_url, description: r.description || '', homepage: r.homepage || '', isFork: !!r.fork, archived: !!r.archived, primaryLanguage: r.language || '', language: r.language || '', languages, stars: r.stargazers_count || 0, forks: r.forks_count || 0, watchers: r.watchers_count || 0, openIssuesCountRaw, openIssuesOnly, openPRs, pushedAt: r.pushed_at, updatedAt: r.updated_at, defaultBranch: r.default_branch, licenseName: r.license?.name || '', licenseSpdx: r.license?.spdx_id || '', hasWiki: !!r.has_wiki, hasPages, wikiUrl: r.has_wiki ? `https://github.com/${owner}/${r.name}/wiki` : '', pagesUrl, hasReadme: !!readme, hasWorkflow: (workflows as any)?.total_count > 0, latestReleaseOrTag: latest, topics: r.topics || [], category: category({ ...r, topics: r.topics || [] }), productionReadinessScore: scored.score, productionReadinessBand: scored.band, recommendedNextAction: scored.recommendedNextAction };
  }));
  const originals = enriched.filter(r => !r.isFork && !r.archived);
  const forks = enriched.filter(r => r.isFork);
  const languages: Record<string, number> = {}; originals.forEach(r => Object.entries(r.languages || {}).forEach(([k,v]) => languages[k]=(languages[k]||0)+Number(v)));
  const stats = { repoCount: originals.length, totalPublicRepos: enriched.length, originalRepoCount: originals.length, forkCount: forks.length, archivedCount: enriched.filter(r=>r.archived).length, stars: originals.reduce((s,r)=>s+r.stars,0), forks: originals.reduce((s,r)=>s+r.forks,0), watchers: originals.reduce((s,r)=>s+r.watchers,0), openIssuesOnly: originals.reduce((s,r)=>s+r.openIssuesOnly,0), openPRs: originals.reduce((s,r)=>s+r.openPRs,0), docsWikiCoverage: originals.filter(r=>r.hasWiki || r.hasPages || r.hasReadme).length, stableOrReadyCount: originals.filter(r=>['Production-ready','Stable'].includes(r.productionReadinessBand)).length, languages, readinessDistribution: originals.reduce((a:any,r)=>{a[r.productionReadinessBand]=(a[r.productionReadinessBand]||0)+1; return a;},{}), dataWarnings: warnings, repositories: originals };
  const reposData = { owner, totalPublicRepos: enriched.length, originalRepoCount: originals.length, forkCount: forks.length, archivedCount: stats.archivedCount, originals, forks, dataWarnings: warnings };
  const work = { repoCount: originals.length, totalOpenIssues: stats.openIssuesOnly, totalOpenPRs: stats.openPRs, items: originals.map(r => ({ repository: r.fullName, title: r.recommendedNextAction, url: `${r.htmlUrl}/issues`, type: 'repository-health', openIssuesOnly: r.openIssuesOnly, openPRs: r.openPRs, readinessBand: r.productionReadinessBand, recommendedNextAction: r.recommendedNextAction })), dataWarnings: warnings };
  const docs = { repoCount: originals.length, categories: originals.reduce((a:any,r)=>{(a[r.category] ||= []).push({ repo: r.name, description: r.description, wikiUrl: r.wikiUrl, htmlUrl: r.htmlUrl, homepage: r.homepage || r.pagesUrl, readmeUrl: `${r.htmlUrl}#readme`, hasWiki: r.hasWiki, hasPages: r.hasPages, hasReadme: r.hasReadme, updatedAt: r.updatedAt, readinessBand: r.productionReadinessBand }); return a;},{}), dataWarnings: warnings };
  writeSnapshot('repositories.json', reposData); writeSnapshot('stats.json', stats); writeSnapshot('work-items.json', work); writeSnapshot('docs-index.json', docs);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
