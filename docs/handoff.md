# Handoff report

Status on 2026-11-01: every section of the specification is built, in the order of section 26.1, one commit per phase, and the live site now uses the Modern Engineering design chosen in the design lab. `pnpm check` (typecheck, lint with zero warnings, knip, 161 unit tests, guard) and `pnpm build` pass. The end-to-end suite (19 tests, including axe on five pages) passes. The site has not been deployed; everything below was measured on a local production build.

Repository: https://github.com/PRANAV0494/getwithus (public, default branch `main`). The first CI run on GitHub, on 2026-10-31, passed both jobs: checks and build, then all 16 end-to-end tests on Linux against a Postgres service container.

Launch is blocked only on owner facts (the placeholders below), real credentials, and the checks in [launch-checklist.md](launch-checklist.md) that need the production URL.

Design: a design lab at `/design` holds five alternative website directions and a weighted evaluation. You selected D, Modern Engineering, and it now runs every page of the live site: carbon surfaces, cyan as the one accent, Archivo and JetBrains Mono, square bracketed panels, a visible layout grid, and, in place of the home page's 3D scene, a blueprint beside the services that assembles one slab per service line as you scroll (the service pages keep their 3D panels). See [design.md](design.md), [decisions/0012-design-modern-engineering.md](decisions/0012-design-modern-engineering.md), and [design-lab/README.md](design-lab/README.md). The lab stays at `/design`, not indexed, until it is removed before launch.

## 1. Owner placeholders

`pnpm guard:strict` lists 66 lines: the 65 placeholders below, and `src/config/site.ts:7`, the one line of code that spells the placeholder mark (`OWNER_MARK`, which `known()` and `isFilled()` use); that line stays. Replace each placeholder with the real fact, or delete the sentence when it does not apply. Many pages and emails read from `src/config/site.ts`, so the first group fixes most of the site at once.

Nothing on the public site renders a raw placeholder except the two legal documents, whose text needs every fact before launch: everywhere else an unknown fact hides its line, card, or section (the e2e suite checks the home and service pages for this).

### Brand, contact, and promises (`src/config/site.ts`)

| Location                | Needed                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `src/config/site.ts:24` | Contact email (hello@domain)                                |
| `src/config/site.ts:25` | Phone or WhatsApp number                                    |
| `src/config/site.ts:26` | City and country                                            |
| `src/config/site.ts:27` | Address                                                     |
| `src/config/site.ts:29` | Legal entity name                                           |
| `src/config/site.ts:30` | Response time promise, for example "one business day"       |
| `src/config/site.ts:31` | Fix window after launch, for example "30-day"               |
| `src/app/layout.tsx:55` | Change `lang` if the site's primary language is not English |

### Home page, pricing, and payment

Each of these is hidden on the site until it is filled in; nothing renders a raw placeholder.

