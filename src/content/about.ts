// =============================================================================
// ABOUT PAGE CONTENT. Everything on /about comes from this file.
// Replace every "PLACEHOLDER" with your own text. Image URLs can be absolute
// (https://...) or files you put in /public (for example '/team/om.jpg').
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
    title: 'PLACEHOLDER: We help businesses grow online',
    subtitle:
      'PLACEHOLDER: One or two sentences about who you are and who you help. Keep it short and specific.',
  },

  founderStory: {
    heading: 'Our story',
    // Each string is one paragraph.
    paragraphs: [
      'PLACEHOLDER: How and why you started the business. What problem did you keep seeing?',
      'PLACEHOLDER: What you have done since: the kinds of clients, results and lessons learned.',
      'PLACEHOLDER: Where you are heading next.',
    ],
    photoUrl: '', // PLACEHOLDER: e.g. '/about/founder.jpg'. Leave empty to show a placeholder.
    photoAlt: 'Founder of Kairosh Consultants',
  },

  mission: {
    heading: 'Our mission',
    statement:
      'PLACEHOLDER: A single sentence mission, e.g. “To give every small business the technology big companies have.”',
    values: [
      { title: 'PLACEHOLDER value', description: 'PLACEHOLDER: what this value means in practice.' },
      { title: 'PLACEHOLDER value', description: 'PLACEHOLDER: what this value means in practice.' },
      { title: 'PLACEHOLDER value', description: 'PLACEHOLDER: what this value means in practice.' },
    ],
  },

  team: {
    heading: 'Meet the team',
    members: [
      { name: 'PLACEHOLDER Name', role: 'Founder', bio: 'PLACEHOLDER: short bio.', photoUrl: '' },
      { name: 'PLACEHOLDER Name', role: 'Web Developer', bio: 'PLACEHOLDER: short bio.', photoUrl: '' },
      { name: 'PLACEHOLDER Name', role: 'AI Automation Engineer', bio: 'PLACEHOLDER: short bio.', photoUrl: '' },
    ] as TeamMember[],
  },

  teamPhoto: {
    url: '', // PLACEHOLDER: a group photo, e.g. '/about/team.jpg'
    caption: 'PLACEHOLDER: caption for your team photo',
  },
}
