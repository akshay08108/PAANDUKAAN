# PaanDukaan

A Vercel-ready Next.js marketplace for fresh paan and local shop pickup. It uses its own isolated Firebase project, authentication accounts, inventory, and pickup orders.

## What is included

- Firebase email/password sign-in, registration, password reset, and customer/seller roles
- Live Firestore product catalog with a genuine empty state (no demo inventory)
- One-shop cart protection for a clear pickup experience
- Scheduled pickup day and time selection
- Pickup-only orders saved to Firestore
- Customer order history and seller product publishing
- Responsive layout and production build configuration for Vercel

## Local setup

```bash
npm install
npm run dev
```

The app defaults to the dedicated `paandukaan-production` Firebase project. Copy `.env.example` to `.env.local` only when local overrides are required.

Enable Email/Password authentication in Firebase Authentication. The app reads and writes these collections:

- `users`
- `paanProducts`
- `paanOrders` (pickup-only PaanDukaan orders)

For production, add Firestore rules that allow public reads of published products, authenticated users to manage their own user profile and orders, and sellers to manage products whose `storeId` matches their Firebase UID.

This repository includes PaanDukaan-only Firestore rules. Deploy them from a Firebase CLI session with:

```bash
firebase deploy --only firestore:rules --project paandukaan-production
```

## Deploy to Vercel

Import this repository in Vercel. The framework is detected as Next.js. The committed defaults and `.env.example` both point exclusively to `paandukaan-production`.
