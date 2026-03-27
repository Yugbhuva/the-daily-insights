import { FileText } from 'lucide-react';

const LAST_UPDATED = 'March 27, 2026';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the website, mobile applications, newsletters, APIs, or any other services provided by The Daily Insights Network ("The Daily Insights", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and any additional guidelines or rules applicable to specific features.

If you do not agree to these Terms, you must not access or use our services. We reserve the right to update these Terms at any time. Your continued use of our services following the posting of revised Terms constitutes your acceptance of the changes.

These Terms apply to all visitors, registered users, contributors, and advertisers who access or use our services.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 16 years of age to use our services. By agreeing to these Terms, you represent and warrant that you are of legal age to form a binding contract and are not a person barred from receiving our services under the laws of any applicable jurisdiction.

If you are using our services on behalf of a company, organisation, or other entity, you represent that you have the authority to bind that entity to these Terms, in which case "you" refers to that entity.`,
  },
  {
    id: 'account',
    title: '3. Accounts & Registration',
    content: `**Account Creation**: To access certain features, you may be required to register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date.

**Account Security**: You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must notify us immediately at support@thedailyinsights.com of any unauthorised use of your account.

**Account Termination**: We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we determine violates these Terms, is harmful to other users or third parties, or for any other reason at our sole discretion.

**One Account Per Person**: You may not create multiple accounts for the purpose of circumventing restrictions or bans.`,
  },
  {
    id: 'content',
    title: '4. Content & Intellectual Property',
    content: `**Our Content**: All content published on The Daily Insights — including articles, photographs, graphics, videos, data, and software — is owned by or licensed to The Daily Insights and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit our content without our express prior written permission.

**Limited Licence**: We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use our services and content for personal, non-commercial purposes only. This licence does not include any rights to scrape, data-mine, or commercially exploit our content.

**Attribution**: Where we permit republication (e.g., through an RSS feed or syndication agreement), you must provide clear and prominent attribution to The Daily Insights with a link to the original article.

**Trademarks**: "The Daily Insights", our logo, and all related names, logos, product and service names, and slogans are trademarks of The Daily Insights Network. You may not use our trademarks without our prior written consent.`,
  },
  {
    id: 'user-content',
    title: '5. User-Generated Content',
    content: `**Your Content**: Our services may allow you to post comments, submit news tips, letters, or other content ("User Content"). You retain ownership of your User Content, but by submitting it you grant The Daily Insights a worldwide, non-exclusive, royalty-free, perpetual, irrevocable licence to use, reproduce, modify, publish, translate, and distribute your User Content in any medium.

**Content Standards**: You agree that your User Content will not:
- Contain false, misleading, defamatory, obscene, or offensive material
- Infringe any third-party intellectual property, privacy, or publicity rights
- Constitute spam, unsolicited advertising, or commercial solicitation
- Violate any applicable law or regulation
- Impersonate any person or entity or misrepresent your affiliation with any person or entity

**Moderation**: We reserve the right (but not the obligation) to review, edit, or remove any User Content at our sole discretion and without notice. We do not endorse any User Content or any opinion, recommendation, or advice expressed therein.

**Reporting**: If you believe any content on our platform violates these Terms or applicable law, please report it to content@thedailyinsights.com.`,
  },
  {
    id: 'prohibited-conduct',
    title: '6. Prohibited Conduct',
    content: `You agree not to engage in any of the following:

- Using our services for any unlawful purpose or in violation of any laws
- Attempting to gain unauthorised access to our systems, accounts, or networks
- Transmitting any malware, spyware, or other malicious code
- Engaging in any form of automated data collection (scraping, crawling, or harvesting) without our written consent
- Interfering with or disrupting the integrity or performance of our services
- Circumventing any access control or copy-protection mechanisms
- Using our services to harass, threaten, or intimidate other users or our staff
- Creating accounts for the purpose of violating these Terms after prior termination
- Misrepresenting your identity or affiliation in any way`,
  },
  {
    id: 'third-party',
    title: '7. Third-Party Links & Services',
    content: `Our services may contain links to third-party websites, services, or advertisements. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.

Your dealings with third-party service providers found on or through our services, including payment processors and advertisers, are solely between you and such third parties. We encourage you to review the terms and privacy policies of any third-party sites you visit.`,
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers',
    content: `**Accuracy of Content**: While we strive for accuracy and fairness in all our reporting, The Daily Insights makes no warranty that our content is complete, accurate, or up to date. News and current events content may become outdated after publication.

**No Professional Advice**: Nothing on our platform constitutes legal, financial, medical, or other professional advice. You should not rely on information on our site as an alternative to advice from a qualified professional.

**Service Availability**: Our services are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that our services will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    id: 'limitation',
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, The Daily Insights Network, its directors, employees, partners, agents, suppliers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses, arising out of or in connection with:

- Your access to or use of (or inability to access or use) our services
- Any conduct or content of any third party on our services
- Any content obtained from our services
- Unauthorised access, use, or alteration of your transmissions or content

Our total liability to you for any claims arising under these Terms shall not exceed the greater of £100 or the amounts you have paid to us in the twelve months prior to the claim.

Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for certain types of damages. Accordingly, some of the above limitations may not apply to you.`,
  },
  {
    id: 'indemnification',
    title: '10. Indemnification',
    content: `You agree to defend, indemnify, and hold harmless The Daily Insights Network and its directors, officers, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from:

- Your use of our services
- Your violation of these Terms
- Your violation of any third-party rights, including intellectual property or privacy rights
- Any User Content you submit to our platform`,
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Dispute Resolution',
    content: `These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.

**Informal Resolution**: Before filing a formal claim, you agree to attempt to resolve any dispute informally by contacting us at legal@thedailyinsights.com. We will attempt to resolve the dispute within 30 days.

**Formal Disputes**: If informal resolution fails, disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. If you are a consumer residing in the EU, you may also use the European Commission's Online Dispute Resolution platform.

**Class Action Waiver**: To the extent permitted by applicable law, you waive any right to participate in a class action lawsuit or class-wide arbitration against The Daily Insights.`,
  },
  {
    id: 'termination',
    title: '12. Termination',
    content: `We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use our services will immediately cease.

Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to: ownership provisions, warranty disclaimers, indemnity, and limitations of liability.

You may stop using our services at any time. If you have an account, you may request deletion by emailing support@thedailyinsights.com.`,
  },
  {
    id: 'general',
    title: '13. General Provisions',
    content: `**Entire Agreement**: These Terms, together with our Privacy Policy and any other legal notices published by us, constitute the entire agreement between you and The Daily Insights regarding your use of our services.

**Severability**: If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.

**Waiver**: Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.

**Assignment**: You may not assign or transfer your rights under these Terms without our prior written consent. We may assign our rights and obligations without restriction.

**Contact**: For any questions about these Terms, please contact us at legal@thedailyinsights.com or write to: The Daily Insights Network, 123 Press Lane, London, EC1A 1BB, United Kingdom.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-20 px-4">
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-3xl" />
        <div className="relative container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <FileText size={14} /> Legal
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
            Terms of <span className="text-red-500">Service</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Last updated: <span className="text-zinc-200 font-medium">{LAST_UPDATED}</span>
          </p>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
            Please read these Terms of Service carefully before using The Daily Insights. These Terms govern your access to and use of our website, applications, and services.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl grid lg:grid-cols-4 gap-12">

          {/* Sticky ToC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Contents</p>
              <ul className="space-y-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors leading-relaxed block"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {sections.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-black tracking-tight mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  {s.title}
                </h2>
                <div className="space-y-3">
                  {s.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('**') && para.endsWith('**') && !para.slice(2, -2).includes('**')) {
                      return (
                        <p key={i} className="font-bold text-zinc-800 dark:text-zinc-200 mt-4">
                          {para.slice(2, -2)}
                        </p>
                      );
                    }
                    const parts = para.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={i} className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        {parts.map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j} className="text-zinc-800 dark:text-zinc-200">{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
