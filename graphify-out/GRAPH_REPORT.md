# Graph Report - ai-copilot  (2026-05-15)

## Corpus Check
- 59 files · ~11,813 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 235 nodes · 432 edges · 27 communities (21 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2dc11fe6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `useAuthToken()` - 12 edges
2. `request()` - 11 edges
3. `ProjectRouter` - 9 edges
4. `toObjectId()` - 8 edges
5. `createProject()` - 8 edges
6. `AI Copilot` - 8 edges
7. `analyzeError()` - 7 edges
8. `AuthActions()` - 7 edges
9. `processLog()` - 6 edges
10. `Header()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `runBackgroundAnalysis()` --calls--> `analyzeError()`  [EXTRACTED]
  apps/api/src/features/logs/logs.service.ts → apps/api/src/features/error-group/ai.service.ts
- `getErrorGroups()` --calls--> `toObjectId()`  [EXTRACTED]
  apps/api/src/features/error-group/error.service.ts → apps/api/src/features/project/project.service.ts
- `DashboardPage()` --calls--> `useAuthToken()`  [EXTRACTED]
  apps/web/app/dashboard/page.tsx → apps/web/lib/auth.ts
- `ProjectDetailPage()` --calls--> `useAuthToken()`  [EXTRACTED]
  apps/web/app/dashboard/projects/[id]/page.tsx → apps/web/lib/auth.ts
- `ErrorAnalysisPage()` --calls--> `useAuthToken()`  [EXTRACTED]
  apps/web/app/dashboard/projects/[id]/errors/[errorId]/page.tsx → apps/web/lib/auth.ts

## Communities (27 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (20): redisConnection, logQueue, getLogsHandler(), processLogHandler(), LogModel, logSchema, logRateLimiter, LogsRouter (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): AI Copilot, `apps/api`, `apps/web`, code:text (apps/), code:sh (pnpm install), code:sh (pnpm dev), code:sh (pnpm dev), code:sh (pnpm --filter web dev) (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (15): analyzeError(), isValidResponse(), MODELS, parseModelResponse(), analyzeErrorHandler(), getErrorGroupHandler(), getErrorGroupsHandler(), errorGroupSchema (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (18): ErrorAnalysisPage(), LoadState, severityClassName(), analyzeError(), AnalyzeResult, ApiEnvelope, fetchErrorGroup(), fetchErrorGroups() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (12): getCookie(), githubAuth(), githubCallback(), AuthRouter, ErrorPayload, getRoute(), logError(), LoggerConfig (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (15): createProject(), createProjectHandler(), deleteProjectByIdHandler(), getProjectByIdHandler(), getProjectsHandler(), isValidProjectName(), isValidUrl(), normalizePositiveInt() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (10): MetricCard(), SkeletonCard(), SkeletonErrorRow(), SkeletonProjectItem(), DashboardPage(), getSdkSnippet(), LoadState, renderErrors() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.26
Nodes (8): AuthCallbackContent(), AuthCallbackPage(), CallbackShell(), CallbackState, getCopy(), Spinner(), WarningIcon(), setToken()

### Community 8 - "Community 8"
Cohesion: 0.27
Nodes (6): AuthProvider, authProviderSchema, UserModel, userSchema, encryptToken(), handleGithubCallback()

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (6): AuthActions(), DashboardIcon(), GitHubIcon(), Header(), HeaderProps, useAuthToken()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (4): config, nextJsConfig, config, config

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): code:sh (pnpm add @stackpilot/sdk), code:ts (import { initLogger } from "@stackpilot/sdk";), code:ts (import { logError } from "@stackpilot/sdk";), Install, Manual Logging, Setup, StackPilot SDK

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (4): Footer(), LoadState, ProjectDetailPage(), ErrorGroup

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **52 isolated node(s):** `Request`, `userSchema`, `authProviderSchema`, `AuthRouter`, `MODELS` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `isAuthenticated()` connect `Community 2` to `Community 9`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `createProject()` connect `Community 5` to `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `ProjectRouter` connect `Community 5` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `Request`, `userSchema`, `authProviderSchema` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._