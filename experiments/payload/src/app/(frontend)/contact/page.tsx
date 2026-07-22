import config from '@payload-config'
import Image from 'next/image'
import { getPayload } from 'payload'

import { SiteHeader } from '@/components/site/SiteHeader'
import { mediaImageURL } from '@/lib/media-url'

type ContactCard = {
  description: string
  id?: null | string
  numberLabel?: null | string
  title: string
}
type ContactRepository = {
  description: string
  id?: null | string
  name: string
  openIssues: number
  repositoryURL?: null | string
}

export default async function ContactPage() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
  const aboutCards: ContactCard[] = settings.contactAboutCards || []
  const repositories: ContactRepository[] = settings.contactRepositories || []
  const joinSteps: ContactCard[] = settings.contactJoinSteps || []
  const contactSteps: ContactCard[] = settings.contactSteps || []
  const configuredQRCode = mediaImageURL(settings.contactQRCode)
  const qrCodeURL = configuredQRCode || '/images/contact-qr-placeholder.svg'

  return (
    <>
      <SiteHeader active="contact" siteName={settings.siteName || undefined} />
      <main className="contact-page">
        <header className="contact-intro">
          <span className="eyebrow">{settings.contactEyebrow}</span>
          <h1>{settings.contactTitle}</h1>
          <p>{settings.contactIntro}</p>
        </header>

        <section className="contact-about-section">
          <h2 className="contact-section-title">{settings.contactAboutTitle}</h2>
          <div className="manifesto">
            <span>{settings.contactMissionLabel}</span>
            <h2>{settings.contactMission}</h2>
          </div>
          <div className="contact-grid">
            {aboutCards.map((card) => (
              <article key={card.id || card.title}>
                <span>{card.numberLabel}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <h2 className="contact-section-title">{settings.contactGithubTitle}</h2>
          <p className="contact-section-description">{settings.contactGithubIntro}</p>
          <div className="contact-github-layout">
            <div className="contact-repositories">
              <h3>{settings.contactRepositoriesTitle}</h3>
              <div className="repository-list">
                {repositories.map((repository) => {
                  const content = (
                    <>
                      <strong>{repository.name}</strong>
                      <span>{repository.description}</span>
                      <b>
                        {repository.openIssues ?? 0}{' '}
                        {settings.contactOpenIssuesLabel}　·　
                        {settings.contactRepositoryMetaLabel}
                      </b>
                    </>
                  )

                  return repository.repositoryURL ? (
                    <a
                      className="repository-card"
                      href={repository.repositoryURL}
                      key={repository.id || repository.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="repository-card" key={repository.id || repository.name}>
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="contact-join-flow">
              <h3>{settings.contactJoinTitle}</h3>
              <ol>
                {joinSteps.map((step) => (
                  <li key={step.id || step.title}>
                    <strong>
                      {step.numberLabel}　{step.title}
                    </strong>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2 className="contact-section-title">{settings.contactQRSectionTitle}</h2>
          <p className="contact-section-description">{settings.contactQRIntro}</p>
          <div className="contact-qr-layout">
            <div className="contact-information">
              <h3>{settings.contactQRTitle}</h3>
              <p>{settings.contactQRDescription}</p>
              <div className="contact-inner-divider" />
              <ol>
                {contactSteps.map((step) => (
                  <li key={step.id || step.title}>
                    <strong>
                      {step.numberLabel}　{step.title}
                    </strong>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="contact-qr-card">
              <Image
                alt={
                  configuredQRCode &&
                  settings.contactQRCode &&
                  typeof settings.contactQRCode === 'object'
                    ? settings.contactQRCode.alt
                    : '社群二维码占位'
                }
                className="contact-qr-image"
                height={260}
                loading="eager"
                src={qrCodeURL}
                unoptimized
                width={260}
              />
              <strong>{settings.contactQRLabel}</strong>
              <span>{settings.contactQRNote}</span>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
