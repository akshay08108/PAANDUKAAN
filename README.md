# MeraPaan

**Apna Paan. Apni Pasand.** A Vercel-ready marketplace for discovering Hyderabad paan shops, ordering fresh products, and collecting them at a scheduled pickup time. The existing isolated Firebase project, authentication accounts, inventory, and orders remain in use.

## What is included

- Firebase email/password sign-in, registration, password reset, and customer/seller roles
- Live Firestore product catalog with a genuine empty state (no demo inventory)
- One-shop cart protection for a clear pickup experience
- Scheduled pickup day and time selection
- Pickup-only orders saved to Firestore
- Direct seller UPI or pay-at-pickup payment states; MeraPaan never holds customer funds
- Detailed customer order tracking and seller order workflow
- Seller storefront, product, stock, pickup, and payment configuration
- Installable PWA metadata and responsive production configuration for Vercel

## Local setup

```bash
npm install
npm run dev
```

The app defaults to the dedicated `paandukaan-production` Firebase project. Copy `.env.example` to `.env.local` only when local overrides are required.

Enable Email/Password authentication in Firebase Authentication. The app reads and writes these collections:

- `users`
- `paanProducts`
- `paanOrders` (pickup-only MeraPaan orders)
- `paanStores` (additive seller storefront and payment settings)

This repository includes a dedicated MeraPaan-only Firestore ruleset. The Firebase configuration deploys `firestore.merapaan.rules` to the separate `paandukaan-production` project and grants no PartX collection access. Deploy it from an authenticated Firebase CLI session with:

```bash
firebase deploy --only firestore:rules --project paandukaan-production
```

## Deploy to Vercel

Import this repository in Vercel. The framework is detected as Next.js. Keep the existing Firebase environment variable names and values; they point exclusively to `paandukaan-production`. Set `NEXT_PUBLIC_APP_URL` to the production domain if it differs from the current Vercel URL.

Before going live, verify Email/Password authentication is enabled and deploy `firestore.merapaan.rules`. Direct UPI remains unavailable per shop until its seller saves a UPI ID or QR URL.
