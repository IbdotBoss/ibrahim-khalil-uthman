export type Column = { key: string; label: string; width?: string; hideOnMobile?: boolean };

export type Rec = {
  id: string;
  name: string;
  href?: string;
  fields: Record<string, string>;
  problem?: string;
  built?: string;
  /** false = keep the detail for the CV but do not print it on the site list */
  siteDetail?: boolean;
  /** Public source. Separate from href, which is where the thing actually runs. */
  repo?: string;
  /** Chosen for the CV. The CV is the edited record, the site is the full one. */
  onCv?: boolean;
  /** One line for the site's table. problem and built stay the CV's bullets, so
      the two pages say different things rather than the same thing twice. */
  brief?: string;
  /** Basename in public/shots. The screenshot links to href, same as the name. */
  shot?: string;
};

export type Application = {
  id: string;
  name: string;
  view?: "list" | "form" | "links";
  columns: Column[];
  records: Rec[];
};

export const profile = {
  name: "Ibrahim Khalil Uthman",
  greenIndex: 15,
  timezone: "Europe/London",
};

export const about = {
  id: "about",
  name: "About",
  lines: [
    "Let’s tinker and figure things out. I do my best work alongside others, whether I’m untangling a tricky problem or building something from scratch.",
  ],
  caution: "This user is not a fan of good enough.",
};

