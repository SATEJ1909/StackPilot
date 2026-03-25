# AI Copilot

This repository is the starting point for an AI copilot app built as a monorepo.

It currently has:

- a `web` app built with Next.js
- an `api` app using Express and Mongoose
- shared packages for UI, ESLint config, and TypeScript config

The project structure is in place, but the product itself is still being built. The frontend is mostly starter UI right now, and the backend has the initial models but not the full server flow yet.

## Project Structure

```text
apps/
  web/        Next.js frontend
  api/        Express + Mongoose backend

packages/
  ui/         Shared React components
  eslint-config/
  typescript-config/
```

## Stack

- Turborepo
- `pnpm` workspaces
- Next.js 16
- React 19
- Express 5
- Mongoose
- TypeScript

## What is already in the repo

### `apps/web`

The frontend app runs on port `3000` and uses the shared `@repo/ui` package.

Main entry:

- `apps/web/app/page.tsx`

### `apps/api`

The backend app has the basic workspace setup and some initial Mongoose models.

Current entry:

- `apps/api/src/index.ts`

At the moment, the API is not fully wired up. It does not yet have full route handling, controllers, or a proper running server flow.

### Existing backend models

These models already exist:

- user/auth provider
- project
- error group
- logs

Files:

- `apps/api/src/features/auth/user.model.ts`
- `apps/api/src/features/project/project.model.ts`
- `apps/api/src/features/error-group/error.model.ts`
- `apps/api/src/features/logs/logs.model.ts`

## Getting Started

### Requirements

- Node.js `18+`
- `pnpm` `9+`

### Install dependencies

```sh
pnpm install
```

### Run the whole monorepo

```sh
pnpm dev
```

This runs the workspace `dev` scripts through Turborepo.

## Useful Commands

### From the repo root

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm format
```

### Run only the web app

```sh
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web check-types
```

### Run only the API app

```sh
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api start
```

## Current State

To keep expectations clear:

- the frontend is still mostly starter content
- the backend models exist, but the API is still incomplete
- there are no documented environment variables yet
- the API `dev` script is not watch mode yet

## Next steps for the project

- replace the starter frontend with real product UI
- set up the Express server properly
- add MongoDB connection and environment config
- create API routes and controllers
- connect the frontend to the backend
