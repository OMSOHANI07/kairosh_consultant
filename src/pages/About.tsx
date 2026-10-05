import { UserRound } from 'lucide-react'
import { CtaBanner, SectionHeading } from '../components/CtaBanner'
import { LinkedinIcon } from '../components/SocialIcons'
import { about } from '../content/about'
import { usePageMeta } from '../hooks/usePageMeta'

function Photo({ src, alt, className }: { src?: string; alt: string; className: string }) {
  if (src) return <img src={src} alt={alt} loading="lazy" decoding="async" className={`${className} object-cover`} />
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600/50`} role="img" aria-label={`${alt} (placeholder)`}>
      <UserRound className="h-1/3 w-1/3" aria-hidden="true" />
    </div>
  )
}

export default function About() {
  usePageMeta({ path: '/about' })
  const { hero, founderStory, mission, team, teamPhoto } = about

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 text-center sm:py-24">
          <p className="eyebrow">About us</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl sm:text-5xl">{hero.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{hero.subtitle}</p>
        </div>
      </section>

      <section className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
        <Photo src={founderStory.photoUrl} alt={founderStory.photoAlt} className="aspect-[4/5] w-full rounded-3xl" />
        <div>
          <h2 className="text-3xl">{founderStory.heading}</h2>
          <div className="mt-4 space-y-4 text-slate-600">
            {founderStory.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Mission" title={mission.heading} intro={mission.statement} />
          <div className="grid gap-6 md:grid-cols-3">
            {mission.values.map((v, i) => (
              <div key={i} className="card p-6">
                <h3 className="text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Team" title={team.heading} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((m, i) => (
            <div key={i} className="card overflow-hidden">
              <Photo src={m.photoUrl} alt={m.name} className="aspect-square w-full" />
              <div className="p-5">
                <h3 className="text-lg">{m.name}</h3>
                <p className="text-sm font-medium text-brand-700">{m.role}</p>
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
          <Photo src={teamPhoto.url} alt="Our team" className="aspect-[21/9] w-full rounded-3xl" />
          <figcaption className="mt-3 text-center text-sm text-slate-500">{teamPhoto.caption}</figcaption>
        </figure>
      </section>

      <CtaBanner title="Want to work with us?" text="Book a free consultation and tell us about your goals." location="about" />
    </>
  )
}
