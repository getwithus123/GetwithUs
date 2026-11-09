import type { TeamMember } from "@/content/types";

/**
 * The three co-founders of GetwithUs, in display order.
 *
 * photo  - path to a 4:5 portrait under public/team/ (set to undefined to
 *          show the initials fallback until the file is added).
 *          Current files:
 *            public/team/priyanshu-bansal.jpg
 *            public/team/Pranav.jpg
 *            public/team/rajat-sisodia.jpg
 *
 * focus  - one short line. Leave as empty string to hide it.
 *
 * shortBio - optional paragraph shown on the founder card. Leave as empty
 *            string to hide it.
 */
export const team: readonly TeamMember[] = [
  {
    name: "Priyanshu Bansal",
    role: "Co-founder",
    photo: "/team/priyanshu-bansal.jpg",
    focus: "Frontend development and AI automation",
    shortBio:
      "Priyanshu focuses on building modern, responsive user interfaces and intelligent AI-powered automation solutions.",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/priyanshu-bansal-2926512b8/",
      portfolio: "https://priyanshubansal.netlify.app/",
      instagram: "https://www.instagram.com/priyanshu__bansal__/",
    },
  },
  {
    name: "Pranav Maheshwari",
    role: "Co-founder",
    photo: "/team/Pranav.jpg",
    focus: "Backend development and AI automation",
    shortBio:
      "Pranav specialises in scalable backend systems, API development, and AI-powered automation.",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/pranavm0494/",
      instagram: "https://www.instagram.com/__pranavvv.27_/",
    },
  },
  {
    name: "Rajat Sisodia",
    role: "Co-founder",
    photo: "/team/rajat-sisodia.jpg",
    focus: "Client relations and AI solutions",
    shortBio:
      "Rajat focuses on client communication, project coordination, and delivering AI-driven solutions that meet business needs.",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/rajatsisodia/",
      instagram: "https://www.instagram.com/thakur_rajat_sisodia/",
    },
  },
];
