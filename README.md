# PaanDukaan

A Vercel-ready Next.js marketplace for fresh paan and local shop pickup. It keeps the Firebase authentication/data model used by PartX while removing vehicle, garage, delivery, and demo-product flows.

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

The app defaults to the same public Firebase web configuration as PartX. To use a dedicated Firebase project, copy `.env.example` to `.env.local` and replace the values.

Enable Email/Password authentication in Firebase Authentication. The app reads and writes these collections:

- `users`
- `paanProducts` (isolated from the PartX automotive catalog)
- `paanOrders` (pickup-only PaanDukaan orders)

For production, add Firestore rules that allow public reads of published products, authenticated users to manage their own user profile and orders, and sellers to manage products whose `storeId` matches their Firebase UID.

This repository includes compatible rules that preserve the existing PartX collections and add only the isolated PaanDukaan collections. Deploy them once from a Firebase CLI session with:

```bash
firebase deploy --only firestore:rules
```

## Deploy to Vercel

Import this repository in Vercel. The framework is detected as Next.js. Add the `NEXT_PUBLIC_FIREBASE_*` environment variables from `.env.example` if you want to override the PartX Firebase project, then deploy.
