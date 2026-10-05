// HOME PAGE CONTENT. Edit headlines, section copy and images here.
// Images live in /public/images (free Unsplash photos; replace with your own).

export const home = {
  topBar: {
    tagline: 'Website building & AI automation agency',
  },
  hero: {
    badge: 'Free 30-minute consultation',
    // Rendered in uppercase. `highlight` is shown in the lime accent colour.
    titleBefore: 'Smarter websites,',
    highlight: 'AI-powered',
    titleAfter: 'growth',
    subtitle:
      'We build fast, modern websites and AI automation workflows that bring in more customers and take repetitive work off your plate.',
    primaryCta: 'Book a Free Consultation',
    image: '/images/hero.webp',
    imageMobile: '/images/hero-mobile.webp',
    imageAlt: 'Two colleagues celebrating a result at a laptop',
  },

  approach: {
    eyebrow: 'Our Approach',
    title: 'Everything you need to grow online',
    intro:
      'From a website that turns visitors into customers to automations that run your busywork in the background, we handle the technology so you can focus on the business.',
    // Three cards: light, lime, dark (in this order).
    cards: [
      { icon: 'website', title: 'Website Building', text: 'Mobile-first business websites, landing pages and online stores, built for speed and SEO.', to: '/services/website' },
      { icon: 'ai', title: 'AI Automation', text: 'AI workflows that handle leads, support, documents and reports automatically.', to: '/services/ai' },
      { icon: 'consult', title: 'Free Strategy Call', text: 'Not sure where to start? Get a clear plan, timeline and fixed quote in 30 minutes.', to: '/contact' },
    ],
  },

  whoWeAre: {
    eyebrow: 'Who We Are',
    title: 'A small team obsessed with your results',
    text: 'PLACEHOLDER: We combine modern web development with practical AI automation to help small and growing businesses compete with the big players: faster sites, smarter workflows and more time back in your week.',
    imageMain: '/images/team-laptops.webp',
    imageMainAlt: 'Team collaborating around laptops',
    imageSmall: '/images/portrait.webp',
    imageSmallAlt: 'Smiling team member',
    skillsTitle: 'What we work with',
    skills: ['Web Design', 'React', 'SEO', 'E-commerce', 'AI Agents', 'Chatbots', 'Integrations', 'Automation'],
  },

  servicesEyebrow: 'Our Services',
  servicesTitle: 'Two services, one goal: more growth with less busywork',

  whyEyebrow: 'Why Choose Us',
  whyHeading: 'Why businesses work with us',
  why: [
    { title: 'Results first', description: 'Every project starts with a clear business goal: more leads, more sales or more time.' },
    { title: 'Fast delivery', description: 'Most websites launch in 2–4 weeks and most automations in under 2 weeks.' },
    { title: 'Transparent pricing', description: 'Fixed quotes up front. No hidden fees and no lock-in.' },
    { title: 'Ongoing support', description: 'We stay with you after launch with updates, fixes and improvements.' },
  ],

  testimonialsEyebrow: 'Testimonials',
  testimonialsHeading: 'What our clients say',

  finalCta: {
    eyebrow: 'Free consultation',
    title: 'Let’s talk about your project',
    text: 'Tell us what you need. We usually reply within one business day.',
    points: ['No-obligation 30-minute call', 'Clear plan, timeline and fixed quote', 'Websites, AI automation, or both'],
  },
}
