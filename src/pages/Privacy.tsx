import type { ReactNode } from 'react'
import { PageHero } from '../components/CtaBanner'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'

const LAST_UPDATED = '5 October 2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-slate-600">{children}</div>
    </section>
  )
}

export default function Privacy() {
  usePageMeta({ path: '/privacy' })

  return (
    <>
    <PageHero eyebrow="Legal" title="Privacy Policy" text={`Last updated: ${LAST_UPDATED}`} />
    <article className="container-page max-w-3xl py-16 sm:py-20">
      <p className="mt-6 text-slate-600">
        This policy explains what personal data {site.name} (“we”, “us”) collects through {site.url}, why we collect it,
        and the choices you have. We process personal data in line with India’s Digital Personal Data Protection Act,
        2023 (“DPDP Act”). <strong>PLACEHOLDER: have this policy reviewed by a legal professional before launch.</strong>
      </p>

      <Section title="1. Data we collect">
        <p><strong>Before you accept cookies</strong> we only record an anonymous count of which page was viewed. No identifier, device or location data is stored.</p>
        <p><strong>After you accept cookies</strong> we also collect:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>A random visitor ID and session ID stored in your browser’s local storage.</li>
          <li>Pages you view, time spent on each page, and clicks on calls to action and portfolio links.</li>
          <li>How you reached us: the referring website and campaign (UTM) parameters.</li>
          <li>Device type, browser, operating system, screen size and language.</li>
          <li>Approximate country and city, derived from your IP address by a third-party geolocation service (we do not store your IP address).</li>
        </ul>
        <p><strong>Information you give us:</strong> your name, email, phone number and message when you submit the contact form, and your email or mobile number if you choose to sign in.</p>
      </Section>

      <Section title="2. Why we collect it">
        <ul className="list-disc space-y-1 pl-6">
          <li>To reply to your enquiry and provide the services you ask about.</li>
          <li>To understand which pages and services are most useful, and improve the website.</li>
          <li>If you sign in, to link your visits together so we can follow up with relevant information.</li>
        </ul>
        <p>We do not sell your personal data and we do not use it for third-party advertising.</p>
      </Section>

      <Section title="3. Legal basis and consent">
        <p>
          Analytics beyond anonymous page counts only start after you click <em>Accept</em> on the cookie banner. Contact
          form and sign-in data are processed because you provide them to us for a specific purpose. You can withdraw
          consent at any time using <em>Cookie settings</em> in the footer; withdrawing removes the identifiers stored in your browser.
        </p>
      </Section>

      <Section title="4. Where data is stored and who processes it">
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Neon</strong> (database and authentication). Data is hosted in the AWS Asia Pacific (Singapore) region.</li>
          <li><strong>GitHub Pages</strong> (website hosting), which may log technical request data.</li>
          <li><strong>GeoJS</strong> (approximate location lookup, only after consent).</li>
          <li>An email delivery provider used to send sign-in codes.</li>
        </ul>
      </Section>

      <Section title="5. How long we keep it">
        <p>
          Enquiries and customer records are kept for as long as needed to serve you and for up to 3 years after our
          last contact. Analytics data is kept for up to 24 months. <strong>PLACEHOLDER: adjust these periods to your practice.</strong>
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          Under the DPDP Act you can ask to access, correct or erase your personal data, withdraw consent, and nominate
          another person to exercise your rights. To make a request or raise a grievance, email{' '}
          <a href={`mailto:${site.email}`} className="text-brand-700 underline">{site.email}</a>. We will respond within
          a reasonable time. If you are not satisfied, you may complain to the Data Protection Board of India.
        </p>
      </Section>

      <Section title="7. Children">
        <p>This website is intended for businesses and adults. We do not knowingly collect data from children under 18.</p>
      </Section>

      <Section title="8. Changes">
        <p>We may update this policy. The “last updated” date above shows when it was last changed.</p>
      </Section>
    </article>
    </>
  )
}
