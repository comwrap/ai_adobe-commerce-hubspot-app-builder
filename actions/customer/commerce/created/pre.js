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
const { getCompanyIdByExternalId } = require('../../hubspot-api-client')

/**
 * This function hold any logic needed pre sending information to external backoffice application
 *
 * @param {object} params - Data received before transformation
 * @param {object} transformed - Transformed received data
 * @returns {void} no implementation curently
 */
async function preProcess (params, transformed) {
  // @TODO Here implement any preprocessing needed
  if (params.data.hasOwnProperty('company_attributes')) {
    const companyId = await getCompanyIdByExternalId(params.HUBSPOT_ACCESS_TOKEN, params.data.company_attributes.company_id)
    return {
      hubspot_company_id: companyId
    }
  }
  return {}
}

module.exports = {
  preProcess
}
