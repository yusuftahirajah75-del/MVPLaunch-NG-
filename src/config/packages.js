/**
 * MVPLaunch NG - Trusted Pricing Packages Configuration
 * Server-authoritative package pricing, deliverables, timelines, and exclusions.
 * Never trust prices submitted by the frontend client.
 */

const PACKAGES = {
  'idea-validation': {
    id: 'idea-validation',
    name: 'Idea Validation Starter',
    priceNgn: 15000,
    priceKobo: 1500000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Idea Stage',
    targetAudience: 'Aspiring creators & people with an untested idea',
    tagline: 'Validate your concept before spending money writing code',
    idealCustomer: 'Anyone with an early idea who wants to confirm real demand before spending on software development.',
    problemSolved: 'Eliminates uncertainty, prevents wasted savings on building features nobody wants, and pinpoints your paying audience.',
    deliverable: 'A concrete 5-part Idea Validation Blueprint & action plan tailored to the Nigerian market.',
    timeline: '2–3 Business Days',
    ctaText: 'Validate My Idea — ₦15,000',
    popular: false,
    features: [
      'Problem clarification & core value proposition mapping',
      'Target customer persona & ICP definition (Nigerian market)',
      'Local competitor analysis & differentiation breakdown',
      '10 structured customer interview questions for Nigerian users',
      'Practical step-by-step validation action plan'
    ],
    exclusions: [
      'Does not guarantee market demand, sales, or investor funding',
      'No custom code, website development, or design prototyping',
      'No paid survey ads or participant recruitment fees included'
    ],
    terms: {
      revisions: '1 round of scoping refinements within 5 days of delivery.',
      deliveryProcess: 'Idea intake brief -> Discovery analysis -> Action blueprint delivery.',
      cancellationPolicy: 'Full refund if cancelled before research begins.'
    }
  },
  'student-project': {
    id: 'student-project',
    name: 'Student Project Launch',
    priceNgn: 20000,
    priceKobo: 2000000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Nigerian Students',
    targetAudience: 'Undergraduates, polytechnic students & final year project builders',
    tagline: 'Professional project showcase or personal portfolio that stands out',
    idealCustomer: 'Nigerian students who need a clean, impressive portfolio or project showcase for defenses, job applications, or internship presentations.',
    problemSolved: 'Replaces unhosted code and messy screenshots with a live, responsive web portfolio that impresses supervisors and employers.',
    deliverable: 'A modern, responsive portfolio or project showcase website deployed live on free-tier cloud hosting.',
    timeline: '3–5 Business Days',
    ctaText: 'Launch Student Project — ₦20,000',
    popular: false,
    features: [
      'Modern, mobile-responsive single-page layout (up to 4 sections)',
      'Project showcase block with architecture & features highlights',
      'Bio, skills matrix, resume download & verified social links',
      'Direct WhatsApp or email contact trigger',
      'Live deployment on free cloud hosting (Vercel / Render)',
      'Clean GitHub repository handoff with setup instructions'
    ],
    exclusions: [
      'No academic ghostwriting, thesis preparation, or dishonest academic work',
      'No complex backend databases or user authentication systems',
      'Paid custom domains (.com / .ng) billed separately by registrar if desired'
    ],
    terms: {
      revisions: 'Up to 2 rounds of minor adjustments within 7 days of delivery.',
      deliveryProcess: 'Submit project text & screenshots -> Draft review -> Final deployment & handover.',
      cancellationPolicy: 'Full refund if cancelled before development begins.'
    }
  },
  'founder-mvp': {
    id: 'founder-mvp',
    name: 'Founder MVP Launch',
    priceNgn: 35000,
    priceKobo: 3500000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Most Popular for Founders',
    targetAudience: 'Early-stage startup founders & digital product creators in Nigeria',
    tagline: 'High-converting MVP landing page with lead capture to test real traction',
    idealCustomer: 'Founders who need a live, persuasive product page to capture waitlist leads and test traction before spending millions on software.',
    problemSolved: 'Solves the "build in secret for months with 0 users" trap by giving you a live, credible launch presence in days.',
    deliverable: 'A focused, conversion-optimized MVP landing page with working waitlist / lead-capture form and live cloud deployment.',
    timeline: '5–7 Business Days',
    ctaText: 'Launch Founder MVP — ₦35,000',
    popular: true,
    features: [
      'High-converting MVP landing page (Hero, Problem, Features, FAQ, CTA)',
      'Lead-capture waitlist form connected to Google Sheets or database',
      'Mobile-first responsive design optimized for Nigerian data speeds',
      'Social share preview meta tags (OpenGraph & Twitter Card)',
      'Live production cloud deployment (Render / Vercel)',
      'Complete GitHub repository transfer & handover'
    ],
    exclusions: [
      'No complex multi-role backend SaaS engines or native mobile apps',
      'Single-page web prototype (up to 6 core sections)',
      'Third-party paid API subscriptions or SMS gateway fees not included',
      'Custom domain registration fee billed directly by domain registrar'
    ],
    terms: {
      revisions: 'Up to 3 rounds of minor revisions within 10 days of prototype delivery.',
      deliveryProcess: 'Scope sign-off -> Interactive prototype -> Lead form testing -> Live deployment & handover.',
      cancellationPolicy: 'Refundable before prototype build begins minus 10% scoping fee.'
    }
  },
  'business-digital': {
    id: 'business-digital',
    name: 'Business Digital Launch',
    priceNgn: 50000,
    priceKobo: 5000000,
    paymentType: 'ONE_TIME',
    currency: 'NGN',
    badge: 'Small Business Growth',
    targetAudience: 'Nigerian SMEs, merchants, service providers & consultants',
    tagline: 'Professional multi-section business website with WhatsApp lead capture',
    idealCustomer: 'Small businesses and commercial service brands that need professional digital credibility and direct WhatsApp sales inquiries.',
    problemSolved: 'Ends online invisibility and lost sales by giving local customers a fast, credible business presence that routes inquiries straight to WhatsApp.',
    deliverable: 'A multi-section professional business website with service/product showcase, 1-click WhatsApp chat, and live deployment.',
    timeline: '7–10 Business Days',
    ctaText: 'Launch Business Site — ₦50,000',
    popular: false,
    features: [
      'Multi-section business website (Home, Services/Products, About, Contact)',
      'Services or products showcase catalog with photos, descriptions & pricing',
      '1-click WhatsApp contact integration with custom inquiry messages',
      'Google Maps location embed & direct phone call links',
      'Basic on-page SEO setup (meta tags, title hierarchy & search previews)',
      'Production deployment, DNS linking assistance, and full asset handover'
    ],
    exclusions: [
      'Full-scale multi-vendor e-commerce with automated warehousing',
      'Custom domain purchase (.com.ng / .ng) billed directly by registrar',
      'Client provides company logo, photos, and basic service descriptions',
      'Up to 4 distinct structured views/sections'
    ],
    terms: {
      revisions: 'Up to 3 rounds of revisions within 14 days of prototype delivery.',
      deliveryProcess: 'Asset collection -> Prototype demo -> Feedback iteration -> Production deployment.',
      cancellationPolicy: 'Refundable prior to development launch minus 15% preparatory fee.'
    }
  }
};

/**
 * Backward compatibility aliases for previous package identifiers
 */
const LEGACY_ALIASES = {
  'student-starter': 'student-project',
  'mvp-starter': 'founder-mvp',
  'business-launch': 'business-digital'
};

/**
 * Retrieve package by ID (supports new IDs, legacy aliases, and underscore variants)
 * @param {string} packageId
 * @returns {object|null}
 */
function getPackageById(packageId) {
  if (!packageId) return null;
  const key = String(packageId).toLowerCase().trim().replace(/_/g, '-');
  if (PACKAGES[key]) {
    return PACKAGES[key];
  }
  if (LEGACY_ALIASES[key] && PACKAGES[LEGACY_ALIASES[key]]) {
    return PACKAGES[LEGACY_ALIASES[key]];
  }
  return null;
}

/**
 * Return all 4 current packages as an ordered array
 */
function getAllPackages() {
  return [
    PACKAGES['idea-validation'],
    PACKAGES['student-project'],
    PACKAGES['founder-mvp'],
    PACKAGES['business-digital']
  ];
}

module.exports = {
  PACKAGES,
  getPackageById,
  getAllPackages
};
