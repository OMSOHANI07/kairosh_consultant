# Kairosh Consultants website

Public marketing site + private admin dashboard for **kairoshconsultants.in**.

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Recharts, dnd-kit
- **Database, auth & API:** [Neon](https://neon.com): Postgres + **Data API** (PostgREST) + **Managed Better Auth** (email OTP). Row Level Security protects every table.
- **Hosting:** GitHub Pages (static) via GitHub Actions, custom GoDaddy domain

> **Supabase → Neon.** The original brief asked for Supabase; this project uses Neon instead. Neon's Data API and Auth play the same roles: the browser talks to Postgres over HTTPS with a JWT, and RLS decides what each request may read or write. There is a single environment variable, `VITE_NEON_URL`, instead of `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

---

## Project layout

```
database/schema.sql          Tables, indexes, RLS policies, RPC functions, seed data
src/config/site.ts           Brand name, contact details, social links, FEATURE FLAGS
src/theme.css                Colour theme (change brand colours here)
src/content/                 All editable copy: home.ts, about.ts, services.ts, seo.json
src/lib/api.ts               Lightweight Data API client for public pages (anonymous JWT)
src/lib/neon.ts              Full Neon auth SDK (lazy-loaded for login + admin)
src/lib/tracking.ts          Consent, visitor/session IDs, events, time on page
src/lib/customer.tsx         Optional login (email OTP / phone) and customer linking
src/components/LoginModal.tsx  Login popup + 10-minute active-time timer
src/admin/                   Dashboard: Overview, Visitors + Journey, Portfolio, Testimonials, Leads
scripts/postbuild.mjs        Per-route HTML with correct meta tags + sitemap.xml
public/                      CNAME, robots.txt, 404.html (SPA redirect), favicon, OG image
.github/workflows/deploy.yml Build & deploy to GitHub Pages on every push to main
```

## Local development

```bash
npm install
cp .env.example .env.local   # already points at the kairosh-consultants Neon project
npm start                    # dev server, opens http://localhost:5173 in your browser
npm run start:prod           # production build, opens http://localhost:4173
npm run build                # type-check + production build into dist/
```

Admin dashboard locally: http://localhost:5173/admin (sign-in codes work on localhost).

---

## Setup checklist

### 1. Neon project — ✅ already done

A Neon project **`kairosh-consultants`** (`damp-wind-40690595`, AWS Singapore) was created with:

- Managed Better Auth enabled, Data API enabled
- `database/schema.sql` applied (tables, RLS, functions, 3 sample portfolio links + 3 testimonials per category)
- Trusted auth domains: `https://kairoshconsultants.in`, `https://www.kairoshconsultants.in` (localhost is allowed by default)

To recreate it in a new project: Neon Console → **New project** → **Auth** → *Enable*, then **Data API** → *Enable* (provider: Neon Auth) → **SQL Editor** → paste and run `database/schema.sql`. The script is safe to re-run.

### 2. Add yourself as admin

In the Neon Console → **SQL Editor**, run (use the email you will sign in with):

```sql
insert into public.admins (email) values ('you@example.com') on conflict do nothing;
```

Then open `/admin`, enter that email, and type in the 6-digit code you receive. **Sign in to /admin once soon after launch** so that your email's auth account is created by you, via OTP.

> Admin access requires: the email is in `admins`, the email is verified, and the account has **no password**. Admins only ever sign in with email OTP.

### 3. Configure email delivery (before launch)

Sign-in codes are currently sent from Neon's shared sender (`auth@mail.myneon.app`), which is meant for development. For production: Neon Console → **Auth → Settings → Email provider** → add your SMTP provider (e.g. Resend, Brevo, Amazon SES, Zoho) and a sender like `no-reply@kairoshconsultants.in`.

Recommended in **Auth → Settings**: turn off the *Google* OAuth provider (unused) and, if the console allows it while keeping Email OTP, turn off *email + password sign-up*.

### 4. Add the GitHub secret

GitHub → **OMSOHANI07/kairosh_consultant** → **Settings → Secrets and variables → Actions → New repository secret**:

| Name            | Value                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| `VITE_NEON_URL` | `https://ep-damp-meadow-b3wd19is.c-4.ap-southeast-1.aws.neon.tech/neondb` |

(This URL is not secret: it ends up in the public JavaScript. It contains no password. Security comes from RLS.)

### 5. Push the code and enable GitHub Pages

```bash
git add -A
git commit -m "Initial website"
git push -u origin main
```

GitHub → **Settings → Pages** → *Build and deployment* → **Source: GitHub Actions**. The **Deploy to GitHub Pages** workflow runs on every push to `main` (re-run it from the **Actions** tab after changing the source).

Then in **Settings → Pages → Custom domain**, enter `kairoshconsultants.in` and save. Once DNS is working (step 6), tick **Enforce HTTPS**.

### 6. Configure GoDaddy DNS

GoDaddy → **My Products → kairoshconsultants.in → DNS**. Your current records point the domain at GoDaddy Website Builder; change them as follows:

1. **Delete** the `A  @  WebsiteBuilder Site` record. If GoDaddy refuses, first disconnect the domain from Website Builder (Websites → *Settings* → disconnect domain), or turn off any **Forwarding** for the domain.
2. **Add four A records** (Name `@`, TTL 1 hour):

   | Type | Name | Value             |
   | ---- | ---- | ----------------- |
   | A    | @    | `185.199.108.153` |
   | A    | @    | `185.199.109.153` |
   | A    | @    | `185.199.110.153` |
   | A    | @    | `185.199.111.153` |

3. *(Optional, IPv6)* Add four AAAA records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
4. **Edit** the `CNAME  www` record so its value is **`omsohani07.github.io`** (currently it is `kairoshconsultants.in.`).
5. Leave the `NS`, `SOA`, `_domainconnect` and `_dmarc` records alone.

DNS changes usually take from a few minutes up to a few hours. Check with `dig kairoshconsultants.in +short`: it should list the four `185.199.x.153` addresses. Then enable **Enforce HTTPS** in GitHub Pages.

*(Recommended)* Verify the domain so nobody else can claim it on GitHub Pages: GitHub → your profile **Settings → Pages → Add a domain**, then add the TXT record it gives you in GoDaddy.

---

## Everyday use

| I want to…                         | Do this                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| Change brand name, email, socials  | `src/config/site.ts` (also `index.html` + `scripts/postbuild.mjs`) |
| Change colours                     | `src/theme.css` (chart colours: top of `src/admin/Overview.tsx`)   |
| Edit About page                    | `src/content/about.ts`                                             |
| Edit service pages / home copy     | `src/content/services.ts`, `src/content/home.ts`                   |
| Edit page titles / descriptions    | `src/content/seo.json`                                             |
| Add portfolio links / testimonials | `/admin` → Portfolio / Testimonials (live, no deploy needed)       |
| Replace the logo                   | `src/components/Logo.tsx`, `public/favicon.svg`, `public/og-image.png` |

Sample portfolio links and testimonials are marked **"Sample"**: replace or delete them from `/admin` before launch. Search for `PLACEHOLDER` to find all other placeholder text.

## How tracking and consent work (DPDP Act)

- **Before consent / after "Decline":** only an anonymous `page_view` (path only) is stored. No identifiers.
- **After "Accept":** a random `visitor_id` (localStorage), sessions (new one after 30 min of inactivity), referrer + UTM, device/browser/screen, approximate country/city (via [GeoJS](https://www.geojs.io/), only after consent), page views with title, time on page (sent with `fetch(…, { keepalive: true })` on route change and page hide), CTA clicks, portfolio clicks, contact submits and login popup events.
- "Cookie settings" in the footer reopens the banner; declining deletes the stored IDs.

## Optional login

- Popup appears after **10 minutes of cumulative active time** (timer in localStorage, paused when the tab is hidden), and again every 10 minutes after each "Maybe later". Never shown to signed-in visitors or on `/admin`. Visitors can also click **Sign in** in the navbar.
- **Email:** 6-digit email OTP via Neon Auth. On success, `link_customer()` creates/finds the customer and links the visitor, so the dashboard shows their journey from before they logged in.
- **Phone:** controlled by `features.PHONE_OTP_ENABLED` in `src/config/site.ts`.
  - `false` (default): the number is saved **without verification** (`phone_verified = false`, shown as "unverified" in the dashboard).
  - `true`: uses Neon Auth's *Phone Number* plugin. Requirements: enable it in Neon Console → Auth → Plugins, and create a `send.otp` **webhook** that forwards codes to an SMS provider (Twilio, MSG91, etc.). That webhook needs a small server/serverless function: GitHub Pages can't host one. Note that Neon's phone OTP currently signs in **existing** users with a linked phone; it cannot create new accounts from a phone number alone.

## Security model

- Anonymous visitors (anonymous JWT) can **insert** into `visitors`, `sessions`, `events`, `leads` and **read only active** `portfolio_links` / `testimonials`. They cannot read any tracking data, leads or customers.
- Visitor/session upserts and customer linking go through `SECURITY DEFINER` functions that only touch the caller's own rows.
- Only signed-in admins (`is_admin()`) can read analytics, manage leads, and add/edit/delete/reorder portfolio links and testimonials. This is enforced by RLS in Postgres, not just the UI.
- `/admin` has `noindex, nofollow` and is disallowed in `robots.txt`.

## Verified locally

- `npm run build` type-checks cleanly. Public JS is ~103 KB gzipped; admin, charts and the auth SDK are separate lazy chunks.
- Lighthouse (mobile, production build): **100 / 100 / 100 / 100** (performance / accessibility / best practices / SEO) on `/` and `/services/ai`.
- RLS checked through the live Data API with an anonymous token: public reads work, inserts work, reading `events` / calling admin functions / writing portfolio is denied.
- End-to-end in the browser: consent → visitor + session + events (with geo) → contact lead → phone fallback login linked the visitor to a customer. Admin analytics functions returned correct numbers. (Test rows were deleted afterwards.)
- **Not yet tested:** the real email-OTP admin sign-in (needs your inbox) and the dashboard UI with live data. Do step 2, then click through `/admin`.
