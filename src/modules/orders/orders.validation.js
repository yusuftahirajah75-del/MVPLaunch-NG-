/**
 * MVPLaunch NG - Orders Validation Schemas
 */
const { z } = require('zod');
const { ORDER_STATUS } = require('../../config/constants');

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS)
});

module.exports = {
  updateOrderStatusSchema
};
