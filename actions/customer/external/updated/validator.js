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

const Ajv = require('ajv')
const {Core} = require("@adobe/aio-sdk");

/**
 * This function validate the customer data received from external back-office application
 *
 * @returns {object} - returns the result of validation object
 * @param {object} params - Received data from adobe commerce
 */
function validateData (params) {
  const logger = Core.Logger('customer-external-updated', { level: params.LOG_LEVEL || 'info' })
  const data = params.data
  const ajv = new Ajv()
  const schema = require('./schema.json')

  logger.debug('Validating data with schema. Data to validate: ', data)
  const validate = ajv.compile(schema)
  const isValid = validate(data)
  if (!isValid) {
    return {
      success: false,
      message: `Data provided does not validate with the schema: ${JSON.stringify(data)}`
    }
  }
  return {
    success: true
  }
}

module.exports = {
  validateData
}
