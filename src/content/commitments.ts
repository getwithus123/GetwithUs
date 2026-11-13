import type { Commitment } from "@/content/types";

/** What clients can hold the business to. Shown on the home page and, expanded, on About. */
export const commitments: readonly Commitment[] = [
  {
    text: "Scope and price in writing before work starts. Changes are priced in writing before they are built.",
    expanded: "You know what a change costs before you decide whether it is worth making.",
  },
  {
    text: "Every account is in your name from day one: repositories, domains, cloud, and ad accounts.",
    expanded:
      "We work inside accounts you control, and the code we write for you is yours once the project is paid for.",
  },
  {
    text: "Weekly demos. If you have not seen it working on staging, it is not done.",
    expanded: "Progress is something you can open on your own phone, not a percentage in a report.",
  },
  {
    text: "No lock-in. Documentation and a handover session are part of every project.",
    expanded: "Your own team, or another one, can pick up the work without needing us in the room.",
  },
];
