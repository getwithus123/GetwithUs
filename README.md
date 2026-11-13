# GetwithUs website

Marketing site, lead pipeline, and admin area for GetwithUs, a technology agency that builds websites, mobile apps, WhatsApp and voice agents, and runs digital marketing.

- Public site, light by default with a dark toggle: a home page in CSS 3D (the services orbit, tilting service scenes, the WhatsApp and calling agent demos, a typing code editor, the tool sphere, the process stepper, pricing, and FAQ), seven service pages each with its own WebGL model and demo, process, about, work (case studies, empty until real ones are approved), contact, a five-step project brief, privacy, and terms.
- Lead pipeline: every contact message and brief is confirmed with a 6-digit email code before the team hears about it. Verified leads notify the team by email, in the admin, and optionally on Slack and WhatsApp.
- Admin (`/admin`): magic-link sign-in for an allowlist, dashboard, leads table with filters, lead detail with status, notes, and timeline, and a notification feed.

## Stack

| Area      | Choice                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Framework | Next.js 16.4 (App Router, Cache Components, Turbopack), React 19.3, TypeScript 5.9                       |
| Styling   | Tailwind CSS 4 with brand tokens in `src/styles/tokens.css`, Radix primitives (`radix-ui`), lucide icons |
| 3D        | CSS 3D on the home page; three 0.182, @react-three/fiber 9, @react-three/drei 10 on inner pages          |
| Data      | Postgres 16, Drizzle ORM with postgres.js, Zod 4 at every boundary                                       |
| Auth      | Auth.js (next-auth 5) magic links, database sessions, email allowlist                                    |
| Email     | Resend, templates in react-email                                                                         |
| State     | Zustand (3D quality tier and brief draft), react-hook-form                                               |
| Tests     | Vitest (unit), Playwright with axe (end to end, accessibility, visual)                                   |

Exact versions and the reasons for each pin are in [docs/decisions/0001-versions.md](docs/decisions/0001-versions.md).

## Prerequisites

- Node.js 24 or newer
- pnpm 12.16.1 (`npm install -g pnpm@12.16.1`, or `corepack enable`)
- Postgres 16: Docker (`docker compose up -d` uses `docker-compose.yml`), a local install, or a Neon branch

## Setup

```sh
git clone https://github.com/PRANAV0494/getwithus.git && cd getwithus
pnpm install
cp .env.example .env.local        # then edit: secrets, ADMIN_EMAILS, DATABASE_URL
docker compose up -d              # or point DATABASE_URL at any Postgres 16
pnpm db:migrate
pnpm db:seed                      # optional: your admin user and four fake leads
pnpm dev
```

Open http://localhost:3000. With `EMAIL_TRANSPORT=console` (the default in `.env.example`) every email, including verification codes and admin sign-in links, prints to the terminal running `pnpm dev`, and nothing is sent.

To sign in to `/admin`, put your email in `ADMIN_EMAILS`, request a link at `/admin/login`, and open the link printed in the terminal.

