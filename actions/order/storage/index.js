const stateLib = require('@adobe/aio-lib-state');

const orderStatus = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ERROR: 'Error',
};

/**
 * Update order status
 *
 * @param {string} incrementId - Order increment ID
 * @param {string} status - Order status
 * @returns {Promise<void>}
 */
async function updateOrderStatus(incrementId, status) {
  const state = await stateLib.init();
  await state.put(`ORDER_${incrementId}`, status, { ttl: stateLib.MAX_TTL });
}

/**
 * Get order statuses
 *
 * @returns {Promise<object>} Order statuses
 */
async function getOrderStatuses() {
  let statuses = {};
  const state = await stateLib.init();

  for await (const { keys } of state.list({ match: 'ORDER_*' })) {
    for (const key of keys) {
      const status = await state.get(key);
      const incrementId = key.replace('ORDER_', '');
      statuses[incrementId] = status.value;
    }
  }

  return statuses;
}

module.exports = {
  updateOrderStatus,
  getOrderStatuses,
  orderStatus
};
