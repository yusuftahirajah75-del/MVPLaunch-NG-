/**
 * MVPLaunch NG - Global Platform Constants
 */
module.exports = {
  ROLES: {
    CLIENT: 'CLIENT',
    DEVELOPER: 'DEVELOPER',
    ADMIN: 'ADMIN'
  },

  IDEA_STATUS: {
    SUBMITTED: 'SUBMITTED',
    IN_REVIEW: 'IN_REVIEW',
    CLARIFIED: 'CLARIFIED',
    PROPOSAL_GENERATED: 'PROPOSAL_GENERATED',
    REJECTED: 'REJECTED'
  },

  PROJECT_STATUS: {
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
    AWAITING_PROJECT_SUBMISSION: 'AWAITING_PROJECT_SUBMISSION',
    SUBMITTED: 'SUBMITTED',
    ADMIN_SCOPING: 'ADMIN_SCOPING',
    AWAITING_ENGINEER: 'AWAITING_ENGINEER',
    ENGINEER_ASSIGNED: 'ENGINEER_ASSIGNED',
    IN_DEVELOPMENT: 'IN_DEVELOPMENT',
    INTERNAL_REVIEW: 'INTERNAL_REVIEW',
    REVISION_REQUIRED: 'REVISION_REQUIRED',
    APPROVED: 'APPROVED',
    DELIVERED: 'DELIVERED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    DRAFT: 'DRAFT',
    ACCEPTED: 'ACCEPTED'
  },

  PROPOSAL_STATUS: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    EXPIRED: 'EXPIRED'
  },

  ORDER_STATUS: {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    DISPUTED: 'DISPUTED',
    CANCELLED: 'CANCELLED'
  },

  PAYMENT_STATUS: {
    INITIALIZED: 'INITIALIZED',
    SUCCESSFUL: 'SUCCESSFUL',
    FAILED: 'FAILED',
    VERIFIED: 'VERIFIED'
  },

  ORDER_PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PARTIAL: 'PARTIAL',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED'
  },

  MILESTONE_STATUS: {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    PAID: 'PAID'
  },

  TASK_STATUS: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
  },

  TASK_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
  },

  FILE_CATEGORY: {
    SPEC: 'SPEC',
    DESIGN: 'DESIGN',
    ASSET: 'ASSET',
    CODE_DELIVERABLE: 'CODE_DELIVERABLE',
    RECEIPT: 'RECEIPT',
    OTHER: 'OTHER'
  },

  DEPLOYMENT_ENV: {
    STAGING: 'STAGING',
    PRODUCTION: 'PRODUCTION',
    PREVIEW: 'PREVIEW'
  },

  HANDOVER_STATUS: {
    PREPARING: 'PREPARING',
    SUBMITTED: 'SUBMITTED',
    ACCEPTED: 'ACCEPTED'
  },

  MAINTENANCE_STATUS: {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    CANCELLED: 'CANCELLED'
  },

  DEFAULT_CURRENCY: 'NGN',

  INDUSTRIES: [
    'EdTech',
    'FinTech',
    'HealthTech',
    'AgriTech',
    'E-commerce',
    'SaaS',
    'Cybersecurity',
    'AI / Machine Learning',
    'AI Agents / Automation',
    'Web3 / Blockchain',
    'GovTech',
    'LegalTech',
    'PropTech / Real Estate',
    'InsurTech',
    'Logistics / Delivery',
    'Transportation / Mobility',
    'TravelTech',
    'FoodTech',
    'RetailTech',
    'FashionTech',
    'SportsTech',
    'MediaTech',
    'EntertainmentTech',
    'Social / Community',
    'HRTech / Recruitment',
    'CareerTech',
    'Creator Economy',
    'MarketingTech',
    'AdTech',
    'ClimateTech / CleanTech',
    'EnergyTech',
    'ConstructionTech',
    'ManufacturingTech',
    'IndustrialTech',
    'BeautyTech',
    'FitnessTech',
    'EventTech',
    'HospitalityTech',
    'Nonprofit / NGO',
    'Religious / Community Services',
    'Student / Campus Solutions',
    'Productivity / Collaboration',
    'Developer Tools',
    'B2B / Enterprise',
    'Marketplace',
    'Booking / Reservation',
    'FinOps / Accounting',
    'Security / Trust & Verification',
    'Other / Custom'
  ]
};