Running a production build locally (`pnpm build`, then `pnpm start`) behaves differently: with the console transport, production builds only log that an email was suppressed, so codes and sign-in links never reach production logs. To see them while trying a production build, build and start with `NEXT_PUBLIC_TEST_HOOKS=1`, and set `NEXT_PUBLIC_SITE_URL` to the address you open (the forms' Origin check uses it), for example `NEXT_PUBLIC_TEST_HOOKS=1 NEXT_PUBLIC_SITE_URL=http://localhost:3001 pnpm build`, then `pnpm start -p 3001` with the same two variables. Never deploy a build made with `NEXT_PUBLIC_TEST_HOOKS=1`.

## Scripts

| Script                          | What it does                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                      | Development server on port 3000                                                                                                  |
| `pnpm build`                    | Runs the guard, then `next build`                                                                                                |
| `pnpm start`                    | Serves the production build                                                                                                      |
| `pnpm check`                    | Typecheck, lint (zero warnings), knip, unit tests, guard. Run before every commit                                                |
| `pnpm typecheck`                | `next typegen` then `tsc --noEmit`                                                                                               |
| `pnpm lint`                     | ESLint with `--max-warnings 0`                                                                                                   |
| `pnpm format`                   | Prettier over the repository                                                                                                     |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests in `tests/unit`                                                                                                |
| `pnpm test:e2e`                 | Playwright suite in `tests/e2e`: builds with test settings, starts on port 3200, uses its own database (see [Testing](#testing)) |
| `pnpm guard`                    | Scans `src/` for the hard rules (dashes, emoji, banned colors and vocabulary, placeholder text)                                  |
| `pnpm guard:strict`             | The guard plus every `[OWNER: ...]` placeholder; must pass before launch                                                         |
| `pnpm knip`                     | Unused files, exports, and dependencies                                                                                          |
| `pnpm icons`                    | Regenerates `icon.png` and `apple-icon.png` from the brand mark                                                                  |
| `pnpm db:generate`              | Generates a migration from `src/server/db/schema`                                                                                |
| `pnpm db:migrate`               | Applies migrations to `DATABASE_URL`                                                                                             |
| `pnpm db:studio`                | Drizzle Studio                                                                                                                   |
| `pnpm db:seed`                  | Admin user from `ADMIN_EMAILS` and four fake leads. Refuses to run in production                                                 |
| `pnpm email:dev`                | Previews the email templates in a browser                                                                                        |

## Environment

Every variable is validated at build and at startup by `src/config/env.ts`; the app refuses to start with a clear message when one is missing or malformed. Nothing else reads `process.env`. `.env.example` documents each one.

| Variable                                                                                            | Required              | Purpose                                                                               |
| --------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                      | yes                   | Postgres connection string. On Neon use the pooled URL                                |
| `AUTH_SECRET`                                                                                       | yes                   | Auth.js secret, 32 characters or more                                                 |
| `ADMIN_EMAILS`                                                                                      | yes                   | Comma-separated allowlist for `/admin`                                                |
| `VERIFICATION_PEPPER`                                                                               | yes                   | Secret for code hashes and form tokens, 32 characters or more                         |
| `CRON_SECRET`                                                                                       | yes                   | Bearer token for `/api/v1/cron/cleanup`, 16 characters or more                        |
| `EMAIL_TRANSPORT`                                                                                   | no (`resend`)         | `resend` sends; `console` prints to the server log                                    |
| `RESEND_API_KEY`                                                                                    | with `resend`         | Resend API key                                                                        |
| `EMAIL_FROM`                                                                                        | yes                   | Sender, on a domain verified in Resend                                                |
| `EMAIL_REPLY_TO`                                                                                    | no                    | Reply-to for client emails                                                            |
| `TEAM_NOTIFY_EMAILS`                                                                                | yes                   | Comma-separated addresses that get new-lead emails                                    |
| `LEADS_API_KEY`                                                                                     | no                    | Enables `/api/v1/integrations/leads`, 32 characters or more                           |
| `SLACK_WEBHOOK_URL`                                                                                 | no                    | Turns on Slack notifications                                                          |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_NOTIFY_TO`, `WHATSAPP_TEMPLATE_NAME` | no, all four together | Turn on WhatsApp notifications ([docs/notifications.md](docs/notifications.md))       |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                            | no, both together     | Turn on Cloudflare Turnstile on the forms                                             |
| `NEXT_PUBLIC_SITE_URL`                                                                              | yes                   | Public URL, no trailing slash. Metadata, sitemap, emails, and the Origin check use it |
| `NEXT_PUBLIC_SITE_NAME`                                                                             | no (`GetwithUs`)      | Brand name in titles and emails                                                       |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_REGION`                                             | no (`us`)             | Turn on PostHog analytics and the cookie banner (see docs/launch-checklist.md)        |
| `NEXT_PUBLIC_SCHEDULING_URL`                                                                        | no                    | Shows a "Book a call" link on `/contact`                                              |
| `NEXT_PUBLIC_TEST_HOOKS`                                                                            | no                    | `1` only for test builds: full console emails (codes and links) in production mode    |

`NEXT_PUBLIC_*` values are inlined at build time, so changing one needs a rebuild.

## Testing

- Unit: `pnpm test`. Covers verification codes, schemas, rate limiting, notification dispatch, the HTTP envelope, the scene's progress mapping, content rules, and UI smoke renders.
- End to end: `pnpm test:e2e`. Needs a Postgres it may wipe. By default it uses `postgres://getwithus:getwithus@localhost:5432/getwithus_test`, a second database on the Docker Postgres from `docker-compose.yml`; set `E2E_DATABASE_URL` to use another server (the database is created if missing, migrated, and emptied on every run). Set `E2E_SKIP_BUILD=1` to reuse a build made by a previous run. Covers home and navigation, both forms through to the code step, the honeypot, admin redirect and status change, axe on five pages, and visual snapshots of the hero.
- CI (`.github/workflows/ci.yml`), on every push to `main` and every pull request: audit, `pnpm check`, `pnpm build`, then the end-to-end suite against a Postgres service container.
- Dependabot (`.github/dependabot.yml`) opens update pull requests weekly for npm packages and monthly for GitHub Actions. Do not accept `three` above 0.182 until `@react-three/fiber` stops using `THREE.Clock` ([decisions/0001-versions.md](docs/decisions/0001-versions.md)).

## Deployment

Vercel for the app, Neon for Postgres, Resend for email. In short: create the Neon branches, verify the sending domain in Resend, set every variable in Vercel, deploy, run `pnpm db:migrate` against production from a secure shell, attach the domain, and confirm the daily cron. The full list with checkboxes is [docs/launch-checklist.md](docs/launch-checklist.md).

## Documentation

- [docs/architecture.md](docs/architecture.md): layers, the lead lifecycle, the 3D panels, Cache Components rules, and why each major choice was made
- [docs/api.md](docs/api.md): every endpoint with curl examples and error codes
- [docs/content.md](docs/content.md): editing copy, FAQs, case studies, team, and owner placeholders
- [docs/notifications.md](docs/notifications.md): channels, enabling Slack and WhatsApp, the WhatsApp template
- [docs/design.md](docs/design.md): tokens, type, components, motion, and the hard rules as a checklist
- [docs/launch-checklist.md](docs/launch-checklist.md): everything to do before and at launch
- [docs/decisions/](docs/decisions/): one short record per major decision
- [docs/handoff.md](docs/handoff.md): what the owner must supply, deviations from the specification, measurements, and known limitations
- [docs/design-lab/README.md](docs/design-lab/README.md): five explored website directions, their evaluation, and the selected design, Modern Engineering, refined (live at `/design` in development); [design-system.md](docs/design-lab/design-system.md) documents the selected system and [design-system-hybrid.md](docs/design-lab/design-system-hybrid.md) the alternative
