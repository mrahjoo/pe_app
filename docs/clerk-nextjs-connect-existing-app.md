# Connect Clerk (Existing Production App) to a New Next.js Project

This is **not** a "create a new Clerk app" flow. You already have a
production-ready Clerk application (`pe_app`) live at
`accounts.app.proexergy.com`. This prompt connects the already have **brand-new Next.js
project** to that existing, already-configured Clerk instance.

- **App ID:** `app_3HobxjOARbBS8DD60LiD2SikfCZ`
- **Instance ID:** `ins_2zrIN…syioINFZp`
- **Environment:** Production (`pk_live_...` / `sk_live_...`)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...


## Quick Setup

Before running any commands, present the user with a preliminary setup
checklist:

```
Here's what I'll do to connect this Next.js app to your existing
production Clerk instance (pe_app).
clerk cli is installed and can be used easily.
1. Install or update the Clerk CLI
2. Sign in to Clerk
3. Link this project to the existing Clerk app (app_3HobxjOARbBS8DD60LiD2SikfCZ)
4. Configure environment variables for the custom accounts domain
   (accounts.app.proexergy.com)
5. Verify the Next.js proxy matcher
6. Start the app and verify sign-in/sign-up against production Clerk

Shall I proceed?
```

## Step 1: Install or update the Clerk CLI

From the project root, check whether the Clerk CLI is already available:

```bash
command -v clerk && clerk --version
```

If `clerk` is available, update it:

```bash
clerk update --yes
```

If not installed, use the user's preferred method, defaulting to npm:

```bash
npm install -g clerk
```

Equivalent commands: `pnpm install -g clerk`, `yarn global add clerk`,
`bun add -g clerk`, `brew install clerk/stable/clerk`, or
`curl -fsSL https://clerk.com/install | bash`.

## Step 2: Sign in to Clerk

```bash
clerk auth login
```

Run this immediately after install/update, before `clerk init`. Pause and
let the user complete the login flow, then continue.

## Step 3: Link the project to the existing Clerk app

This project must link to the **existing production app**, not create a
new one. Always pass the existing app ID:

```bash
clerk init --app app_3HobxjOARbBS8DD60LiD2SikfCZ
```

- Since this is a **brand-new Next.js project** (empty or freshly
  scaffolded with `create-next-app`), `clerk init` will detect Next.js and
  install `@clerk/nextjs`, add the provider, middleware/proxy config, auth
  routes, and a starter `.env.local` — but it will point everything at the
  existing `pe_app` instance instead of creating new API keys.
- Do not run `clerk apps create` or accept any CLI prompt that offers to
  create a new Clerk application. If prompted to select or confirm an app,
  choose `app_3HobxjOARbBS8DD60LiD2SikfCZ`.
- Do not pass `--framework`/`--pm` unless overriding detection or the CLI
  asks for it.

## Step 4: Configure environment variables (production, custom domain)

This Clerk instance uses a **custom accounts domain**, so environment
variables must point to it explicitly rather than relying on Clerk's
default `*.accounts.dev` URLs.