export const applications: Application[] = [
  {
    id: "experience",
    name: "Experience",
    columns: [
      { key: "name", label: "Role", width: "30%" },
      { key: "company", label: "Company", width: "24%" },
      { key: "type", label: "Type", width: "14%", hideOnMobile: true },
      { key: "period", label: "Period", width: "20%" },
    ],
    records: [
      {
        id: "sn-developer",
        brief:
          "Automation and integration on the platform: Business Rules, Client Scripts, REST APIs out to other systems, and custom applications built to order.",
        name: "ServiceNow Developer",
        fields: {
          company: "Doublelight Technology",
          type: "Part-time",
          period: "May 2026 — present",
        },
        siteDetail: false,
        problem:
          "Automates enterprise workflows with Business Rules and Client Scripts, streamlining ITSM and asset processes.",
        built:
          "Builds and configures REST APIs for real-time integration between ServiceNow and external platforms, and develops custom applications, Service Catalog items and Flow Designer actions.",
      },
      {
        id: "sn-admin",
        brief:
          "Roles, groups, ACLs and security policy across the platform environments, plus CMDB integrity, form and dashboard configuration, and Tier-2 support.",
        name: "ServiceNow Administrator",
        fields: {
          company: "Doublelight Technology",
          type: "Internship",
          period: "May — Sep 2025",
        },
        siteDetail: false,
        problem:
          "Administered user roles, group memberships, Access Control Lists and security policies across platform environments.",
        built:
          "Maintained CMDB data integrity, configured system properties and form layouts, built dashboards and reports, and delivered Tier-2 platform support.",
      },
      {
        id: "asset-manager",
        brief:
          "The full lifecycle of hardware and software licences, from allocation and audit through to compliant decommissioning.",
        name: "Hardware & Software Asset Manager",
        fields: {
          company: "Doublelight Technology",
          type: "Internship",
          period: "May — Sep 2024",
        },
        siteDetail: false,
        problem:
          "Managed the full lifecycle of IT hardware and software licence allocation.",
        built:
          "Ran inventory and licence audits, kept the estate compliant, and tracked allocations, subscriptions and secure decommissioning under governance policy.",
      },
      {
        id: "hardware-asset",
        brief:
          "Physical asset tracking through onboarding and offboarding, keeping the central inventory accurate and coordinating refresh cycles with other departments.",
        name: "Hardware Asset Manager",
        fields: { company: "Innovastra", type: "Full-time", period: "Jul — Dec 2023" },
        siteDetail: false,
        problem:
          "Tracked physical IT assets, hardware distribution and device reclamation through employee onboarding and offboarding.",
        built:
          "Kept centralised inventory records accurate to minimise loss, and coordinated hardware refresh cycles and physical storage with other departments.",
      },
      {
        id: "data-entry",
        brief:
          "High-volume operational and asset records, audited in Excel to catch inconsistencies and duplicates.",
        name: "Data Entry Specialist",
        fields: { company: "Innovastra", type: "Full-time", period: "May — Jul 2023" },
        siteDetail: false,
        problem:
          "Entered and verified high volumes of operational and asset records into company databases.",
        built:
          "Ran routine auditing in Excel to find and correct inconsistencies and duplicates across those records.",
      },
    ],
  },
  {
    id: "skills",
    name: "Skills",
    columns: [
      { key: "name", label: "Area", width: "26%" },
      { key: "value", label: "Detail" },
    ],
    records: [
      {
        id: "sk-servicenow",
        name: "ServiceNow",
        fields: {
          value:
            "Business Rules, Client Scripts, Flow Designer, Service Catalog, REST integrations, ACLs and role governance, CMDB, reporting and dashboards.",
        },
      },
      {
        id: "sk-languages",
        name: "Languages",
        fields: { value: "JavaScript, TypeScript, Python, Java" },
      },
      {
        id: "sk-frontend",
        name: "Frontend",
        fields: { value: "React, Next.js, React Native, Tailwind CSS" },
      },
      {
        id: "sk-backend",
        name: "Backend",
        fields: { value: "Node.js, Express, Flask" },
      },
      {
        id: "sk-data",
        name: "Data",
        fields: { value: "PostgreSQL, MongoDB, SQLite, advanced Excel" },
      },
      {
        id: "sk-tools",
        name: "Tools",
        fields: { value: "Git, Docker, AWS, CI/CD, NGINX, Vercel" },
      },
    ],
  },
  {
    id: "certifications",
    name: "Certifications",
    columns: [
      { key: "name", label: "Certification", width: "40%" },
      { key: "issuer", label: "Issuer", width: "24%" },
      { key: "code", label: "Code", width: "16%", hideOnMobile: true },
      { key: "year", label: "Year", width: "12%" },
    ],
    records: [
      {
        id: "cad",
        name: "Certified Application Developer",
        fields: { issuer: "ServiceNow", code: "CAD", year: "2026" },
      },
      {
        id: "csa",
        name: "Certified System Administrator",
        fields: { issuer: "ServiceNow", code: "CSA", year: "2024" },
      },
      {
        id: "aws-cf",
        name: "AWS Academy Graduate, Cloud Foundations",
        fields: { issuer: "AWS", code: "—", year: "2026" },
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    view: "form",
    columns: [
      { key: "name", label: "Course", width: "34%" },
      { key: "institution", label: "Institution", width: "26%" },
      { key: "result", label: "Result", width: "22%", hideOnMobile: true },
      { key: "period", label: "Period", width: "18%" },
    ],
    records: [
      {
        id: "beng",
        name: "BEng Computer Science",
        fields: {
          institution: "Anglia Ruskin, Cambridge",
          result: "Predicted first class",
          period: "Jan 2024 — Dec 2026",
        },
        problem:
          "Modules: algorithm analysis and data structures, software engineering, computer systems, digital security.",
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    columns: [
      { key: "name", label: "Name", width: "24%" },
      { key: "state", label: "State", width: "12%" },
      { key: "stack", label: "Stack", hideOnMobile: true },
      { key: "year", label: "Year", width: "10%" },
    ],
    records: [
      {
        id: "servicenow-jobs-digest",
        onCv: true,
        name: "ServiceNow Jobs Digest",
        href: "https://ibdotboss.github.io/servicenow-jobs-digest/",
        repo: "https://github.com/IbdotBoss/servicenow-jobs-digest",
        shot: "servicenow-jobs-digest",
        fields: { state: "active", stack: "Python", year: "2026" },
        problem:
          "UK ServiceNow roles are scattered across five job boards, and most listings hide whether the company can sponsor.",
        built:
          "A daily aggregator across JobServe, LinkedIn, ServiceNow Careers, Nelson Frank and Hunt UK. No algorithm ever claims sponsorship is verified. The licenced flag says the company can sponsor and the reader decides about the role.",
      },
      {
        id: "cad-quiz",
        onCv: true,
        name: "CAD Quiz",
        href: "https://ibdotboss.github.io/cad-quiz/",
        repo: "https://github.com/IbdotBoss/cad-quiz",
        shot: "cad-quiz",
        fields: { state: "shipped", stack: "JavaScript · GitHub Pages", year: "2026" },
        problem:
          "Every CAD practice bank online is scraped from exam dumps, and a wrong answer taught confidently is worse than no answer.",
        built:
          "282 questions with every answer adjudicated against ServiceNow’s own documentation rather than practice sites. The audit found real errors, including a claim that GlideRecord is unavailable client side. Items that could not be settled say so instead of asserting.",
      },
      {
        id: "curate",
        name: "Curate",
        shot: "curate",
        fields: { state: "active", stack: "Next.js · SQLite", year: "2026" },
        problem: "Mass applying produces a hundred weak applications. The bottleneck is evidence, not volume.",
        built:
          "One job listing and one verified profile become one defensible application package. Every claim traces to something in the profile or it does not ship.",
      },
      {
        id: "wallet-talk",
        onCv: true,
        name: "Wallet Talk",
        href: "https://wallet-talk.vercel.app/",
        repo: "https://github.com/IbdotBoss/wallet-talk",
        shot: "wallet-talk",
        fields: { state: "shipped", stack: "Next.js · XMTP · Privy", year: "2026" },
        problem: "End-to-end encrypted wallet-to-wallet messaging, with no database and no server-held history.",
        built:
          "Peer to peer over XMTP with network-level history sync. Traced a P0 crash to infinite recursion in a custom logger after minification renamed the object, and fixed a stream leak creating a client per session. 39 passing unit tests.",
      },
      {
        id: "nansta",
        name: "Nansta",
        href: "https://nansta-next.vercel.app/",
        repo: "https://github.com/IbdotBoss/nansta",
        shot: "nansta",
        fields: { state: "shipped", stack: "Next.js · Python · Flask", year: "2026" },
        problem: "Wanted to understand how capital actually moves across chains.",
        built:
          "DeFi analytics across Ethereum, Solana, Base and Arbitrum via the Nansen API. A three-phase pipeline with a custom client that handles each endpoint’s quirks, plus weekly reports delivered to Discord.",
      },
      {
        id: "lunar-shift",
        name: "Lunar Shift",
        href: "https://lunar-shift.vercel.app/",
        repo: "https://github.com/IbdotBoss/lunar-shift",
        shot: "lunar-shift",
        fields: { state: "shipped", stack: "Next.js · satori", year: "2026" },
        problem: "Converting Gregorian birthdays to Hijri dates, fast enough to feel instant.",
        built:
          "Cut 4,000 Intl calls on mount to a cached per-year lookup. Rebuilt the date picker in three stages after the standard one proved unusable for older users.",
      },
      {
        id: "faja",
        name: "faja",
        href: "https://faja-builds.vercel.app/",
        repo: "https://github.com/IbdotBoss/faja-site",
        shot: "faja",
        fields: { state: "shipped", stack: "Next.js · GSAP", year: "2026" },
        problem:
          "faja is a digital agency. We build websites, apps, automation, and AI agents for small businesses and solopreneurs.",
        built:
          "Three layers, one idea: we pull everything to its absolute limit so your business can operate beyond its own.",
      },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    view: "links",
    columns: [
      { key: "name", label: "Channel", width: "24%" },
      { key: "handle", label: "Handle", width: "46%" },
      { key: "note", label: "Note", hideOnMobile: true },
    ],
    records: [
      {
        id: "email",
        name: "Email",
        href: "mailto:uthmanibrahimkhalil@gmail.com",
        fields: { handle: "uthmanibrahimkhalil@gmail.com", note: "best route" },
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/iku101",
        fields: { handle: "in/iku101", note: "" },
      },
      {
        id: "github",
        name: "GitHub",
        href: "https://github.com/IbdotBoss",
        fields: { handle: "IbdotBoss", note: "" },
      },
      {
        id: "x",
        name: "X",
        href: "https://x.com/IbdotBoss",
        fields: { handle: "@IbdotBoss", note: "" },
      },
      {
        id: "cv",
        name: "CV",
        href: "/cv",
        fields: { handle: "reads on screen, prints clean", note: "" },
      },
    ],
  },
];