| Location                      | Needed                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/config/site.ts:33`       | The month the hero pill says you are booking projects for (the pill is hidden until set)                   |
| `src/config/site.ts:39`       | Payment schedule, for example a deposit at signing and the rest at milestones                              |
| `src/config/site.ts:40`       | Currencies you invoice in                                                                                  |
| `src/config/site.ts:41`       | Tax note, as a sentence, for example "Prices exclude GST"                                                  |
| `src/config/site.ts:42`       | Accepted payment methods                                                                                   |
| `src/content/pricing.ts:33`   | Starting price for a website (until set, the card says "Fixed price after a short scoping call")           |
| `src/content/pricing.ts:41`   | Typical timeline for a website                                                                             |
| `src/content/pricing.ts:47`   | Starting price for an app                                                                                  |
| `src/content/pricing.ts:55`   | Typical timeline for an app                                                                                |
| `src/content/pricing.ts:61`   | Setup price for a WhatsApp or calling agent                                                                |
| `src/content/pricing.ts:62`   | Monthly fee for an agent                                                                                   |
| `src/content/pricing.ts:71`   | Typical timeline for an agent                                                                              |
| `src/content/pricing.ts:76`   | Monthly retainer for digital marketing                                                                     |
| `src/content/pricing.ts:85`   | Typical time to first results for marketing                                                                |
| `src/content/pricing.ts:99`   | Typical timeline for custom software                                                                       |
| `src/content/industries.ts:2` | Confirm the industries to list; the "Industries we build for" section stays hidden while the list is empty |

The website pricing card is marked `featured` (the dark card) for show; move or remove the flag in `src/content/pricing.ts`.

### Project brief budget ranges (`src/content/brief.ts`)

| Location                 | Needed                                |
| ------------------------ | ------------------------------------- |
| `src/content/brief.ts:6` | Lowest budget range, in your currency |
| `src/content/brief.ts:7` | Second budget range                   |
| `src/content/brief.ts:8` | Third budget range                    |
| `src/content/brief.ts:9` | Highest budget range                  |

### Pages and services

| Location                                        | Needed                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/content/pages.ts:86`                       | About page: two sentences on when the company was founded, where it is based, and the team's background                    |
| `src/content/team.ts:6`                         | Team members (names, roles, short bios, real photos) or confirm none                                                       |
| `src/content/process.ts:54`                     | How you keep clients updated: Slack, WhatsApp, or email                                                                    |
| `src/content/services/web-development.ts:41`    | Optional starting price or typical range, or remove the sentence                                                           |
| `src/content/services/web-development.ts:55`    | Your position on WordPress (default offered: build on Next.js, migrate existing WordPress sites keeping URLs and rankings) |
| `src/content/services/app-development.ts:19`    | Payment providers you support (Stripe, Razorpay, or other)                                                                 |
| `src/content/services/app-development.ts:40`    | Optional starting price or typical range, or remove the sentence                                                           |
| `src/content/services/agentic-automation.ts:58` | Language model and voice providers you use                                                                                 |
| `src/content/services/whatsapp-bot.ts:14`       | Languages the WhatsApp bot supports                                                                                        |
| `src/content/services/whatsapp-bot.ts:47`       | Supported languages                                                                                                        |
| `src/content/services/calling-agent.ts:29`      | Providers you use                                                                                                          |
| `src/content/services/calling-agent.ts:56`      | Supported languages                                                                                                        |
| `src/content/services/digital-marketing.ts:35`  | SEO tool you use (Ahrefs or Semrush)                                                                                       |

### Privacy policy (`src/content/legal/privacy.ts`)

| Location                           | Needed                                                |
| ---------------------------------- | ----------------------------------------------------- |
| `src/content/legal/privacy.ts:19`  | Legal entity name; registered address                 |
| `src/content/legal/privacy.ts:23`  | Privacy contact email                                 |
| `src/content/legal/privacy.ts:114` | Jurisdiction                                          |
| `src/content/legal/privacy.ts:213` | Hosting provider, for example Vercel                  |
| `src/content/legal/privacy.ts:214` | Database provider, for example Neon                   |
| `src/content/legal/privacy.ts:231` | Data processing regions                               |
| `src/content/legal/privacy.ts:239` | Privacy contact email                                 |
| `src/content/legal/privacy.ts:254` | Retention period for closed leads                     |
| `src/content/legal/privacy.ts:282` | Jurisdiction                                          |
| `src/content/legal/privacy.ts:287` | Privacy contact email                                 |
| `src/content/legal/privacy.ts:327` | Minimum age, for example 16                           |
| `src/content/legal/privacy.ts:331` | Privacy contact email                                 |
| `src/content/legal/privacy.ts:355` | Privacy contact email                                 |
| `src/content/legal/privacy.ts:359` | Legal entity name; registered address                 |

### Terms (`src/content/legal/terms.ts`)

| Location                         | Needed                                |
| -------------------------------- | ------------------------------------- |
| `src/content/legal/terms.ts:19`  | Legal entity name; registered address |
| `src/content/legal/terms.ts:80`  | Minimum age                           |
| `src/content/legal/terms.ts:93`  | Response time                         |
| `src/content/legal/terms.ts:212` | Jurisdiction                          |
| `src/content/legal/terms.ts:216` | Venue, for example a city             |
| `src/content/legal/terms.ts:220` | Contact email                         |
| `src/content/legal/terms.ts:248` | Contact email                         |
| `src/content/legal/terms.ts:252` | Legal entity name; registered address |
| `src/content/legal/terms.ts:256` | Privacy contact email                 |

