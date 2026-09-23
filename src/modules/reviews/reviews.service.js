/**
 * MVPLaunch NG - Reviews Service
 */
const reviewsRepo = require('./reviews.repository');
const projectsRepo = require('../projects/projects.repository');
const ApiError = require('../../utils/apiError');
const { ROLES } = require('../../config/constants');
const { recordAuditLog } = require('../../middleware/auditLogger.middleware');

class ReviewsService {
  async submitReview(user, data, req) {
    const project = await projectsRepo.findById(data.projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }

    if (user.role === ROLES.CLIENT && project.client_id !== user.id) {
      throw ApiError.forbidden('You can only review your own completed projects.');
    }

    const review = await reviewsRepo.create({
      projectId: data.projectId,
      clientId: user.id,
      rating: data.rating,
      title: data.title,
      feedbackText: data.feedbackText
    });

    await recordAuditLog({
      userId: user.id,
      action: 'REVIEW_SUBMITTED',
      entityType: 'REVIEW',
      entityId: review.id,
      req,
      details: { rating: data.rating, projectId: data.projectId }
    });

    return review;
  }

  async getPublicReviews(query) {
    const limit = parseInt(query.limit || '10', 10);
    const offset = parseInt(query.offset || '0', 10);
    return reviewsRepo.findPublicReviews({ limit, offset });
  }

  async toggleFeatured(id, isFeatured, user, req) {
    const review = await reviewsRepo.findById(id);
    if (!review) {
      throw ApiError.notFound('Review not found.');
    }

    const updated = await reviewsRepo.setFeatured(id, isFeatured);

    await recordAuditLog({
      userId: user.id,
      action: isFeatured ? 'REVIEW_FEATURED' : 'REVIEW_UNFEATURED',
      entityType: 'REVIEW',
      entityId: id,
      req
    });

    return updated;
  }
}

module.exports = new ReviewsService();
