# Graph Report - ai-copilot  (2026-05-10)

## Corpus Check
- 54 files · ~10,420 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 217 nodes · 378 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a21f7e8`
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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useAuthToken()` - 10 edges
2. `ProjectRouter` - 9 edges
3. `request()` - 9 edges
4. `toObjectId()` - 8 edges
5. `createProject()` - 8 edges
6. `AI Copilot` - 8 edges
7. `analyzeError()` - 7 edges
8. `AuthActions()` - 7 edges
9. `clearToken()` - 6 edges
10. `getErrorGroups()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `getErrorGroups()` --calls--> `toObjectId()`  [EXTRACTED]
  apps/api/src/features/error-group/error.service.ts → apps/api/src/features/project/project.service.ts
- `AuthActions()` --calls--> `useAuthToken()`  [EXTRACTED]
  apps/web/app/components/auth-actions.tsx → apps/web/lib/auth.ts
- `analyzeErrorHandler()` --calls--> `analyzeError()`  [EXTRACTED]
  apps/api/src/features/error-group/error.controller.ts → apps/api/src/features/error-group/ai.service.ts
- `runBackgroundAnalysis()` --calls--> `analyzeError()`  [EXTRACTED]
  apps/api/src/features/logs/logs.service.ts → apps/api/src/features/error-group/ai.service.ts
- `getErrorGroupsHandler()` --calls--> `getErrorGroups()`  [EXTRACTED]
  apps/api/src/features/error-group/error.controller.ts → apps/api/src/features/error-group/error.service.ts

## Communities (23 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (36): AuthCallbackContent(), AuthCallbackPage(), CallbackShell(), CallbackState, getCopy(), Spinner(), WarningIcon(), Footer() (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (19): analyzeError(), isValidResponse(), MODELS, parseModelResponse(), analyzeErrorHandler(), getErrorGroupsHandler(), errorGroupSchema, ErrorModel (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): getCookie(), githubAuth(), githubCallback(), AuthRouter, logRateLimiter, LogsRouter, buckets, createRateLimiter() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): AI Copilot, `apps/api`, `apps/web`, code:text (apps/), code:sh (pnpm install), code:sh (pnpm dev), code:sh (pnpm dev), code:sh (pnpm --filter web dev) (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (17): createProject(), isAuthenticated(), isAuthenticated(), createProjectHandler(), deleteProjectByIdHandler(), getProjectByIdHandler(), getProjectsHandler(), isValidProjectName() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (7): AuthActions(), DashboardIcon(), GitHubIcon(), config, nextJsConfig, config, config

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (6): AuthProvider, authProviderSchema, UserModel, userSchema, encryptToken(), handleGithubCallback()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): code:sh (pnpm add @stackpilot/sdk), code:ts (import { initLogger } from "@stackpilot/sdk";), code:ts (import { logError } from "@stackpilot/sdk";), Install, Manual Logging, Setup, StackPilot SDK

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **50 isolated node(s):** `Request`, `userSchema`, `authProviderSchema`, `AuthRouter`, `MODELS` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createProject()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `isAuthenticated()` connect `Community 4` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `ProjectRouter` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `Request`, `userSchema`, `authProviderSchema` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._