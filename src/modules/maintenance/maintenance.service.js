/**
 * MVPLaunch NG - Maintenance Service
 */
const maintenanceRepo = require('./maintenance.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class MaintenanceService {
  async subscribe(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT && project.client_id !== user.id) {
      throw ApiError.forbidden('You can only purchase maintenance for your own projects.');
    }

    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    const subscription = await maintenanceRepo.create({
      projectId: data.projectId,
      clientId: user.id,
      planName: data.planName,
      monthlyFeeNgn: data.monthlyFeeNgn,
      supportHoursPerMonth: data.supportHoursPerMonth,
      nextBillingDate
    });

    await recordAuditLog({
      userId: user.id,
      action: 'MAINTENANCE_SUBSCRIPTION_CREATED',
      entityType: 'MAINTENANCE_SUBSCRIPTION',
      entityId: subscription.id,
      req,
      details: { planName: data.planName, feeNgn: data.monthlyFeeNgn }
    });

    return subscription;
  }

  async getMySubscriptions(userId) {
    return maintenanceRepo.findByClientId(userId);
  }

  async updateStatus(id, status, user, req) {
    const sub = await maintenanceRepo.findById(id);
    if (!sub) {
      throw ApiError.notFound('Maintenance subscription not found.');
    }

    if (user.role === ROLES.CLIENT && sub.client_id !== user.id) {
      throw ApiError.forbidden('Unauthorized access to update this maintenance subscription.');
    }

    const updated = await maintenanceRepo.updateStatus(id, status);

    await recordAuditLog({
      userId: user.id,
      action: 'MAINTENANCE_STATUS_UPDATED',
      entityType: 'MAINTENANCE_SUBSCRIPTION',
      entityId: id,
      req,
      details: { oldStatus: sub.status, newStatus: status }
    });

    return updated;
  }
}

module.exports = new MaintenanceService();
