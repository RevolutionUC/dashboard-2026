# Contributing

Thanks for helping improve the RevolutionUC dashboard.

## Development Setup

- Prereqs: Node.js (recommended: 20 LTS), npm, and a Postgres database.
- Install dependencies: `npm install`
- Environment:
  - Copy `.env.example` to `.env`
  - Fill in required values (at minimum):
    - `DATABASE_URL`
    - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
    - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Run locally: `npm run dev`

## Before You Push (Required)

Run a production build every time before pushing:

```bash
npm run build
```

If the build fails, fix it before pushing.

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Database Changes (Drizzle)

Schema: `lib/db/schema.ts`

```bash
# Generate migrations
npm exec drizzle-kit generate

# Apply migrations
npm exec drizzle-kit migrate
```

`DATABASE_URL` is required for migration commands.

### Migrations Workflow (Required)

- Commit the `drizzle/` folder in every PR that changes `lib/db/schema.ts`.
- Do not use `drizzle-kit push` on production databases.
- Always run migrations on staging first when possible.

### Baseline Existing Databases (One-Time)

If a database already has tables and enums before migrations are committed, baseline it once so Drizzle does not try to recreate existing objects:

1) Create the migrations table:

```sql
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
```

2) Insert the latest migration tag from `drizzle/meta/_journal.json`:

```sql
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES ('<latest-tag>', <latest-when>);
```

After baselining, run:

```bash
npm exec drizzle-kit migrate
```

## Branch + Rebase Workflow

- Create a branch for your change: `feat/...`, `fix/...`, `chore/...`, etc.
- Rebase on `main` before opening a PR:

```bash
git fetch origin
git rebase origin/main
```

- Resolve all merge conflicts locally before opening a PR.
- Do not request reviews from admins/web leads until conflicts are fully resolved.

If you rebase after pushing your branch, you may need to force-push:

```bash
git push --force-with-lease
```

## PR Guidelines

- PRs must be small and focused. Prefer multiple small PRs over one large PR.
- Avoid mixing unrelated changes (refactors + features + formatting) in one PR.
- Include context: what changed, why it changed, and how to verify.
- Follow `.github/PULL_REQUEST_TEMPLATE.md`.
- We do not use squash-and-merge. Keep your commit history clean and reviewable.

## Commit Guidelines

- Commits should be small, concise, and descriptive.
- Use this commit message format:

```
type(scope): subject
```

Example:

```
update(ui/cleanup): update ui to be more concise
```

## Security

- Never commit secrets (e.g., `.env`, API keys, production database URLs).
- If you suspect a secret was committed, rotate it immediately and remove it from git history.
