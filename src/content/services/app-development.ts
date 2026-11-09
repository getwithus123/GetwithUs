import type { ServiceContent } from "@/content/types";

export const appDevelopment: ServiceContent = {
  slug: "app-development",
  seoDescription:
    "iOS and Android apps from one codebase, with the backend, sign-in, payments, and push they need, and store releases handled.",
  lead: "iOS and Android apps from one codebase, with the backend, sign-in, payments, and push notifications they need, and the store releases handled from first TestFlight build to public release.",
  summary:
    "iOS and Android apps from one codebase, with the backend, sign-in, payments, and notifications they need, and the store releases handled.",
  highlights: [
    "React Native (Expo) or Flutter",
    "APIs, authentication, payments, and push",
    "App Store and Google Play release",
  ],
  whatYouGet: [
    "Product scoping, user flows, and a clickable prototype",
    "A React Native (Expo) or Flutter app built from a shared design system",
    "Backend API, database, and authentication",
    "Payments (Razorpay, Stripe, or the provider you use) and push notifications",
    "Internal test builds through TestFlight and Google Play internal testing",
    "Store listings, review submission, and release",
    "Crash reporting and product analytics in your accounts",
  ],
  howWeWork: [
    "Scope and prototype",
    "Build in weekly increments, each ending with a test build you can install on your phone",
    "Release and store review",
    "Maintenance for OS updates and store policy changes",
  ],
  tools: [
    "Expo and React Native",
    "Flutter",
    "TypeScript",
    "Node.js",
    "Postgres",
    "Firebase Cloud Messaging",
    "Sentry",
  ],
  pricing:
    "Fixed price for a defined scope. Retainer for ongoing changes.",
  faqs: [
    {
      question: "Native or cross-platform?",
      answer:
        "Cross-platform by default, because one codebase ships to both stores and most apps do not need native-only APIs. If yours does, we say so in the scope.",
    },
    {
      question: "Can you take over an existing app?",
      answer:
        "Yes, after a code and store-account review that tells you what we found and what we would change.",
    },
    {
      question: "Who publishes the app?",
      answer:
        "You do, from your own Apple Developer and Google Play accounts. We set them up with you if needed.",
    },
    {
      question: "What happens after launch?",
      answer:
        "Either a retainer that covers OS updates, store policy changes, and small features, or a handover with documentation.",
    },
  ],
  updated: "2026-10-31",
};
