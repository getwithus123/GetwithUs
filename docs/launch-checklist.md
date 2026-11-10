# Launch checklist

Target: Vercel for the app, Neon for Postgres, Resend for email. Another Postgres host or Node host works too; the differences are noted where they matter.

## Before launch: owner inputs

- [ ] Every `[OWNER: ...]` placeholder replaced (`pnpm guard:strict` passes). The list, grouped by topic, is in [handoff.md](handoff.md).
- [ ] Budget ranges for the brief set in the owner's currency (`src/content/brief.ts`).
- [ ] Team members added or confirmed empty (`src/content/team.ts`).
- [ ] Case studies added with written client permission, or `/work` confirmed to launch empty.
- [ ] Social profile URLs added to `site.social`, or confirmed none.
- [ ] Analytics: PostHog project key set in Vercel (`NEXT_PUBLIC_POSTHOG_KEY`, Production only) and cookieless tracking turned on in the PostHog project settings, or left unset for none.
- [ ] Admin allowlist (`ADMIN_EMAILS`) and team notification addresses (`TEAM_NOTIFY_EMAILS`) decided.
- [ ] Slack and WhatsApp at launch: yes or no. For WhatsApp, the template in [notifications.md](notifications.md) submitted and approved.
- [ ] Retention period for closed leads decided and written into the privacy policy.
- [ ] Privacy policy and terms reviewed by a lawyer, completed, and dated (`updated` in each file).

## Setup

1. [ ] Create the Neon project with `production` and `preview` branches. In Vercel, set `DATABASE_URL` per environment to the pooled connection string.
2. [ ] Create the Resend account, add the sending domain, add the SPF, DKIM, and DMARC records it provides at the DNS host, and wait for "Verified". Set `RESEND_API_KEY`, `EMAIL_FROM` (for example `GetwithUs <no-reply@domain>`), and `EMAIL_REPLY_TO` (for example `hello@domain`). Leave `EMAIL_TRANSPORT` unset (it defaults to `resend`).
3. [ ] Set every variable from `.env.example` in Vercel for Production and Preview. Generate `AUTH_SECRET`, `VERIFICATION_PEPPER`, `CRON_SECRET`, and `LEADS_API_KEY` with `openssl rand -base64 48`, a different value for each and for each environment. Do not set `NEXT_PUBLIC_TEST_HOOKS`.
4. [ ] Deploy: in Vercel, import the GitHub repository `PRANAV0494/getwithus` (framework preset Next.js; Vercel reads pnpm from `packageManager` in `package.json`). Then run `pnpm db:migrate` against production with the production `DATABASE_URL` from a secure shell, never by pointing a laptop's `.env.local` at production and leaving it there.
5. [ ] Custom domain: add the domain and `www` in Vercel, create the A or ALIAS and CNAME records at the DNS host, confirm HTTPS, make the apex (`getwithus.in`) the primary domain, set `NEXT_PUBLIC_SITE_URL` to `https://getwithus.in`, and redeploy so metadata, the sitemap, emails, and the Origin check use it. Never add a redirect from the apex to `www` in Vercel: `next.config.ts` already sends `www` to the apex, and the two would send visitors back and forth forever.
6. [ ] Confirm the daily cron in Vercel (from `vercel.json`: `0 3 * * *` on `/api/v1/cron/cleanup`) and that it sends `CRON_SECRET` (Vercel sends `Authorization: Bearer <CRON_SECRET>` when the variable is set). On another host, schedule a daily `POST` with that header.

## Verify on the production URL

7. [ ] Send a real contact form submission end to end: receive the code, verify, receive the team email, see the in-app notification, open the lead in the admin, change its status, and receive the Slack or WhatsApp message if enabled. Repeat with the project brief.
8. [ ] Sign in with a magic link for every allowlisted email. Request a link for an address that is not on the list and confirm the same "If that address is on the team list" message appears, no email arrives, and no user row is created.
9. [ ] Run Lighthouse (mobile) on the home page, one service page, and contact, and record the scores below. Targets: home 90 or more, service and content pages 95 or more, CLS 0.
10. [ ] Run `pnpm guard:strict` on the deployed commit: zero placeholders.
11. [ ] Check the favicon set, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, the Open Graph image (share a link in a chat app), the 404 page, and the error page.
12. [ ] Confirm `/privacy` and `/terms` are complete, dated, linked from the footer, and reviewed by a lawyer.
13. [ ] Check the security headers with a scanner (for example securityheaders.com) and confirm the service page 3D panels run under the CSP in Chrome, Safari, and Firefox on desktop, and on one iOS and one Android device.
14. [ ] Turn on the chosen analytics and confirm no cookies are set on the public site (browser dev tools, Application, Cookies).
15. [ ] Backups: Neon point-in-time recovery enabled. Restore procedure: in the Neon console, create a branch from the production branch at a timestamp before the incident, check the data on that branch, then either point `DATABASE_URL` at it and redeploy, or copy the needed rows back.

## Before launch: design lab

- [x] Decide on the design lab recommendation ([design-lab/README.md](design-lab/README.md)): D, Modern Engineering, now live ([decisions/0012-design-modern-engineering.md](decisions/0012-design-modern-engineering.md)).
- [ ] Delete `src/app/(design)`, `src/components/design-lab`, `src/content/design-lab`, `src/styles/design-lab.css`, and the `/design` header rules in `next.config.ts`, or keep them out of the production deployment.

## Launch gates

All must be true before announcing the site:

- [ ] Custom domain on HTTPS: `getwithus.in` is primary, and `www.getwithus.in` redirects to it.
- [x] Favicon set is the brand mark ([brand/README.md](brand/README.md)). Recheck on the production URL with item 11.
- [ ] No template or tool branding anywhere.
- [ ] `/privacy` and `/terms` complete, linked from the footer, read by the owner and a lawyer.
- [ ] `pnpm guard:strict` passes.

## Lighthouse record

Mobile, simulated 4G and 4x CPU (Lighthouse defaults). Fill in from the production URL.

| Page                      | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Date |
| ------------------------- | ----------- | ------------- | -------------- | --- | --- | --- | --- | ---- |
| Home                      |             |               |                |     |     |     |     |      |
| /services/web-development |             |               |                |     |     |     |     |      |
| /contact                  |             |               |                |     |     |     |     |      |

The local measurements taken during the build are in [handoff.md](handoff.md#measurements).
