import { Chip, CtaBanner, PageHero, SectionHeading } from '../components/CtaBanner'
import { LinkedinIcon } from '../components/SocialIcons'
import { about } from '../content/about'
import { usePageMeta } from '../hooks/usePageMeta'

/** Shows the image if one is set in src/content/about.ts; otherwise nothing. */
function Photo({ src, alt, className }: { src?: string; alt: string; className: string }) {
  if (!src) return null
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`${className} object-cover`} />
}

export default function About() {
  usePageMeta({ path: '/about' })
  const { hero, founderStory, mission, team, teamPhoto } = about

  return (
    <>
      <PageHero eyebrow="About Us" title={hero.title} text={hero.subtitle} image="/images/meeting.webp" />

      <section className="py-20">
        <div className={`container-page grid items-center gap-12 ${founderStory.photoUrl ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
          <Photo src={founderStory.photoUrl} alt={founderStory.photoAlt} className="aspect-[4/5] w-full rounded-3xl" />
          <div>
            <Chip>Our Story</Chip>
            <h2 className="mt-4 text-3xl sm:text-4xl">{founderStory.heading}</h2>
            <div className="mt-5 space-y-4 text-slate-600">
              {founderStory.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Mission" title={mission.heading} intro={mission.statement} align="split" />
          <div className="grid gap-6 md:grid-cols-3">
            {mission.values.map((v, i) => (
              <div key={i} className={`rounded-3xl p-7 ${i === 1 ? 'bg-accent-400' : i === 2 ? 'bg-brand-900' : 'bg-white'}`}>
                <span className={`text-sm font-bold ${i === 2 ? 'text-accent-400' : 'text-ink/80'}`}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={`mt-4 text-lg ${i === 2 ? 'text-white' : ''}`}>{v.title}</h3>
                <p className={`mt-2 text-sm ${i === 2 ? 'text-brand-100' : i === 1 ? 'text-ink/75' : 'text-slate-600'}`}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Team" title={team.heading} />
          <div
            className={`mx-auto grid gap-6 ${
              team.members.length === 1 ? 'max-w-sm' : team.members.length === 2 ? 'max-w-3xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {team.members.map((m, i) => (
              <div key={i} className={`overflow-hidden rounded-3xl bg-cream ${m.photoUrl ? '' : 'border-t-4 border-accent-400'}`}>
                <Photo src={m.photoUrl} alt={m.name} className="aspect-square w-full" />
                <div className="p-6">
                  <h3 className="text-lg">{m.name}</h3>
                  <p className="text-sm font-semibold text-brand-600">{m.role}</p>
                  <p className="mt-2 text-sm text-slate-600">{m.bio}</p>
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-slate-500 hover:text-brand-700" aria-label={`${m.name} on LinkedIn`}>
                      <LinkedinIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <figure className="mt-12">
            <Photo src={teamPhoto.url || '/images/office.webp'} alt="Our team" className="aspect-[21/9] w-full rounded-3xl" />
            <figcaption className="mt-3 text-center text-sm text-slate-500">{teamPhoto.caption}</figcaption>
          </figure>
        </div>
      </section>

      <CtaBanner title="Want to work with us?" text="Book a free consultation and tell us about your goals." location="about" />
    </>
  )
}
