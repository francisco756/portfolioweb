/**
 * Case study content. Each entry becomes /cases/<slug>.html
 * (the HTML shell lives in /cases, the content here).
 */
export interface CaseStudy {
  slug: string
  /** Project id in projects.ts */
  project: string
  headline: string
  intro: string
  challenge: string
  did: string[]
  stack: string[]
  result: string
}

export const cases: CaseStudy[] = [
  {
    slug: 'leadi',
    project: 'leadi',
    headline: 'An AI sales agent that works WhatsApp around the clock.',
    intro:
      'Leadi is the agency’s own product: a CRM for businesses that sell over WhatsApp. I designed and built it from scratch, from the data model to the AI agent that talks to customers.',
    challenge:
      'Businesses that sell over WhatsApp lose leads after hours and whenever the team is busy. Leadi had to answer every conversation instantly, qualify the lead and keep following up, while plugging into the tools those businesses already use for stock, sales and ads.',
    did: [
      'Designed and built the whole product in TypeScript with Next.js 14 and React, styled with Tailwind CSS.',
      'An AI agent on the Claude and OpenAI APIs that answers, qualifies and follows up with customers 24/7.',
      'WhatsApp messaging through Kapso, with follow-ups and background jobs queued on Redis and BullMQ.',
      'Data in PostgreSQL with Prisma.',
      'Integrations with Bsale, Shopify, Tiendanube, Jumpseller, Meta and Google Ads.',
      'A custom MCP server, so the CRM can be queried and reviewed straight from Claude.',
      'More than 2,000 automated tests with Vitest, and automatic deploys on Railway.',
    ],
    stack: [
      'TypeScript',
      'Next.js 14',
      'React',
      'Tailwind CSS',
      'PostgreSQL',
      'Prisma',
      'Redis',
      'BullMQ',
      'Claude API',
      'OpenAI API',
      'MCP',
      'Kapso (WhatsApp)',
      'Vitest',
      'Railway',
    ],
    result:
      'Leadi is live at leadicrm.com and runs WhatsApp sales conversations for the agency’s clients, with more than 2,000 tests checking every deploy.',
  },
  {
    slug: 'nomad-sushi',
    project: 'nomad-sushi',
    headline: 'A premium sushi brand, coded by hand.',
    intro:
      'Nomad is the second brand of Antro, an omakase restaurant in Buenos Aires. I redesigned its website and built it without a page builder, in plain HTML, CSS and TypeScript.',
    challenge:
      'Nomad brings the care of an omakase kitchen to delivery and take-away. The site had to feel as premium as the food and still get people to the menu and to their order quickly.',
    did: [
      'Premium redesign built around large food photography and a bold type system.',
      'Hand-coded in HTML, CSS and TypeScript, with no CMS or page builder.',
      'Scroll-driven sections that walk through each combo piece by piece, with ordering and WhatsApp contact always one tap away.',
      'A lightweight static build that is fast to load and simple to host.',
    ],
    stack: ['HTML', 'CSS', 'TypeScript'],
    result: 'Live at nomad-sushi.vercel.app.',
  },
  {
    slug: 'multiphone-chile',
    project: 'multiphone-chile',
    headline: 'A Shopify store for Chile’s phone repair technicians.',
    intro:
      'Multiphone sells replacement parts, tools and equipment to phone repair technicians across Chile. I renewed its Shopify store.',
    challenge:
      'A large catalog of screens, batteries, hydrogel film, machines and tools, sold to professionals who care about stock, wholesale pricing and fast dispatch. The store had to make that catalog easy to browse and keep those reasons to buy in plain sight.',
    did: [
      'Renewed the Shopify store, organizing navigation around the main product categories.',
      'Home page sections for liquidation deals, featured brands, machines and tools.',
      'Same-day dispatch, wholesale pricing for technicians, warranty and nationwide shipping kept visible across the store.',
      'Customer reviews and a WhatsApp quote form for wholesale requests.',
    ],
    stack: ['Shopify', 'Liquid', 'CSS', 'JavaScript'],
    result: 'Live at multiphonechile.cl.',
  },
]

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug)!
