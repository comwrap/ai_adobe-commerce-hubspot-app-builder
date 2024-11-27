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

require('dotenv').config()

/**
 * This method handle the onboarding script, it creates the events providers, add metadata to them, create the registrations
 * and configures the Adobe I/O Events module in Commerce
 *
 * @returns {object} - returns a response with provider and registrations info
 */
async function main () {
  await require('../../lib/hubspot/hubspot-create-workflows').main(process.env)
  console.log('Process of creating Hubspot flows for Shipment integrations completed')

  return {
    code: 200,
    success: true
  }
}

exports.main = main
