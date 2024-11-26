const stateLib = require('@adobe/aio-lib-state')
const orderStatus = {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    ERROR: 'Error'
}

/**
 * Update order status
 *
 * @param incrementId
 * @param status
 * @returns {Promise<void>}
 */
async function updateOrderStatus(incrementId, status) {
    const state = await stateLib.init()
    await state.put('ORDER_' + incrementId, status, { ttl: 0 })
}

/**
 * Get order statuses
 *
 * @returns {Object}
 */
async function getOrderStatuses() {
    let statuses = {};

    const state = await stateLib.init()
    for await (const { keys } of state.list({ match: 'ORDER_*' })) {
        for (const key of keys) {
            const status = await state.get(key);
            const incrementId = key.replace('ORDER_', '');
            statuses[incrementId] = status;
        }
    }

    return statuses;
}

module.exports = {
    updateOrderStatus,
    getOrderStatuses,
    orderStatus
}
