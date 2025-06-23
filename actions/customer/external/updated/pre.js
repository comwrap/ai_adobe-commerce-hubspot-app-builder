/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { getCustomerBySearchCriteria } = require('../../commerce-customer-api-client')
const { Core } = require('@adobe/aio-sdk')

/**
 * This function hold any logic needed pre sending information to Adobe commerce
 *
 * @param {object} params list
 * @returns {object} pre processed data
 */
async function preProcess (params) {
  const logger = Core.Logger('customer-external-updated', { level: params.LOG_LEVEL || 'info' })

  const customers = await getCustomerBySearchCriteria(
    params.COMMERCE_BASE_URL,
    params,
    'searchCriteria[filter_groups][0][filters][0][field]=email' +
      `&searchCriteria[filter_groups][0][filters][0][value]=${params.data.email}` +
      '&searchCriteria[filter_groups][0][filters][0][condition_type]=eq'
  )

  logger.debug(`Customer: ${JSON.stringify(customers.items[0])}`)
  return customers.items[0]
}

module.exports = {
  preProcess
}
