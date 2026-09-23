/**
 * MVPLaunch NG - Reviews Controller
 */
const reviewsService = require('./reviews.service');
const ApiResponse = require('../../utils/apiResponse');

class ReviewsController {
  async submitReview(req, res, next) {
    try {
      const review = await reviewsService.submitReview(req.user, req.body, req);
      return ApiResponse.created(res, 'Review submitted successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async getPublicReviews(req, res, next) {
    try {
      const reviews = await reviewsService.getPublicReviews(req.query);
      return ApiResponse.success(res, 'Public reviews retrieved', { reviews });
    } catch (error) {
      next(error);
    }
  }

  async toggleFeatured(req, res, next) {
    try {
      const updated = await reviewsService.toggleFeatured(req.params.id, req.body.isFeatured, req.user, req);
      return ApiResponse.success(res, 'Review featured status updated', { review: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewsController();
