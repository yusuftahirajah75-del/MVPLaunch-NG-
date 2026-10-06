/**
 * MVPLaunch NG - Pricing Packages Routes
 * Public endpoints to retrieve server-authoritative package specifications.
 */
const { Router } = require('express');
const { getAllPackages, getPackageById } = require('../../config/packages');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');

const router = Router();

router.get('/', (req, res) => {
  const packages = getAllPackages();
  return ApiResponse.success(res, 'Available launch packages retrieved successfully', { packages });
});

router.get('/:id', (req, res, next) => {
  const pkg = getPackageById(req.params.id);
  if (!pkg) {
    return next(ApiError.notFound(`Package '${req.params.id}' not found.`));
  }
  return ApiResponse.success(res, 'Package details retrieved', { package: pkg });
});

module.exports = router;
