/**
 * MVPLaunch NG - Trusted Pricing Packages Configuration
 * Server-authoritative package pricing, deliverables, timelines, and exclusions.
 * Never trust prices submitted by the frontend client.
 */

const PACKAGES = {
  'student-starter': {
    id: 'student-starter',
    name: 'Student Starter',
    priceNgn: 5000,
    priceKobo: 500000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Student Friendly',
    targetAudience: 'Nigerian students & final year project builders',
    tagline: 'Personal portfolio or project landing page for Nigerian students',
    deliverable: 'A personal portfolio website or simple project landing page.',
    timeline: '3–5 Business Days upon receiving content',
    ctaText: 'Get Started — ₦5,000',
    popular: false,
    features: [
      'Mobile-responsive personal design',
      'Projects & accomplishments showcase section',
      'Bio, skills summary & verified social links',
      'Direct contact or WhatsApp enquiry trigger',
      'Deployment assistance on free hosting (Vercel / Render)'
    ],
    exclusions: [
      'No user authentication or database accounts',
      'No custom backend API or payment integration',
      'No custom domain purchase included (domain cost extra)',
      'Single-page layout (up to 4 focused sections)'
    ],
    terms: {
      revisions: 'Up to 2 rounds of minor revisions within 7 days of delivery.',
      deliveryProcess: 'Submit project text & image links -> Draft review -> Final deployment & handover.',
      cancellationPolicy: 'Full refund if cancelled before development begins; pro-rated after initial layout.'
    }
  },
  'mvp-starter': {
    id: 'mvp-starter',
    name: 'MVP Starter',
    priceNgn: 15000,
    priceKobo: 1500000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Most Popular for Founders',
    targetAudience: 'Aspiring founders and early-stage entrepreneurs in Nigeria',
    tagline: 'Simple startup landing page or agreed MVP prototype for early-stage founders',
    deliverable: 'A simple startup landing page or agreed MVP prototype.',
    timeline: '5–7 Business Days upon scope sign-off',
    ctaText: 'Launch Your MVP — ₦15,000',
    popular: true,
    features: [
      'Compelling product introduction & value proposition',
      'Lead-capture waitlist form or customer enquiry trigger',
      'Responsive interface optimized for Nigerian mobile speeds',
      'Key feature highlights & call-to-action sections',
      'Basic staging / production deployment setup'
    ],
    exclusions: [
      'No complex multi-role backend or custom database clustering',
      'No e-commerce cart with automated inventory dispatch',
      'Third-party paid API subscription costs not included',
      'Single-page web prototype (up to 6 sections)'
    ],
    terms: {
      revisions: 'Up to 3 rounds of minor revisions within 10 days of delivery.',
      deliveryProcess: 'Scope agreement -> Staging prototype build -> Review & lead form testing -> Handover.',
      cancellationPolicy: 'Refundable prior to milestone draft sign-off minus 15% scoping fee.'
    }
  },
  'business-launch': {
    id: 'business-launch',
    name: 'Business Launch',
    priceNgn: 35000,
    priceKobo: 3500000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Small Business Growth',
    targetAudience: 'Small businesses & commercial service providers in Nigeria',
    tagline: 'Basic business website with agreed service or product pages',
    deliverable: 'A basic business website with agreed service or product pages.',
    timeline: '7–10 Business Days upon receiving assets',
    ctaText: 'Launch Your Business — ₦35,000',
    popular: false,
    features: [
      'Multi-section business website (Home, Services, About, Contact)',
      'Customer enquiry & quote request functionality',
      'Mobile-first responsive design tailored for local clients',
      'Basic SEO setup (meta tags, OpenGraph preview, title hierarchy)',
      'Production deployment and complete asset handover'
    ],
    exclusions: [
      'No automated monthly recurring billing or complex escrow engine',
      'Custom domain registration fee billed directly by domain registrar',
      'Client provides company text, logos, and product photos',
      'Up to 4 distinct views / agreed sections'
    ],
    terms: {
      revisions: 'Up to 3 rounds of revisions within 14 days of delivery.',
      deliveryProcess: 'Content handover -> Prototype demonstration -> Feedback adjustments -> Live deployment.',
      cancellationPolicy: 'Refundable prior to live staging launch minus 20% preparatory fee.'
    }
  }
};

/**
 * Retrieve package by ID
 * @param {string} packageId
 * @returns {object|null}
 */
function getPackageById(packageId) {
  if (!packageId) return null;
  const key = String(packageId).toLowerCase().trim().replace(/_/g, '-');
  return PACKAGES[key] || null;
}

/**
 * Return all available packages as array
 */
function getAllPackages() {
  return Object.values(PACKAGES);
}

module.exports = {
  PACKAGES,
  getPackageById,
  getAllPackages
};