In `.env.local` (never commit this file):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://accounts.app.proexergy.com/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://accounts.app.proexergy.com/sign-up
NEXT_PUBLIC_CLERK_WAITLIST_URL=https://accounts.app.proexergy.com/waitlist
NEXT_PUBLIC_CLERK_UNAUTHORIZED_SIGN_IN_URL=https://accounts.app.proexergy.com/unauthorized-sign-in
```

Notes:

- Do not read or print the contents of an existing `.env.local` if one is
  already present — only add the missing keys above.
- These are **live production credentials**. Because the secret key was
  shared in plaintext during this conversation, treat it as
  potentially exposed: rotate `CLERK_SECRET_KEY` from the Clerk Dashboard
  (**Configure → API Keys**) once setup is verified, and store the new key
  only in `.env.local` (gitignored) and in your hosting provider's
  encrypted environment variable settings (e.g. Vercel Project Settings →
  Environment Variables) — never in source control or client-side code.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe to expose client-side;
  `CLERK_SECRET_KEY` must never appear in client code or be logged.
- The `/user`, `/organization`, and `/create-organization` account-portal
  paths (`accounts.app.proexergy.com/...`) are handled automatically by
  Clerk's hosted account portal once the publishable key resolves to this
  instance — no separate env var needed for those.

## Step 5: Verify the Next.js proxy matcher

Because this instance uses a custom domain
(`accounts.app.proexergy.com`), the Next.js app must proxy Clerk's
frontend API requests. Check `proxy.ts` or `middleware.ts` (Next.js 15 and
earlier) and confirm `config.matcher` includes Clerk's auto-proxy path once,
after the API/TRPC matcher:

```ts
'/(api|trpc)(.*)',
'/__clerk/:path*',
```

Add `'/__clerk/:path*'` if missing. Without this, requests to the custom
domain's frontend API can fail in production.

## Step 6: Fall back to docs if init is incomplete for this framework

If `clerk init` reports the framework is unsupported or cannot fully
scaffold, follow the Next.js quickstart:
[https://clerk.com/docs/nextjs/getting-started/quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart).

## Step 7: Ensure clear auth controls are visible

Add sign-in, sign-up, and signed-in user controls to the new app's layout
or nav so they feel native to the app, not bolted on.

```tsx
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

<>
  <Show when="signed-out">
    <SignInButton />
    <SignUpButton />
  </Show>
  <Show when="signed-in">
    <UserButton />
  </Show>
</>
```

Since sign-in/sign-up redirect to the custom accounts domain
(`accounts.app.proexergy.com`), verify the buttons route there correctly
rather than to a local `/sign-in` route.

## Step 8: Verify the setup

```bash
clerk doctor
```

Then start the app and confirm:

- Sign-in/sign-up redirect to `accounts.app.proexergy.com` and complete
  successfully.
- A signed-in session returns the user to the Next.js app with `UserButton`
  visible.
- The `/__clerk/:path*` proxy route responds (no 404s in network tab
  during auth flows).

## Step 9: If using shadcn/ui

If `components.json` exists and Clerk components are used:

```bash
npm install @clerk/ui
```

```tsx
import { shadcn } from '@clerk/ui/themes'
<ClerkProvider appearance={{ theme: shadcn }}>{children}</ClerkProvider>
```

```css
@import '@clerk/ui/themes/shadcn.css';
```

## Critical rules

- Next.js 15+: `auth()` is async — always `await auth()`.
- `ClerkProvider` goes inside `<body>`, not wrapping `<html>`.
- Proxy matcher includes `'/__clerk/:path*'` after `'/(api|trpc)(.*)'`.
- Never expose `CLERK_SECRET_KEY` in client code, logs, or version control.
- Use `@clerk/nextjs`, not `@clerk/clerk-react`.
- This project links to the **existing** `pe_app` — do not create a second
  Clerk application for this app.
- Rotate the shared production secret key after setup is confirmed working.

Docs: [https://clerk.com/docs/cli](https://clerk.com/docs/cli) ·
[https://clerk.com/docs/llms.txt](https://clerk.com/docs/llms.txt)

## After Setup

Have the user sign in as a real test user against production
(`accounts.app.proexergy.com`). Once a profile icon (`UserButton`) appears,
confirm the session persists across a page refresh. Then remind the user to:

1. Rotate `CLERK_SECRET_KEY` in the Clerk Dashboard since it was shared in
   plaintext.
2. Add the production env vars to the hosting provider (e.g. Vercel), not
   just `.env.local`.
3. Explore [Organizations](https://clerk.com/docs/guides/organizations/overview),
   [Components](https://clerk.com/docs/reference/components/overview), and
   the [Dashboard](https://dashboard.clerk.com/) for the shared `pe_app`
   instance.
