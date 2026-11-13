import type { LegalDocument } from "@/content/types";

export const termsOfService: LegalDocument = {
  title: "Terms and conditions",
  description:
    "The terms that govern your use of the GetwithUs website and the software development services we provide.",
  updated: "2026-11-09",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      blocks: [
        {
          type: "p",
          text: "These Terms and Conditions govern your access to and use of the GetwithUs website and the software development services we provide.",
        },
        {
          type: "p",
          text: "GetwithUs provides technology and software development services, including:",
        },
        {
          type: "ul",
          items: [
            "Website and web application development, including UI and UX design.",
            "Android and iOS app development.",
            "Custom software and cloud development, including backend, API, and database work.",
            "Agentic automation, including WhatsApp bots, calling agents, and workflow automation.",
            "Digital marketing.",
            "Software maintenance and technical support.",
          ],
        },
        {
          type: "p",
          text: "By accessing our website, requesting a quotation, or engaging our services, you agree to these Terms.",
        },
      ],
    },
    {
      id: "our-services",
      title: "Our services",
      blocks: [
        {
          type: "p",
          text: "GetwithUs works with individuals, startups, businesses, and organisations to design, develop, test, and deliver customised digital solutions.",
        },
        {
          type: "p",
          text: "The exact services, project scope, deliverables, timelines, and pricing will be agreed upon separately through a written proposal, quotation, Statement of Work, or service agreement.",
        },
        {
          type: "p",
          text: "Any services not included in the agreed project scope may require additional charges.",
        },
      ],
    },
    {
      id: "client-responsibilities",
      title: "Project requirements and client responsibilities",
      blocks: [
        { type: "p", text: "Clients are responsible for:" },
        {
          type: "ul",
          items: [
            "Providing accurate and complete project requirements.",
            "Sharing necessary content, documents, and resources.",
            "Providing timely feedback and approvals.",
            "Ensuring they have the legal rights to all materials supplied to us.",
            "Providing necessary access to accounts, APIs, platforms, and services.",
            "Reviewing and testing deliverables within the agreed review period.",
            "Making payments according to the agreed schedule.",
          ],
        },
        {
          type: "p",
          text: "Delays in providing required information, approvals, or resources may affect project delivery timelines.",
        },
      ],
    },
    {
      id: "pricing-and-payments",
      title: "Project pricing and payments",
      blocks: [
        {
          type: "p",
          text: "Project pricing will be determined based on the complexity, scope, resources, and estimated development time. The following conditions apply:",
        },
        {
          type: "ul",
          items: [
            "All project prices will be communicated before development begins.",
            "Advance payments or milestone-based payments may be required.",
            "Payment schedules will be specified in the relevant proposal or agreement.",
            "Additional features or changes outside the approved scope may incur additional charges.",
            "Applicable taxes and payment processing charges, if any, will be communicated separately.",
            "Clients must make payments within the agreed deadlines.",
          ],
        },
        {
          type: "p",
          text: "GetwithUs reserves the right to pause development or withhold delivery of unpaid deliverables in the event of overdue payments, subject to the applicable agreement and law.",
        },
      ],
    },
    {
      id: "timeline-and-delivery",
      title: "Project timeline and delivery",
      blocks: [
        {
          type: "p",
          text: "Estimated project timelines will be communicated before development begins. Delivery dates may depend on:",
        },
        {
          type: "ul",
          items: [
            "Project complexity.",
            "Availability of client resources.",
            "Timely feedback and approvals.",
            "Third-party services and integrations.",
            "Changes in project requirements.",
          ],
        },
        {
          type: "p",
          text: "GetwithUs will make reasonable efforts to meet agreed deadlines but cannot guarantee timelines where delays are caused by circumstances outside our reasonable control.",
        },
      ],
    },
    {
      id: "revisions-and-scope",
      title: "Revisions and scope changes",
      blocks: [
        {
          type: "p",
          text: "The project will be developed according to the approved requirements and scope.",
        },
        {
          type: "ul",
          items: [
            "Revisions included in the agreed package or proposal will be provided as specified.",
            "Additional features or major modifications may require a revised quotation.",
            "Changes requested after approval of a milestone may affect the timeline and project cost.",
            "Work on additional requirements will begin after mutual agreement.",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property rights",
      blocks: [
        { type: "p", text: "Unless otherwise agreed in writing:" },
        {
          type: "ul",
          items: [
            "Upon receipt of full payment, ownership of the specifically commissioned final deliverables and custom source code will be transferred to the client, subject to the exclusions below.",
            "Until full payment is received, GetwithUs retains ownership of unpaid deliverables and may restrict their use.",
            "Pre-existing tools, libraries, frameworks, reusable components, development methods, and proprietary materials belonging to GetwithUs remain our property.",
            "Third-party software, open-source libraries, APIs, and licensed assets remain subject to their respective licences and terms.",
            "GetwithUs will not transfer rights that it does not own or have authority to transfer.",
          ],
        },
        {
          type: "p",
          text: "The precise intellectual property arrangements may be further defined in a separate project agreement.",
        },
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality",
      blocks: [
        {
          type: "p",
          text: "Both GetwithUs and the client agree to take reasonable steps to protect confidential information shared during the project. Confidential information may include:",
        },
        {
          type: "ul",
          items: [
            "Business strategies.",
            "Product concepts.",
            "Source code.",
            "Technical documentation.",
            "Customer information.",
            "Credentials and access details.",
            "Financial and commercial information.",
          ],
        },
        {
          type: "p",
          text: "Neither party shall disclose the other party's confidential information to unauthorised persons, except where required by law or permitted by written agreement. A separate NDA may be executed when required.",
        },
      ],
    },
    {
      id: "testing-and-acceptance",
      title: "Testing and project acceptance",
      blocks: [
        {
          type: "p",
          text: "Clients are responsible for reviewing and testing delivered software within the acceptance period specified in the project agreement. Any defects that fall within the agreed scope should be reported with sufficient detail.",
        },
        {
          type: "p",
          text: "GetwithUs will address verified development defects in accordance with the agreed warranty or support terms. New features, enhancements, and changes to approved requirements will be treated as additional work unless otherwise agreed.",
        },
      ],
    },
    {
      id: "maintenance-and-support",
      title: "Maintenance and support",
      blocks: [
        {
          type: "p",
          text: "Maintenance, updates, hosting, server management, and ongoing technical support are not automatically included in every development project. Such services will be provided only where included in the project proposal or agreed through a separate maintenance or support agreement.",
        },
      ],
    },
    {
      id: "third-party-services",
      title: "Third-party services",
      blocks: [
        {
          type: "p",
          text: "Projects may depend on third-party services such as cloud hosting platforms, payment gateways, the Google Play Store and Apple App Store, external APIs, analytics services, and software libraries and frameworks.",
        },
        {
          type: "p",
          text: "GetwithUs is not responsible for independent changes, outages, restrictions, pricing modifications, or policies imposed by third-party providers. Clients may be required to maintain their own third-party subscriptions and accounts.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of liability",
      blocks: [
        {
          type: "p",
          text: "To the maximum extent permitted by applicable law:",
        },
        {
          type: "ul",
          items: [
            "GetwithUs shall not be responsible for indirect, incidental, or consequential losses arising from the use of our services.",
            "We shall not be responsible for losses caused by inaccurate information or materials supplied by clients.",
            "We shall not be responsible for failures arising from third-party services beyond our reasonable control.",
          ],
        },
        {
          type: "p",
          text: "Nothing in these Terms excludes liability that cannot legally be excluded. Any additional liability limits will be specified in the relevant project agreement.",
        },
      ],
    },
    {
      id: "cancellation-and-termination",
      title: "Cancellation and termination",
      blocks: [
        {
          type: "p",
          text: "Either party may request termination of a project in accordance with the relevant project agreement. Upon termination:",
        },
        {
          type: "ul",
          items: [
            "The client must pay for work completed and approved expenses incurred up to the termination date, as provided in the agreement.",
            "Any applicable refunds will be handled according to the agreed payment and cancellation terms.",
            "Unpaid deliverables may be withheld until outstanding amounts are settled.",
            "Confidentiality obligations will continue to apply.",
            "Intellectual property rights will be handled according to the payment and ownership provisions of the agreement.",
          ],
        },
      ],
    },
    {
      id: "prohibited-use",
      title: "Prohibited use",
      blocks: [
        { type: "p", text: "Clients and website users must not:" },
        {
          type: "ul",
          items: [
            "Use our services for illegal activities.",
            "Submit malicious software or harmful code.",
            "Violate intellectual property rights.",
            "Attempt unauthorised access to our systems.",
            "Misuse our website or communication channels.",
            "Request software intended to facilitate fraud, cybercrime, or other unlawful activities.",
          ],
        },
        {
          type: "p",
          text: "GetwithUs reserves the right to refuse or discontinue services involving unlawful or prohibited activities.",
        },
      ],
    },
    {
      id: "website-availability",
      title: "Website availability",
      blocks: [
        {
          type: "p",
          text: "We aim to maintain the availability and functionality of our website. However, we do not guarantee uninterrupted access. We may temporarily suspend website access for maintenance, security updates, or technical reasons.",
        },
      ],
    },
    {
      id: "changes-to-these-terms",
      title: "Changes to these terms",
      blocks: [
        {
          type: "p",
          text: "GetwithUs reserves the right to update these Terms when necessary. Updated Terms will be published on our website with a revised last updated date.",
        },
        {
          type: "p",
          text: "Continued use of our website after publication of updated Terms constitutes acceptance to the extent permitted by applicable law.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law and jurisdiction",
      blocks: [
        {
          type: "p",
          text: "These Terms shall be governed by the laws of India.",
        },
        {
          type: "p",
          text: "Any disputes arising from these Terms shall be subject to the jurisdiction of the competent courts in India, subject to applicable law and any separate dispute resolution agreement between the parties.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "p",
          text: "For questions about these Terms and Conditions, please contact us at connect@getwithus.in or visit getwithus.in.",
        },
        {
          type: "p",
          text: "By using our website or engaging our services, you acknowledge that you have read and agreed to these Terms and Conditions.",
        },
      ],
    },
  ],
};
