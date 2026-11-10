import type { LegalDocument } from "@/content/types";

export const privacyPolicy: LegalDocument = {
  title: "Privacy policy",
  description:
    "How GetwithUs collects, uses, stores, and protects the information you share with us through our website and services.",
  updated: "2026-11-09",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      blocks: [
        {
          type: "p",
          text: "GetwithUs is a software development and digital technology agency. We build websites and web apps, Android and iOS apps, custom software and cloud systems, and agentic automation (WhatsApp bots, calling agents, and workflow automation), and we run digital marketing.",
        },
        {
          type: "p",
          text: "We respect your privacy and are committed to protecting the personal information you share with us through our website, communication channels, and business interactions.",
        },
        {
          type: "p",
          text: "This Privacy Policy explains how we collect, use, store, disclose, and protect your information.",
        },
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      blocks: [
        {
          type: "p",
          text: "We may collect the following categories of information:",
        },
        {
          type: "p",
          text: "Personal information: full name, email address, phone number, company or organisation name, and business details.",
        },
        {
          type: "p",
          text: "Enquiry details from our contact form and project brief: the services you are interested in, your message, budget range, timeline, the address of an existing website, and how you heard about us.",
        },
        {
          type: "p",
          text: "Project information: project requirements and descriptions, technical specifications, business requirements, files and documents shared for development, and project-related communication and feedback.",
        },
        {
          type: "p",
          text: "Technical information stored with a form submission:",
        },
        {
          type: "ul",
          items: [
            "A one-way hash of your IP address that changes every day. We do not store the address itself.",
            "Your browser's user agent (browser, version, and operating system).",
            "Your browser's preferred language.",
            "Campaign tags (UTM parameters) from the link that brought you to the site.",
          ],
        },
        {
          type: "p",
          text: "Our hosting provider also keeps short-lived server logs, including IP addresses, for security and troubleshooting.",
        },
      ],
    },
    {
      id: "how-we-use-your-information",
      title: "How we use your information",
      blocks: [
        { type: "p", text: "We use collected information for the following purposes:" },
        {
          type: "ul",
          items: [
            "To respond to enquiries and project requests.",
            "To understand client requirements.",
            "To prepare quotations, proposals, and project estimates.",
            "To develop, test, and deliver software products.",
            "To communicate project updates and delivery timelines.",
            "To provide technical support and maintenance.",
            "To process invoices and payments.",
            "To improve our website and services.",
            "To maintain security and prevent fraudulent activities.",
            "To comply with applicable legal obligations.",
          ],
        },
      ],
    },
    {
      id: "project-data-and-confidentiality",
      title: "Project data and confidentiality",
      blocks: [
        {
          type: "p",
          text: "GetwithUs understands that clients may share confidential business information, source code, credentials, documents, and other sensitive project materials. We will:",
        },
        {
          type: "ul",
          items: [
            "Use client-provided information only for authorised project-related purposes.",
            "Take reasonable measures to prevent unauthorised access or disclosure.",
            "Restrict access to project information to authorised team members and service providers who need it.",
            "Not publicly disclose confidential client information without permission, except where legally required.",
          ],
        },
        {
          type: "p",
          text: "Where appropriate, additional confidentiality obligations may be established through a separate Non-Disclosure Agreement or service agreement.",
        },
      ],
    },
    {
      id: "sharing-of-information",
      title: "Sharing of information",
      blocks: [
        {
          type: "p",
          text: "We do not sell personal information to third parties. We may share information with:",
        },
        {
          type: "ul",
          items: [
            "Authorised employees and project team members.",
            "Hosting providers and cloud infrastructure providers.",
            "Payment processors and financial service providers.",
            "Third-party APIs, software tools, and technology providers required for project delivery.",
            "Professional advisers or legal authorities where required by law.",
          ],
        },
        {
          type: "p",
          text: "The providers that process enquiries sent through this website are Vercel (hosting), Neon (database), and Hostinger (email delivery). If we turn on team notifications through Slack or WhatsApp, a summary of each new enquiry is sent there as well. If we turn on Cloudflare Turnstile to block spam, Cloudflare checks your browser when you submit a form and receives your IP address, both from your browser and from us when we confirm the check.",
        },
        {
          type: "p",
          text: "Third-party providers may process information according to their own privacy policies and contractual obligations.",
        },
      ],
    },
    {
      id: "cookies-and-tracking",
      title: "Cookies and tracking technologies",
      blocks: [
        {
          type: "p",
          text: "The public website does not set advertising or tracking cookies. It stores your light or dark theme choice in your browser's local storage. Session storage, which your browser clears when you close the tab, holds the campaign tags from the link that brought you to the site, so they can be sent with a form, and the project brief while you fill it in, including your name, email address, phone number, company, and message, so a refresh does not lose your answers. The brief is cleared from it once you confirm your email address. Signing in to our team admin area sets a session cookie.",
        },
        {
          type: "p",
          text: "You can clear this storage through your browser settings at any time. The site works without it.",
        },
      ],
    },
    {
      id: "data-storage-and-security",
      title: "Data storage and security",
      blocks: [
        {
          type: "p",
          text: "We implement reasonable technical and organisational security measures to protect information against unauthorised access, loss, misuse, alteration, or disclosure. These measures may include:",
        },
        {
          type: "ul",
          items: [
            "Access controls and authentication.",
            "Secure communication protocols.",
            "Restricted access to project files.",
            "Appropriate backup and storage practices.",
            "Monitoring and security updates.",
          ],
        },
        {
          type: "p",
          text: "However, no method of electronic storage or internet transmission can be guaranteed to be completely secure.",
        },
      ],
    },
    {
      id: "data-retention",
      title: "Data retention",
      blocks: [
        {
          type: "p",
          text: "Form submissions whose email address is never confirmed are deleted automatically after 7 days. Verification codes are deleted a day after they are used or expire.",
        },
        {
          type: "p",
          text: "We retain other personal and project information only for as long as reasonably necessary to provide our services, complete contractual obligations, maintain business and financial records, resolve disputes, and meet applicable legal requirements.",
        },
        {
          type: "p",
          text: "Once information is no longer required, we may securely delete or anonymise it, subject to applicable retention obligations and contractual arrangements.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your privacy rights",
      blocks: [
        {
          type: "p",
          text: "Subject to applicable laws, you may have the right to:",
        },
        {
          type: "ul",
          items: [
            "Request access to your personal information.",
            "Request correction of inaccurate information.",
            "Request deletion of personal information.",
            "Withdraw consent where processing is based on consent.",
            "Raise questions or complaints about our handling of personal information.",
          ],
        },
        {
          type: "p",
          text: "To exercise these rights, contact us using the details provided below.",
        },
      ],
    },
    {
      id: "third-party-websites",
      title: "Third-party websites and services",
      blocks: [
        {
          type: "p",
          text: "Our website or software products may contain links to third-party websites, APIs, payment gateways, or external services. GetwithUs does not control the privacy practices of these third parties. Users are encouraged to review their respective privacy policies before using their services.",
        },
      ],
    },
    {
      id: "children",
      title: "Children's privacy",
      blocks: [
        {
          type: "p",
          text: "Our services are intended for businesses, individuals, and organisations. We do not knowingly collect personal information from children in circumstances where parental consent or other legal authorisation is required.",
        },
        {
          type: "p",
          text: "If we become aware of unauthorised collection, we will take appropriate steps in accordance with applicable law.",
        },
      ],
    },
    {
      id: "changes-to-this-policy",
      title: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "We may update this Privacy Policy from time to time to reflect changes in our business practices, technology, or applicable laws. Updated versions will be published on our website with a revised last updated date.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "p",
          text: "If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at connect@getwithus.in or visit getwithus.in.",
        },
        {
          type: "p",
          text: "By using our website or engaging with our services, you acknowledge that you have read this Privacy Policy.",
        },
      ],
    },
  ],
};
