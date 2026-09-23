/**
 * MVPLaunch NG - Reviews Routes
 */
const { Router } = require('express');
const reviewsController = require('./reviews.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createReviewSchema, featureReviewSchema } = require('./reviews.validation');
const { ROLES } = require('../../config/constants');

const router = Router();

// Public endpoint: Get reviews showcase
router.get('/', reviewsController.getPublicReviews);

// Protected endpoints
router.post('/', authenticate, validate({ body: createReviewSchema }), reviewsController.submitReview);
router.patch(
  '/:id/feature',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: featureReviewSchema }),
  reviewsController.toggleFeatured
);

module.exports = router;