Line numbers are as of this commit; `pnpm guard:strict` always prints the current ones. Also decide (no placeholder in code): social profile URLs for `site.social` (empty renders nothing), case studies with written permission or `/work` launching empty, and the analytics choice.

Both legal documents must be reviewed by a lawyer before launch.

## 2. Environment variables to set

Set each in Vercel for Production and Preview (different secrets per environment). `.env.example` documents all of them; the README has the full table.

| Variable                                                                                            | Where to get it                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                      | Neon console, Connection details, pooled connection string (one per branch: production, preview)                                                                |
| `AUTH_SECRET`                                                                                       | Generate: `openssl rand -base64 48`                                                                                                                             |
| `VERIFICATION_PEPPER`                                                                               | Generate: `openssl rand -base64 48`. Changing it invalidates codes and form tokens in flight and resets per-IP rate-limit counters; stored leads are unaffected |
| `CRON_SECRET`                                                                                       | Generate: `openssl rand -base64 48`. Vercel sends it to the cron route automatically                                                                            |
| `ADMIN_EMAILS`                                                                                      | The team members who may sign in, comma separated                                                                                                               |
| `TEAM_NOTIFY_EMAILS`                                                                                | Who receives new-lead emails, comma separated                                                                                                                   |
| `RESEND_API_KEY`                                                                                    | Resend dashboard, API Keys (sending access is enough), after verifying the domain                                                                               |
| `EMAIL_FROM`                                                                                        | An address on the verified domain, for example `GetwithUs <no-reply@yourdomain>`                                                                                |
| `EMAIL_REPLY_TO`                                                                                    | Where client replies should go, for example `hello@yourdomain`                                                                                                  |
| `NEXT_PUBLIC_SITE_URL`                                                                              | The final public URL, for example `https://yourdomain.com` (no trailing slash)                                                                                  |
| `NEXT_PUBLIC_SITE_NAME`                                                                             | Brand name if not "GetwithUs"                                                                                                                                   |
| `LEADS_API_KEY`                                                                                     | Optional. Generate: `openssl rand -base64 48`; give it to the system that will post leads (for example your WhatsApp bot)                                       |
| `SLACK_WEBHOOK_URL`                                                                                 | Optional. Slack app, Incoming Webhooks, Add new webhook ([notifications.md](notifications.md#slack))                                                            |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_NOTIFY_TO`, `WHATSAPP_TEMPLATE_NAME` | Optional, all four. Meta Business Manager and WhatsApp Manager ([notifications.md](notifications.md#whatsapp-cloud-api))                                        |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                            | Optional, both. Cloudflare dashboard, Turnstile, add a widget for the domain                                                                                    |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_REGION`                                             | Optional. PostHog project key (`phc_...`) and region (`us` or `eu`), Production only. Set the PostHog project settings first ([launch-checklist.md](launch-checklist.md)) |
| `NEXT_PUBLIC_SCHEDULING_URL`                                                                        | Optional. Your booking link (for example Cal.com or Calendly)                                                                                                   |

Leave `EMAIL_TRANSPORT` unset in Vercel (it defaults to `resend`) and never set `NEXT_PUBLIC_TEST_HOOKS` there.

## 3. WhatsApp template to submit

Submit in WhatsApp Manager, category Utility, language English (`en`). Name it `new_lead` or anything else and put the name in `WHATSAPP_TEMPLATE_NAME`.

```text
New lead from {{1}} ({{2}}).
Services: {{3}}
Open it in the admin: {{4}}
```

Parameter order, as the app sends them: `{{1}}` the lead's name, `{{2}}` company (or "No company given"), `{{3}}` services, comma separated (or "Not specified"), `{{4}}` the link to the lead in the admin. The app uses Graph API v26.0. Details in [notifications.md](notifications.md#whatsapp-cloud-api).

## 4. Deviations from the specification

### The final design (docs/build-final-prompt.md)

Choices made while building the final light 3D design, beyond the decisions recorded in [build-final-plan.md](build-final-plan.md) section 12:

- **Orbit chips** stay at least 66 percent opaque at the back of the ring (the prototype went to 50 percent): they are links, and their text must stay readable. The ring also slows to a stop while a chip is hovered or focused, so it can be clicked.
- **The process stepper** also holds still while the pointer or keyboard focus is on it, as auto-advancing content must be pausable (WCAG 2.2.2).
- **Chat, call, and service demos** render their finished state first and then replay while on screen. Visitors without JavaScript, reduced motion, and screen readers get the whole demo, and nothing jumps.
- **Decorative text** (the stack sphere, hidden from assistive technology) is left out of the axe contrast check with `data-decorative`; its names are real text in the category buttons.
- **Industries** stay hidden (decision 4), and **seven tools** without a Simple Icons mark (AWS, Azure, OpenAI, Twilio, Plivo, Ahrefs, Looker Studio) are shown by name (decision 3).
- **The service pages' "How it is priced"** shows the service's pricing card (never in the home page's featured style) and its pricing sentence with any placeholder sentence left out.
- **"Fixed price" wording:** the site promised a fixed price on every project, but custom software is time and materials with a weekly cap for open-ended work, and marketing is a monthly retainer. The general promises now read "scope and price in writing" and "an agreed price"; the per-service pricing models are unchanged. Restore "fixed price" if every model becomes fixed price.
- **WhatsApp billing** is described per template message (Meta's pricing since 1 July 2025), not per conversation.
- **Buttons stay still under the pointer.** The prototype's magnetic pull on primary buttons ("Start a project" leaning toward the mouse) is removed at the owner's request: in the header it slid over the theme toggle. The primary button's hover glow remains.
- **Owner placeholders never reach visitors:** the form success screens, the confirmation email (subject, body, footer), and the error messages leave out the response time, contact email, phone, and legal name until they are filled in.
- **The station scene** from the earlier design was retired; every inner page has its own model instead.

### The original build specification

| Spec                                                                           | What was built                                                                                                                                                                                                                      | Why                                                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1, 4.2 to 4.4, 4.6, and 5: the "one light" design and the home 3D scene      | The Modern Engineering design: cyan accent, Archivo and JetBrains Mono, headings up to 60 px, 2 px and square corners, one-time section reveals, SVG figures (a diagram and a scroll-assembled blueprint) instead of the home scene | You selected D in the design lab and asked for it on the live site. See [0012](decisions/0012-design-modern-engineering.md)                                                          |
| 5.3: mount the canvas on the first idle callback after first paint             | Service panels mount 2.5 s after load or on the first scroll, then at idle, once near the viewport                                                                                                                                  | With the spec's timing the scene's startup landed in Lighthouse's measured window (home 79, service page 75). See [0009](decisions/0009-scene-mount-timing.md)                       |
| 5.3 and 28.8: `frameloop` "always", switched to "never" when hidden or settled | `frameloop="demand"`: the station rig requests frames at 30 fps while the panel is on screen and the tab visible                                                                                                                    | Same effect with no loop to toggle; a still page renders nothing                                                                                                                     |
| 5.3: one canvas mounted in the home layout                                     | No canvas on the home page                                                                                                                                                                                                          | Retired with the redesign ([0012](decisions/0012-design-modern-engineering.md)); 3D remains in the service page panels                                                               |
| 4.6 and 8.1: the `motion` package for the reveal and transitions               | CSS keyframes                                                                                                                                                                                                                       | Zero JavaScript; keeps every route under the 180 KB budget. See [0011](decisions/0011-css-transitions.md)                                                                            |
| 4.2: `@theme inline`                                                           | `@theme static`                                                                                                                                                                                                                     | `inline` does not emit the variables on `:root`, and the 3D panels read them at mount; `static` emits them and still clears the default palette                                      |
| 16: prefer a CSP nonce                                                         | Static CSP with `'unsafe-inline'` scripts, set in `next.config.ts`                                                                                                                                                                  | A nonce forces dynamic rendering and is incompatible with the static shell of Cache Components. See [0002](decisions/0002-security-headers.md)                                       |
| 17: Auth.js `SessionProvider` in the admin layout                              | Not used                                                                                                                                                                                                                            | No client component reads the session; every check is server-side (`requireAdmin()` in the layout, each page, each action). Leaving it out saves a client bundle and a session fetch |
| 15: `requireAdmin()` in the admin layout                                       | Also called at the top of every admin page                                                                                                                                                                                          | Layouts and pages render in parallel, so a forged cookie let a page stream data before the layout redirected. Found and fixed during testing                                         |
| 12.2: cron is `POST`                                                           | `GET` and `POST`                                                                                                                                                                                                                    | Vercel Cron calls with `GET`                                                                                                                                                         |
| 12.2: health returns `status: "ok"`                                            | Also `503` with `status: "degraded"` when the database is down                                                                                                                                                                      | Lets uptime monitors see a database outage                                                                                                                                           |
| 8.1: three, latest                                                             | three 0.182.0                                                                                                                                                                                                                       | r183 deprecated `THREE.Clock`, which fiber 9.8.2 still constructs, printing a console warning on every scene page. See [0001](decisions/0001-versions.md)                            |
| 8.1: postgres.js, latest                                                       | 3.4.9                                                                                                                                                                                                                               | 4.0.0 was released after the newest drizzle-orm and is untested with it. See [0001](decisions/0001-versions.md)                                                                      |
| 5 (renderer defaults)                                                          | `renderer.debug.checkShaderErrors` off in production builds                                                                                                                                                                         | On Windows with Chrome's default D3D11 backend, three logged a compiler precision note from a built-in shader as a console warning. Diagnostics stay on in development               |
| 6 (work pages)                                                                 | `/work/[slug]` builds a placeholder slug `none` that renders the 404 page                                                                                                                                                           | Next.js 16 requires at least one static param; the placeholder is excluded from the sitemap                                                                                          |
| 15: status select                                                              | "Awaiting verification" is not offered, and choosing the current status does nothing                                                                                                                                                | Moving a confirmed lead back to unverified would hide it from the leads table; a same-status change used to write a meaningless event                                                |
| 10: environment                                                                | Added `NEXT_PUBLIC_TEST_HOOKS`                                                                                                                                                                                                      | Test builds need full console emails (codes and links) in production mode; never set it in Vercel                                                                                    |
| 22: e2e in Chromium                                                            | Chromium with WebGL on SwiftShader                                                                                                                                                                                                  | The default headless path logs a ReadPixels driver warning that real browsers never show. See [0010](decisions/0010-e2e-environment.md)                                              |
| 21: Lighthouse on the Vercel preview                                           | Measured on a local production build                                                                                                                                                                                                | Not deployed; numbers below. Re-measure on the preview (launch checklist item 9)                                                                                                     |

## 5. Measurements

### Bundle sizes

Initial JavaScript (module scripts the page loads, gzipped at level 9; the 38.6 KB `noModule` polyfill that modern browsers skip is not counted), production build of the final design, 2026-11-01. "Before" is the Modern Engineering build measured the same way earlier that day.

| Route                                                | Before   | Final design |
| ---------------------------------------------------- | -------- | ------------ |
| `/`                                                  | 174.6 KB | 209.3 KB     |
| `/services`                                          | 172.8 KB | 195.0 KB     |
| `/services/web-development` (and every service page) | 178.6 KB | 206.1 KB     |
| `/process`                                           | 172.8 KB | 194.7 KB     |
| `/about`                                             | 178.3 KB | 199.2 KB     |
| `/contact`, `/start`                                 | 173.2 KB | 193.7 KB     |
| `/privacy`, `/terms`                                 | 172.8 KB | 193.8 KB     |
| `/admin/login`                                       | 178.4 KB | 184.5 KB     |

Every marketing route is now over the earlier 180 KB budget. About 20 KB of the growth is shared by every marketing page (the theme toggle and its store, the new header and menus, `WebGLModel`, the reading progress, and Radix and lucide parts they pull in); the home page adds about 15 KB more for its interactive sections (orbit, sphere, editor, demos, stepper). The model chunk (three, fiber, drei, and the page models) loads only after the first interaction on an inner page: 285.9 KB gzipped, inside the 450 KB budget.

### Lighthouse (local)

Mobile, Lighthouse 13.6 defaults (simulated 4G, 4x CPU slowdown), against `next start` on a Windows 11 laptop (Intel Core i7-13700HX, 16 GB, RTX 4050), Chromium 156 headless with GPU, on the final design's build of 2026-11-01. Median of three runs, with every run's performance score in parentheses. This machine is noisy, mostly in Total Blocking Time.

| Page                                        | Performance     | Accessibility | Best practices | SEO | LCP   | TBT     | CLS | Target      |
| ------------------------------------------- | --------------- | ------------- | -------------- | --- | ----- | ------- | --- | ----------- |
| `/`                                         | 70 (69, 70, 70) | 96            | 100            | 100 | 2.1 s | 1155 ms | 0   | 90, not met |
| `/services`                                 | 81 (80, 82, 81) | 100           | 100            | 100 | 1.2 s | 743 ms  | 0   | 85, not met |
| `/services/web-development`                 | 82 (78, 82, 86) | 100           | 100            | 100 | 1.2 s | 512 ms  | 0   | 85, not met |
| `/services/agentic-automation/whatsapp-bot` | 96 (89, 96, 97) | 100           | 100            | 100 | 1.2 s | 225 ms  | 0   | 85, met     |
| `/process`                                  | 98 (98, 99, 98) | 100           | 100            | 100 | 1.2 s | 138 ms  | 0   | 85, met     |
| `/about`                                    | 96 (96, 96, 96) | 100           | 100            | 100 | 1.1 s | 213 ms  | 0   | 85, met     |
| `/contact`                                  | 93 (93, 93, 94) | 100           | 100            | 100 | 1.1 s | 310 ms  | 0   | 85, met     |
| `/start`                                    | 94 (94, 93, 95) | 100           | 100            | 100 | 1.1 s | 276 ms  | 0   | 85, met     |
| `/privacy`                                  | 98 (98, 98, 98) | 100           | 100            | 100 | 1.2 s | 163 ms  | 0   | 85, met     |

No WebGL is in any of these numbers: the models load after the first interaction. What costs time is hydrating many interactive sections at once: the home page hydrates the orbit, typewriter, marquees, tilt cards, both demos and their tabs, the editor, the sphere, the stepper, the FAQ, and the terminal together; `/services` and the web development page carry the service cards and the build demo. Home accessibility is 96 only because Lighthouse cannot leave out the decorative sphere's faded chips (section 4); the axe suite, which does, reports no violations on any page in either theme.

Levers, for when you decide the trade-off (decision 7): hydrate the below-the-fold sections only as they come near (the server already renders their first frame, so nothing would look different), start the orbit and sphere after the first interaction, replace Radix tabs and accordion with native elements, and split the shared header and menus so pages load less up front.

### Other measurements

- CLS 0.0000 measured in the browser on `/`, `/contact`, `/start`, and a service page at 1280 and 390 px.
- Unit tests: 25 files, 193 tests. End to end: 44 tests, including axe on ten pages in both themes and the home hero's visual baselines in both themes at 390 and 1440 px.
- Dependency audit (`pnpm audit`, 2026-10-31): production has 1 low (`deepmerge`, via react-email's `html-to-text`; no patched version exists; it only merges the app's own static options). Development tooling has 3 moderate (`esbuild` via drizzle-kit's loader, which affects only esbuild's dev server, unused here; `minimatch` via typescript-eslint; `glob` via the react-email CLI). CI fails on high or critical.

## 6. Browsers and devices tested

| Browser                                            | How                                                                                                                      | Result                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium 156 (Playwright build), Windows           | Headless with the GPU (D3D11) and with SwiftShader; 1280 px desktop and 390 px mobile emulation (touch, mobile viewport) | All public pages: no console errors or warnings. Service panels render. Forms and admin flows driven end to end. Redesign checked at 1440, 834, and 390 px |
| Firefox 157 (Playwright build), Windows            | Headless, 1280 and 390 px; every public page loaded and scrolled                                                         | Pages render and the service panels run. The 2026-11-01 sweep of the redesign was clean (see known limitations). Forms were not driven in Firefox          |
| Chromium (Playwright build), Linux, GitHub Actions | The end-to-end suite in CI                                                                                               | 16 of 16 passed on 2026-10-31, before the redesign; the visual baselines need refreshing (known limitations)                                               |
| WebKit 27.2 (Playwright build), Windows            | Headless, 1280 and 390 px, mobile emulation; every public page loaded and scrolled                                       | No console errors or warnings, no horizontal overflow. Service panels render. Forms were not driven in WebKit                                              |

Not tested, and needed before launch (launch checklist item 13): Safari on macOS, a real iPhone, a real Android phone, and a screen reader pass (NVDA or VoiceOver) on the home page, the contact form, and the admin lead detail. Keyboard: the e2e suite opens and closes the mega menu by keyboard, and the verification code was entered by keyboard in the form runs; a full keyboard-only pass belongs with the screen reader check. axe reports zero violations in both themes on `/`, `/services`, two service pages, `/process`, `/about`, `/contact`, `/start`, `/privacy`, and `/admin/login` (decorative pieces excluded, section 4).

## 7. Known limitations

- Entering a wrong verification code makes the browser log "Failed to load resource: the server responded with a status of 400". Browsers log every 4xx response to the console. The same applies to an expired code (410), a locked code (423), and rate limits (429). The page handles each one with its message; only the browser's own network log line appears. Avoiding it would mean answering errors with HTTP 200, which breaks the API contract in section 12.
- Visiting a missing URL logs the 404 document's status the same way. That is the 404 page working.
- The closing terminal on the home page sends nothing itself. It asks what the visitor needs and where to reply, saves both to the project brief's draft, and opens `/start` on the next step, where the brief is finished and the email confirmed through the lead pipeline like any other. (Decision 5 kept it on the logging-only `submitBrief` until the site was final; that action is gone.)
- "Industries we build for" stays hidden until the owner confirms the list in `src/content/industries.ts`.
- Every pricing card shows its "after a short scoping call" line until the owner sets prices in `src/content/pricing.ts`; the Website card is `featured` for show.
- The legal pages are the only public pages that show raw placeholders: their text needs every fact (section 1).
- A model's still drawing stays until the visitor's first scroll, pointer move, or key press; moves made before the page hydrates are not counted, so a visitor who never interacts again keeps the still drawing.
- Lighthouse does not measure the models' startup cost, by design: they load after the first interaction. Watch field INP after launch.
- Visual snapshot baselines are committed for Windows only: the home hero in both themes at 390 and 1440 px, captured under reduced motion (the design's still frame), regenerated for the final design on 2026-11-01. Earlier Linux artifacts show old designs and must not be committed; take them from the first CI run after this change instead. Until Linux baselines are committed under `tests/e2e/visual.spec.ts-snapshots/`, CI writes them fresh on each run instead of comparing.
- Dependabot's first scan opened update pull requests for the GitHub Actions used by CI (`actions/checkout`, `actions/setup-node`, and `actions/upload-artifact` to v7, `pnpm/action-setup` to v6; the workflow was written at v4) and one moving `three` to 0.186. Merge the Actions updates once their checks pass. Close the `three` one: the pin at 0.182.0 is deliberate (see [0001](decisions/0001-versions.md)), and Dependabot will propose it again unless an `ignore` rule is added for `three` and `@types/three`.
- Resend, Slack, WhatsApp, Turnstile, Vercel Cron, and the Vercel preview Origin rule were not exercised against the real services (no credentials). They are covered by unit tests with mocked `fetch` and by the console transport. Launch checklist items 6 to 8 cover them on the real deployment.
- `next-auth` 5 is a beta release, pinned. Read its changelog before upgrading.
- The CSP allows inline scripts (see [0002](decisions/0002-security-headers.md)).
- The notification feed shows the newest 100 notifications; there is no paging beyond that.
- Leads cannot be deleted from the admin (spec section 15); spam is a status. Unverified leads are deleted by the daily cron after 7 days.

## 8. Next steps not built

Explicitly out of scope for this pass:

- A blog or resources section.
- Real case studies: the structure, pages, and permission rules exist (see [content.md](content.md#add-a-case-study)), but there are none until clients approve them.
- Testimonials: none are shown. If real ones with written permission arrive, add a content file with a `permission: true` field and build the section then.

Worth considering after launch:

- Field performance data: PostHog already collects Web Vitals from real visits (`$web_vitals` events); add INP and LCP charts to the "GetwithUs daily" dashboard to watch them on real devices.
- Linux visual baselines committed from the `playwright` artifact of the first CI run after the redesign.
- A headless CMS behind the existing content types, if non-developers need to edit copy often.
- More languages, if the WhatsApp bot and calling agent pages target non-English markets.
