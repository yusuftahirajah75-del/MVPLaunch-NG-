/**
 * MVPLaunch NG - Proposals Service
 */
const proposalsRepo = require('./proposals.repository');
const projectsRepo = require('../projects/projects.repository');
const db = require('../../config/db');
const ApiError = require('../../utils/apiError');
const { ROLES, PROPOSAL_STATUS, PROJECT_STATUS } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class ProposalsService {
  async createProposal(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Referenced project not found.');
    }

    if (user.role === ROLES.DEVELOPER && project.developer_id && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const validUntil = new Date(Date.now() + (data.validUntilDays || 14) * 24 * 60 * 60 * 1000);

    const proposal = await proposalsRepo.create({
      projectId: data.projectId,
      developerId: user.id,
      title: data.title,
      priceNgn: data.priceNgn,
      durationDays: data.durationDays,
      deliverables: data.deliverables,
      terms: data.terms,
      validUntil
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROPOSAL_CREATED',
      entityType: 'PROPOSAL',
      entityId: proposal.id,
      req,
      details: { projectId: data.projectId, priceNgn: data.priceNgn }
    });

    return proposal;
  }

  async getProposalsByProject(projectId, user) {
    const project = await projectsRepo.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT && project.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && project.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to project proposals.');
    }

    return proposalsRepo.findByProjectId(projectId);
  }

  async getProposalById(id, user) {
    const proposal = await proposalsRepo.findById(id);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found.');
    }

    if (
      user.role === ROLES.CLIENT && proposal.client_id !== user.id ||
      user.role === ROLES.DEVELOPER && proposal.developer_id !== user.id
    ) {
      throw ApiError.forbidden('Unauthorized access to this proposal.');
    }

    return proposal;
  }

  async respondToProposal(id, action, user, req) {
    const proposal = await proposalsRepo.findById(id);
    if (!proposal) {
      throw ApiError.notFound('Proposal not found.');
    }

    if (user.role !== ROLES.ADMIN && proposal.client_id !== user.id) {
      throw ApiError.forbidden('Only the project client can accept or decline this proposal.');
    }

    if (proposal.status !== PROPOSAL_STATUS.PENDING) {
      throw ApiError.badRequest(`Cannot respond: proposal is already ${proposal.status}.`);
    }

    if (action === 'DECLINE') {
      const updated = await proposalsRepo.updateStatus(id, PROPOSAL_STATUS.DECLINED);
      await recordAuditLog({
        userId: user.id,
        action: 'PROPOSAL_DECLINED',
        entityType: 'PROPOSAL',
        entityId: id,
        req
      });
      return { proposal: updated, message: 'Proposal declined.' };
    }

    // ACCEPT: Run atomic multi-table transaction
    const result = await db.transaction(async (client) => {
      // 1. Update proposal status
      const updatedProposalRes = await client.query(
        `UPDATE proposals SET status = 'ACCEPTED' WHERE id = $1 RETURNING *`,
        [id]
      );
      const updatedProposal = updatedProposalRes.rows[0];

      // 2. Update project status to ACCEPTED
      await client.query(
        `UPDATE projects SET status = 'ACCEPTED' WHERE id = $1`,
        [proposal.project_id]
      );

      // 3. Create Order
      const orderRes = await client.query(
        `INSERT INTO orders 
          (project_id, proposal_id, client_id, total_amount_ngn, payment_status, contract_signed_at, status)
         VALUES ($1, $2, $3, $4, 'PENDING', CURRENT_TIMESTAMP, 'PENDING_PAYMENT')
         RETURNING *`,
        [proposal.project_id, id, proposal.client_id, proposal.price_ngn]
      );
      const order = orderRes.rows[0];

      // 4. Create standard initial milestones for the project
      const m1Amount = Math.round(proposal.price_ngn * 0.3);
      const m2Amount = Math.round(proposal.price_ngn * 0.4);
      const m3Amount = proposal.price_ngn - (m1Amount + m2Amount);

      await client.query(
        `INSERT INTO milestones (project_id, title, description, order_index, amount_ngn, status)
         VALUES 
          ($1, 'Phase 1: Architecture, Core Schemas & Auth', 'Foundational setup and core data models', 1, $2, 'PENDING'),
          ($1, 'Phase 2: Core User Workflows & Integrations', 'Interactive business features and third-party APIs', 2, $3, 'PENDING'),
          ($1, 'Phase 3: Testing, Deployment & Handover', 'End-to-end testing, live deployment and GitHub transfer', 3, $4, 'PENDING')`,
        [proposal.project_id, m1Amount, m2Amount, m3Amount]
      );

      return { proposal: updatedProposal, order };
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROPOSAL_ACCEPTED_ORDER_GENERATED',
      entityType: 'ORDER',
      entityId: result.order.id,
      req,
      details: { proposalId: id, totalAmountNgn: proposal.price_ngn }
    });

    return {
      proposal: result.proposal,
      order: result.order,
      message: 'Proposal accepted! Project activated and initial milestones generated.'
    };
  }
}

module.exports = new ProposalsService();
