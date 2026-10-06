import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What exactly is an MVP (Minimum Viable Product)?',
    a: 'An MVP is the most focused, usable version of your product that solves the core problem for real people. Instead of spending 6 months building 30 features that no one might use, an MVP launches the essential 3–4 features so you can test customer demand, collect payments, and learn from real feedback immediately.'
  },
  {
    q: 'Do I need to know how to code to work with you?',
    a: 'Not at all. You provide the problem understanding, domain insight, and vision. We handle the full technical architecture—database modeling, API engineering, UI design, Paystack payments, hosting, and deployment.'
  },
  {
    q: 'Can you help me define and clarify my idea?',
    a: 'Yes! That is Stage 1 and Stage 2 of our framework. We help you dissect the problem, interview or define your target Nigerian customers, and eliminate distractions so you only build what delivers immediate utility.'
  },
  {
    q: 'How long does an MVP launch take?',
    a: 'Our typical MVP Build Sprint takes 2 to 4 weeks depending on the complexity of third-party integrations. Smaller prototype finish sprints take 1 to 2 weeks. Every project receives a fixed timeline commitment before any work begins.'
  },
  {
    q: 'How much does an MVP cost?',
    a: 'We work on transparent, fixed milestone proposals. A typical Nigerian web MVP ranges between ₦450,000 to ₦1,200,000 depending on integrations (e.g. Paystack, WhatsApp webhooks, custom admin dashboards). Payments are split into 3 milestone escrow slices, released only when you approve each deliverable.'
  },
  {
    q: 'What technologies do you use?',
    a: 'We engineer production-grade modular systems with Node.js, Express.js, PostgreSQL (relational database), and React.js. We integrate Paystack for Naira payments and deploy on Render or Vercel. We do not use fragile no-code builders that lock you in.'
  },
  {
    q: 'Will my MVP be deployed online with a real URL?',
    a: 'Yes. Every project includes live staging and production deployment with automatic SSL encryption (HTTPS). You will have a live URL you can share with customers, investors, mentors, or competition judges.'
  },
  {
    q: 'Will I receive the source code (100% intellectual property)?',
    a: 'Absolutely. Upon project completion, the entire GitHub repository is transferred directly to your GitHub account, alongside database migration scripts and deployment manuals. You own 100% of your software.'
  },
  {
    q: 'Can I request changes during development?',
    a: 'Yes. Because development is structured across distinct milestones, you review each phase before moving forward. Minor adjustments within the agreed scope are incorporated dynamically.'
  },
  {
    q: 'Can you maintain and improve my MVP after launch?',
    a: 'Yes! We offer flexible monthly maintenance retainers providing dedicated engineering hours for bug fixing, security updates, server monitoring, and feature iteration based on real user feedback.'
  },
  {
    q: 'Can you help me validate the MVP with users?',
    a: 'Yes. Our platform includes a built-in user testing & validation feedback module. We guide you through onboarding your first 5–10 pilot testers, logging key findings, and measuring your initial Net Promoter Score (NPS).'
  },
  {
    q: 'Who is MVPLaunch NG built for?',
    a: 'We are built for Nigerian university students, student entrepreneurs preparing for hackathons or grant competitions, aspiring startup founders, domain experts with software ideas, and small businesses wanting custom digital tools.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) 0', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="container container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>Got Questions?</span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Everything you need to know about our Nigerian MVP launch process, pricing, intellectual property, and timelines.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3.5vw, 1.5rem)',
                  background: isOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  borderColor: isOpen ? 'var(--border-card)' : 'var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => toggle(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: isOpen ? 'var(--accent-emerald-light)' : '#fff', fontWeight: 600 }}>
                    {faq.q}
                  </h3>
                  <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-fast)',
                    color: isOpen ? 'var(--accent-emerald-light)' : 'var(--text-muted)'
                  }}>
                    <ChevronDown size={20} />
                  </div>
                </div>

                {isOpen && (
                  <p style={{
                    marginTop: '0.85rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6'
                  }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
