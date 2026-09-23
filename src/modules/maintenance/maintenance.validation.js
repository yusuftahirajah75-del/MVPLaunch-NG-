/**
 * MVPLaunch NG - Maintenance Validation Schemas
 */
const { z } = require('zod');
const { MAINTENANCE_STATUS } = require('../../config/constants');

const subscribeMaintenanceSchema = z.object({
  projectId: z.string().uuid(),
  planName: z.string().min(2).max(100),
  monthlyFeeNgn: z.number().nonnegative(),
  supportHoursPerMonth: z.number().int().positive().default(10)
});

const updateMaintenanceStatusSchema = z.object({
  status: z.nativeEnum(MAINTENANCE_STATUS)
});

module.exports = {
  subscribeMaintenanceSchema,
  updateMaintenanceStatusSchema
};
