/**
 * MVPLaunch NG - Projects Service
 * End-to-end client service platform workflows:
 * Payment verification gating, Technical scoping, Engineer assignment, Progress tracking & Deliverables
 */
const crypto = require('crypto');
const projectsRepo = require('./projects.repository');
const ordersRepo = require('../orders/orders.repository');
const authRepo = require('../auth/auth.repository');
const db = require('../../config/db');
const ApiError = require('../../utils/apiError');
const { ROLES, PROJECT_STATUS } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .substring(0, 180) + '-' + Date.now().toString(36);
}

function parseFeatureList(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(f => typeof f === 'string' && f.trim().length > 0);
  if (typeof input === 'string') {
    return input
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(s => s.length > 0);
  }
  return [];
}

class ProjectsService {
  /**
   * Submit new Project/Idea - strictly gated behind verified payment
   */
  async submitProject(user, data, req) {
    let order = null;

    // 1. Locate and verify the paid package order
    if (data.orderId) {
      order = await ordersRepo.findById(data.orderId);
    } else if (data.paymentReference) {
      const res = await db.query(
        `SELECT o.* FROM orders o
         JOIN payments p ON p.order_id = o.id
         WHERE p.provider_reference = $1`,
        [data.paymentReference]
      );
      order = res.rows[0] || null;
    } else {
      // Look up most recent paid unsubmitted order for this client
      const res = await db.query(
        `SELECT * FROM orders
         WHERE client_id = $1 AND payment_status = 'PAID' AND project_submitted = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );
      order = res.rows[0] || null;
    }

    if (!order) {
      throw ApiError.badRequest(
        'A verified, paid package order is required before submitting a project. Please select a package and complete payment via Paystack first.'
      );
    }

    // Role-based authorization: only the order client or admin can submit
    if (user.role === ROLES.CLIENT && order.client_id !== user.id) {
      throw ApiError.forbidden('You can only submit project details for your own paid orders.');
    }

    // Payment verification check
    if (order.payment_status !== 'PAID') {
      throw ApiError.badRequest(
        `Order ${order.id} payment status is '${order.payment_status}'. Payment must be verified before submitting project details.`
      );
    }

    // Prevent accidental duplicate submission
    if (order.project_submitted && order.project_id) {
      const existingProject = await projectsRepo.findById(order.project_id);
      if (existingProject) {
        throw ApiError.conflict(
          `A project has already been submitted for this order (Project Code: ${existingProject.project_code || existingProject.id}).`
        );
      }
    }

    // Generate unique project tracking code: e.g. PRJ-4819-F2A8
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const projectCode = `PRJ-${randomDigits}-${randomHex}`;
    const slug = slugify(data.title);

    const coreFeatures = parseFeatureList(data.coreFeatures);
    const niceToHaveFeatures = parseFeatureList(data.niceToHaveFeatures);

    const project = await projectsRepo.createSubmission({
      orderId: order.id,
      clientId: order.client_id || user.id,
      projectCode,
      title: data.title.trim(),
      slug,
      organizationName: data.organizationName?.trim() || null,
      industry: data.industry || 'Other / Custom',
      problemStatement: data.problemStatement?.trim() || '',
      targetUsers: data.targetUsers?.trim() || '',
      proposedSolution: data.proposedSolution?.trim() || '',
      coreFeatures,
      niceToHaveFeatures,
      expectedOutcome: data.expectedOutcome?.trim() || null,
      existingProductUrl: data.existingProductUrl?.trim() || null,
      competitorReferences: data.competitorReferences?.trim() || null,
      designPreferences: data.designPreferences?.trim() || null,
      technicalRequirements: data.technicalRequirements?.trim() || null,
      preferredDeadline: data.preferredDeadline || null,
      selectedPackageId: order.package_id || data.selectedPackageId || null,
      selectedPackageName: order.package_name || data.selectedPackageName || null,
      paymentReference: data.paymentReference || order.paystack_reference || null,
      attachmentUrl: data.attachmentUrl || null,
      additionalNotes: data.additionalNotes?.trim() || null
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_SUBMITTED',
      entityType: 'PROJECT',
      entityId: project.id,
      req,
      details: {
        projectCode,
        title: project.title,
        orderId: order.id,
        packageName: order.package_name,
        industry: project.industry
      }
    });

    return project;
  }

  /**
   * List projects with RBAC isolation
   */
  async listProjects(user, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const offset = (page - 1) * limit;

    if (user.role === ROLES.ADMIN) {
      const { projects, total } = await projectsRepo.listAllForAdmin({
        status: query.status,
        packageId: query.packageId,
        industry: query.industry,
        search: query.search,
        limit,
        offset
      });
      return { projects, pagination: { page, limit, total } };
    }

    const { projects, total } = await projectsRepo.findByUser({
      userId: user.id,
      role: user.role,
      status: query.status,
      limit,
      offset
    });

    // Sanitize for client: remove internal admin notes and instructions
    const sanitized = projects.map(p => {
      if (user.role === ROLES.CLIENT) {
        const { admin_notes, admin_instructions, ...clientSafe } = p;
        return clientSafe;
      }
      return p;
    });

    return { projects: sanitized, pagination: { page, limit, total } };
  }

  /**
   * Get single project by ID with authorization and role sanitization
   */
  async getProjectById(id, user) {
    const project = await projectsRepo.findByIdWithDetails(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    // Role-based access control (Anti-IDOR)
    if (user.role === ROLES.CLIENT && project.client_id !== user.id) {
      throw ApiError.forbidden('You do not have permission to view this project.');
    }
    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const deliverables = await projectsRepo.getDeliverables(id);

    // Clients cannot see internal admin instructions or internal notes
    if (user.role === ROLES.CLIENT) {
      const { admin_notes, admin_instructions, ...clientSafe } = project;
      return {
        ...clientSafe,
        deliverables: deliverables.filter(d => d.status === 'APPROVED' || d.status === 'DELIVERED')
      };
    }

    // Engineers & Admins can see project notes
    const notes = await projectsRepo.getNotes(id);

    return {
      ...project,
      deliverables,
      notes
    };
  }

  /**
   * Track project by Project Code (PRJ-XXXX-XXXX)
   */
  async getProjectByCode(projectCode, user) {
    const project = await projectsRepo.findByCode(projectCode);
    if (!project) {
      throw ApiError.notFound(`Project with code '${projectCode}' not found.`);
    }

    if (user.role === ROLES.CLIENT && project.client_id !== user.id) {
      throw ApiError.forbidden('You do not have permission to view this project.');
    }
    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    return this.getProjectById(project.id, user);
  }

  /**
   * Admin scopes project technical specifications and acceptance criteria
   */
  async updateScope(id, scopeData, adminUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    const updated = await projectsRepo.updateScope(id, {
      adminNotes: scopeData.adminNotes,
      adminInstructions: scopeData.adminInstructions,
      acceptanceCriteria: scopeData.acceptanceCriteria,
      internalDeadline: scopeData.internalDeadline,
      priority: scopeData.priority || project.priority || 'NORMAL',
      status: scopeData.status || (project.status === 'SUBMITTED' ? 'ADMIN_SCOPING' : project.status)
    });

    await recordAuditLog({
      userId: adminUser.id,
      action: 'PROJECT_SCOPED',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: {
        priority: scopeData.priority,
        internalDeadline: scopeData.internalDeadline,
        status: updated.status
      }
    });

    return updated;
  }

  /**
   * Admin assigns Software Engineer
   */
  async assignEngineer(id, { developerId, instructions, priority, internalDeadline }, adminUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    let devUser = null;
    if (developerId) {
      devUser = await authRepo.findById(developerId);
      if (!devUser || devUser.role !== ROLES.DEVELOPER) {
        throw ApiError.badRequest('Selected user is not an active software engineer.');
      }
    }

    const updated = await projectsRepo.assignEngineer(id, {
      developerId: developerId || null,
      instructions,
      priority: priority || project.priority || 'NORMAL',
      internalDeadline: internalDeadline || project.internal_deadline
    });

    await recordAuditLog({
      userId: adminUser.id,
      action: developerId ? 'ENGINEER_ASSIGNED' : 'ENGINEER_UNASSIGNED',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: {
        developerId,
        developerName: devUser?.full_name || null,
        priority: updated.priority,
        deadline: updated.internal_deadline
      }
    });

    return updated;
  }

  /**
   * Engineer accepts assigned task
   */
  async acceptProject(id, developerUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (project.developer_id !== developerUser.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const updated = await projectsRepo.updateStatus(id, {
      status: 'ACCEPTED'
    });

    await recordAuditLog({
      userId: developerUser.id,
      action: 'ENGINEER_ACCEPTED_TASK',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: { projectCode: project.project_code }
    });

    return updated;
  }

  /**
   * Engineer / Admin updates development progress
   */
  async updateProgress(id, progressData, user, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const completedFeatures = progressData.completedFeatures
      ? parseFeatureList(progressData.completedFeatures)
      : null;

    let targetStatus = progressData.status || project.status;
    if (user.role === ROLES.DEVELOPER && project.status === 'ACCEPTED' && !progressData.status) {
      targetStatus = 'IN_DEVELOPMENT';
    }

    const updated = await projectsRepo.updateProgress(id, {
      progressPercent: progressData.progressPercent,
      completedFeatures: completedFeatures ? JSON.stringify(completedFeatures) : null,
      knownLimitations: progressData.knownLimitations,
      deliverableNotes: progressData.deliverableNotes,
      status: targetStatus
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_PROGRESS_UPDATED',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: {
        progressPercent: progressData.progressPercent,
        status: targetStatus
      }
    });

    return updated;
  }

  /**
   * Engineer submits project deliverable (Staging URL, Repo URL, notes)
   */
  async submitDeliverable(id, deliverableData, developerUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (project.developer_id !== developerUser.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const deliverable = await projectsRepo.addDeliverable({
      projectId: id,
      developerId: developerUser.id,
      title: deliverableData.title,
      stagingUrl: deliverableData.stagingUrl,
      repoUrl: deliverableData.repoUrl,
      productionUrl: deliverableData.productionUrl,
      notes: deliverableData.notes
    });

    // Move project to INTERNAL_REVIEW for Admin to inspect
    await projectsRepo.updateStatus(id, {
      status: 'INTERNAL_REVIEW',
      stagingUrl: deliverableData.stagingUrl,
      repoUrl: deliverableData.repoUrl,
      productionUrl: deliverableData.productionUrl
    });

    await recordAuditLog({
      userId: developerUser.id,
      action: 'DELIVERABLE_SUBMITTED',
      entityType: 'PROJECT_DELIVERABLE',
      entityId: deliverable.id,
      req,
      details: {
        projectId: id,
        projectCode: project.project_code,
        stagingUrl: deliverableData.stagingUrl
      }
    });

    return deliverable;
  }

  /**
   * Admin reviews deliverable (Approved or Revision Required)
   */
  async reviewDeliverable(deliverableId, { status, adminFeedback, projectStatus }, adminUser, req) {
    const updatedDeliverable = await projectsRepo.updateDeliverableReview(deliverableId, {
      status,
      adminFeedback
    });

    if (!updatedDeliverable) {
      throw ApiError.notFound('Deliverable not found.');
    }

    // Determine new project status
    let newProjectStatus = projectStatus;
    if (!newProjectStatus) {
      if (status === 'APPROVED') {
        newProjectStatus = 'APPROVED';
      } else if (status === 'REVISION_REQUIRED') {
        newProjectStatus = 'REVISION_REQUIRED';
      }
    }

    if (newProjectStatus) {
      await projectsRepo.updateStatus(updatedDeliverable.project_id, {
        status: newProjectStatus
      });
    }

    await recordAuditLog({
      userId: adminUser.id,
      action: 'DELIVERABLE_REVIEWED',
      entityType: 'PROJECT_DELIVERABLE',
      entityId: deliverableId,
      req,
      details: {
        deliverableStatus: status,
        newProjectStatus,
        feedback: adminFeedback
      }
    });

    return updatedDeliverable;
  }

  /**
   * Admin mark project delivered/completed for client
   */
  async markProjectDelivered(id, { productionUrl, deliveryNotes }, adminUser, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    const updated = await projectsRepo.updateStatus(id, {
      status: 'DELIVERED',
      productionUrl
    });

    // Update order fulfillment status
    if (project.order_id) {
      await ordersRepo.updateFulfillmentStatus(project.order_id, 'FULFILLED');
    }

    await recordAuditLog({
      userId: adminUser.id,
      action: 'PROJECT_DELIVERED_TO_CLIENT',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: {
        projectCode: project.project_code,
        productionUrl
      }
    });

    return updated;
  }

  /**
   * Add project note (Admin ↔ Engineer Communication)
   */
  async addNote(id, { content, noteType, isInternal }, user, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    // Only Admin and assigned Developer can communicate on project notes
    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Clients cannot post to internal project communication.');
    }
    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    const note = await projectsRepo.addNote({
      projectId: id,
      authorId: user.id,
      authorRole: user.role,
      content,
      noteType: noteType || 'INTERNAL',
      isInternal: isInternal !== false
    });

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_NOTE_ADDED',
      entityType: 'PROJECT_NOTE',
      entityId: note.id,
      req,
      details: { projectId: id, authorRole: user.role }
    });

    return note;
  }

  /**
   * Get notes for project
   */
  async getNotes(id, user) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT) {
      throw ApiError.forbidden('Access denied to internal notes.');
    }
    if (user.role === ROLES.DEVELOPER && project.developer_id !== user.id) {
      throw ApiError.forbidden('You are not assigned to this project.');
    }

    return projectsRepo.getNotes(id);
  }

  /**
   * List available software engineers with active workload
   */
  async listEngineers() {
    return projectsRepo.listEngineers();
  }

  /**
   * Legacy createProject method for backwards compatibility
   */
  async createProject(user, data, req) {
    return this.submitProject(user, data, req);
  }

  async updateProjectStatus(id, updateData, user, req) {
    const project = await projectsRepo.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (
      user.role === ROLES.CLIENT ||
      (user.role === ROLES.DEVELOPER && project.developer_id !== user.id)
    ) {
      throw ApiError.forbidden('Only the assigned developer or an admin can update project status.');
    }

    const updated = await projectsRepo.updateStatus(id, updateData);

    await recordAuditLog({
      userId: user.id,
      action: 'PROJECT_STATUS_UPDATED',
      entityType: 'PROJECT',
      entityId: id,
      req,
      details: { oldStatus: project.status, newStatus: updateData.status }
    });

    return updated;
  }
}

module.exports = new ProjectsService();
