// =============================================================================
// SERVICE PAGE CONTENT for /services/website and /services/ai.
// Portfolio items and testimonials are NOT here: they load live from the
// database and are managed from /admin.
// =============================================================================

export type Category = 'website' | 'ai'

export type ServiceContent = {
  category: Category
  path: string
  navLabel: string
  eyebrow: string
  title: string
  intro: string
  offerings: { title: string; description: string }[]
  process: string[]
  portfolioHeading: string
  portfolioIntro: string
  testimonialsHeading: string
  ctaTitle: string
  ctaText: string
}

export const services: Record<Category, ServiceContent> = {
  website: {
    category: 'website',
    path: '/services/website',
    navLabel: 'Website Building',
    eyebrow: 'Website Building',
    title: 'Websites that load fast and win customers',
    intro:
      'PLACEHOLDER: We design and build modern, mobile-first websites for small and growing businesses, from a one-page landing site to a full online store, and we look after hosting, SEO and updates so you can focus on your business.',
    offerings: [
      { title: 'Business websites', description: 'PLACEHOLDER: Clean, professional sites that explain what you do and get enquiries.' },
      { title: 'Landing pages', description: 'PLACEHOLDER: High-converting pages for campaigns, launches and ads.' },
      { title: 'E-commerce', description: 'PLACEHOLDER: Online stores with payments, inventory and order notifications.' },
      { title: 'SEO & performance', description: 'PLACEHOLDER: Fast load times, good Lighthouse scores and on-page SEO.' },
      { title: 'Maintenance', description: 'PLACEHOLDER: Updates, backups, security fixes and content changes.' },
      { title: 'Redesigns', description: 'PLACEHOLDER: Give an outdated site a modern look without losing your rankings.' },
    ],
    process: ['Free consultation', 'Design & content plan', 'Build & review', 'Launch & support'],
    portfolioHeading: 'Websites we have built',
    portfolioIntro: 'A selection of recent projects. Click any card to visit the live site.',
    testimonialsHeading: 'What our website clients say',
    ctaTitle: 'Ready for a website that works as hard as you do?',
    ctaText: 'Book a free 30-minute consultation and get a clear plan, timeline and quote.',
  },
  ai: {
    category: 'ai',
    path: '/services/ai',
    navLabel: 'AI Automation',
    eyebrow: 'AI Automation',
    title: 'AI automation that gives your team hours back',
    intro:
      'PLACEHOLDER: We find the repetitive work in your business (lead follow-ups, data entry, document handling, reporting, customer support) and replace it with reliable AI-powered workflows that connect the tools you already use.',
    offerings: [
      { title: 'Lead capture & follow-up', description: 'PLACEHOLDER: Instantly reply to and qualify enquiries from your site, WhatsApp or email.' },
      { title: 'Customer support bots', description: 'PLACEHOLDER: Answer common questions 24/7 and hand off to humans when needed.' },
      { title: 'Document processing', description: 'PLACEHOLDER: Extract data from invoices, forms and PDFs into your systems.' },
      { title: 'Reporting & dashboards', description: 'PLACEHOLDER: Automatic daily or weekly reports sent to your inbox.' },
      { title: 'Tool integrations', description: 'PLACEHOLDER: Connect your CRM, sheets, email and payment tools together.' },
      { title: 'Custom AI assistants', description: 'PLACEHOLDER: Internal assistants trained on your own documents and processes.' },
    ],
    process: ['Discovery call', 'Workflow audit', 'Build & test', 'Deploy & monitor'],
    portfolioHeading: 'Automation projects & case studies',
    portfolioIntro: 'Demos and case studies from automations we have delivered.',
    testimonialsHeading: 'What our automation clients say',
    ctaTitle: 'What could you automate this month?',
    ctaText: 'Book a free consultation and we will map out your first automation together.',
  },
}
