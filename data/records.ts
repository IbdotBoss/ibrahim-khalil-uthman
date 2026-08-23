export type State = "shipped" | "active" | "archived";

export type Record = {
  id: string;
  name: string;
  state: State;
  meta: string;
  year: string;
  problem?: string;
  built?: string;
  href?: string;
  rich?: boolean;
};

export type Application = {
  id: string;
  name: string;
  records: Record[];
};

export const profile = {
  name: "Uthman Ibrahim",
  greenIndex: 8,
  timezone: "Europe/London",
};

export const about = {
  id: "about",
  name: "About",
  placeholder: true,
  lines: [
    "Placeholder. Two or three sentences go here, in Stage's own voice.",
    "What he makes, what he does that others skip, what he wants next.",
  ],
};

export const applications: Application[] = [
  {
    id: "projects",
    name: "Projects",
    records: [
      {
        id: "servicenow-jobs-digest",
        name: "servicenow jobs digest",
        state: "active",
        meta: "python",
        year: "2026",
        problem: "UK ServiceNow roles are scattered across five job boards and most listings hide whether the company can sponsor.",
        built: "A daily aggregator across JobServe, LinkedIn, ServiceNow Careers, Nelson Frank and Hunt UK. No algorithm ever claims sponsorship is verified. The licenced flag says the company can sponsor and the reader decides about the role.",
        rich: true,
      },
      {
        id: "cad-quiz",
        name: "cad quiz",
        state: "shipped",
        meta: "js · github pages",
        year: "2026",
        problem: "Every CAD practice bank online is scraped from exam dumps, and a wrong answer taught confidently is worse than no answer.",
        built: "282 questions with every answer adjudicated against ServiceNow's own documentation rather than practice sites. The audit found real errors, including a claim that GlideRecord is unavailable client side. Items that could not be settled say so instead of asserting.",
        href: "https://ibdotboss.github.io/cad-quiz/",
        rich: true,
      },
      {
        id: "curate",
        name: "curate",
        state: "active",
        meta: "next · sqlite",
        year: "2026",
        problem: "Mass applying produces a hundred weak applications. The bottleneck is evidence, not volume.",
        built: "One job listing and one verified profile become one defensible application package. Every claim traces to something in the profile or it does not ship.",
        rich: true,
      },
      {
        id: "wallet-talk",
        name: "wallet talk",
        state: "shipped",
        meta: "next · xmtp · privy",
        year: "2026",
        problem: "Encrypted messaging between wallets, with a production crash nobody could reproduce.",
        built: "Traced a P0 to infinite recursion in a custom logger, where minification renamed xlog to kye and the object called a method that no longer existed. Also fixed an XMTP stream leak creating a client per session. 39 unit tests.",
        rich: true,
      },
      {
        id: "nansta",
        name: "nansta",
        state: "shipped",
        meta: "next · viem",
        year: "2026",
        problem: "Wanted to understand how complex systems aggregate information.",
        built: "Smart money intelligence over the Nansen API. The codebase documents payload quirks for every endpoint it touches.",
      },
      {
        id: "lunar-shift",
        name: "lunar shift",
        state: "shipped",
        meta: "next · satori",
        year: "2026",
        problem: "Converting Gregorian birthdays to Hijri dates, fast enough to feel instant.",
        built: "Cut 4,000 Intl calls on mount to a cached per-year lookup. Rebuilt the date picker in three stages after the standard one proved unusable for older users.",
      },
      {
        id: "faja",
        name: "faja",
        state: "shipped",
        meta: "next · gsap",
        year: "2026",
        problem: "An agency site where the motion had to feel deliberate rather than decorative.",
        built: "Everything is held before it moves. No bounce, no spring, no elastic return. A one pixel horizontal band snaps on viewport enter and retracts on scroll out.",
        rich: true,
      },
    ],
  },
  {
    id: "experience",
    name: "Experience",
    records: [
      { id: "outlier", name: "Outlier", state: "active", meta: "AI generalist · freelance", year: "2025" },
      { id: "alignerr", name: "Alignerr", state: "archived", meta: "digital annotator · freelance", year: "2025" },
      { id: "innovastra", name: "Innovastra", state: "archived", meta: "data entry specialist", year: "2024" },
    ],
  },
  {
    id: "certifications",
    name: "Certifications",
    records: [
      { id: "cad", name: "ServiceNow CAD", state: "shipped", meta: "Certified Application Developer", year: "2026" },
    ],
  },
  {
    id: "education",
    name: "Education",
    records: [
      { id: "beng", name: "BEng computer science", state: "shipped", meta: "Anglia Ruskin, Cambridge", year: "2025" },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    records: [
      { id: "linkedin", name: "LinkedIn", state: "active", meta: "in/uthman", year: "", href: "https://www.linkedin.com/" },
      { id: "x", name: "X", state: "active", meta: "@uthman", year: "", href: "https://x.com/" },
      { id: "github", name: "GitHub", state: "active", meta: "IbdotBoss", year: "", href: "https://github.com/IbdotBoss" },
      { id: "email", name: "Email", state: "active", meta: "uthmanibrahimkhalil@gmail.com", year: "", href: "mailto:uthmanibrahimkhalil@gmail.com" },
      { id: "cv", name: "CV", state: "active", meta: "print or save", year: "", href: "/cv" },
    ],
  },
];

export const allRecords = applications.flatMap((a) =>
  a.records.map((r) => ({ ...r, appId: a.id, appName: a.name }))
);
