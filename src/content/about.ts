// =============================================================================
// ABOUT PAGE CONTENT. Everything on /about comes from this file.
// Image URLs can be absolute (https://...) or files you put in /public
// (for example '/team/om.jpg'). Leave a photoUrl empty to show a placeholder.
// =============================================================================

export type TeamMember = {
  name: string
  role: string
  bio: string
  photoUrl?: string
  linkedin?: string
}

export const about = {
  hero: {
    title: 'Engineers and managers building for small businesses',
    subtitle:
      'We are a group of engineering and management professionals who automate workflows for SMEs and build websites at a very affordable price.',
  },

  founderStory: {
    heading: 'Our story',
    // Each string is one paragraph.
    paragraphs: [
      'Kairosh Consultants started with a simple observation: small and medium businesses lose hours every week to repetitive work such as answering the same enquiries, copying data between tools and chasing follow-ups. Many still do not have a website that properly represents them.',
      'Our team brings together engineers who build the technology and management professionals who understand how a business actually runs. That mix lets us find the work worth automating, build a solution that fits your process, and explain it in plain language.',
      'Big companies have had this kind of technology for years. Our goal is to make modern websites and AI automation affordable for every SME, without the agency price tag.',
    ],
    photoUrl: '', // e.g. '/about/founder.jpg'. Leave empty to show a placeholder.
    photoAlt: 'Om S, founder of Kairosh Consultants',
  },

  mission: {
    heading: 'Our mission',
    statement: 'To give every small and medium business affordable access to websites and automation that save time and help them grow.',
    values: [
      {
        title: 'Affordable by design',
        description: 'Clear, fixed pricing that fits an SME budget. You pay for results, not for big-agency overheads.',
      },
      {
        title: 'Engineering meets business',
        description: 'Engineers and management professionals work together, so every solution is technically solid and makes business sense.',
      },
      {
        title: 'Built around your workflow',
        description: 'We automate the way you already work, then improve it step by step, with no disruption and no jargon.',
      },
    ],
  },

  team: {
    heading: 'Meet the team',
    members: [
      {
        name: 'Om S',
        role: 'Founder',
        bio: 'Leads Kairosh Consultants and works with every client to turn slow, manual processes into simple automated workflows and modern websites.',
        photoUrl: '', // e.g. '/team/om.jpg'
        linkedin: '', // e.g. 'https://www.linkedin.com/in/your-profile'
      },
    ] as TeamMember[],
  },

  teamPhoto: {
    url: '', // a group photo, e.g. '/about/team.jpg'. Empty uses the default office photo.
    caption: 'Engineers and management professionals, working together for SMEs.',
  },
}
