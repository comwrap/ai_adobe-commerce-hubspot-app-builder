// const { Core } = require('@adobe/aio-sdk')
// const logger = Core.Logger('commerce-eventing-api-client', { level: 'info' })
const request = require('request')
const fs = require('fs')
const path = require('path')
const hubspotUrl = 'https://api.hubapi.com/automation/v4/flows'

/**
 *
 * @param {*} environment Environment variables
 * @returns {object} status
 */
async function main (environment) {
  try {
    // Create Workflow for shipment webhook
    const sourceFilePathShipment = path.join(__dirname, 'workflow_shipment.js')
    const sourceCodeContentShipment = fs.readFileSync(sourceFilePathShipment, 'utf8')

    const optionsShipment = {
      method: 'POST',
      url: hubspotUrl,
      headers: {
        Authorization: 'Bearer ' + environment.HUBSPOT_ACCESS_TOKEN,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        isEnabled: true,
        objectTypeId: '0-123',
        flowType: 'WORKFLOW',
        name: 'Tracking Number Notification to Magento',
        startActionId: '1',
        actions: [
          {
            actionId: '1',
            type: 'CUSTOM_CODE',
            secretNames: [
              'clientId',
              'providerId',
              'clientSecret'
            ],
            sourceCode: "exports.main = async (event, callback) => { callback(null, { outputFields: {} }); };",
            runtime: 'NODE20X',
            inputFields: [
              {
                name: 'hs_shipping_tracking_number',
                value: {
                  type: 'OBJECT_PROPERTY',
                  propertyName: 'hs_shipping_tracking_number'
                }
              },
              {
                name: 'hs_external_order_id',
                value: {
                  type: 'OBJECT_PROPERTY',
                  propertyName: 'hs_external_order_id'
                }
              }
            ]
          }
        ],
        enrollmentCriteria: {
          type: 'EVENT_BASED',
          eventFilterBranches: [
            {
              filters: [
                {
                  property: 'hs_name',
                  operation: {
                    operator: 'IS_EQUAL_TO',
                    includeObjectsWithNoValueSet: false,
                    value: 'hs_shipping_tracking_number',
                    operationType: 'STRING'
                  },
                  filterType: 'PROPERTY'
                },
                {
                  property: 'hs_value',
                  operation: {
                    operator: 'IS_KNOWN',
                    includeObjectsWithNoValueSet: false,
                    operationType: 'ALL_PROPERTY'
                  },
                  filterType: 'PROPERTY'
                }
              ],
              eventTypeId: '4-655002',
              operator: 'HAS_COMPLETED',
              filterBranchType: 'UNIFIED_EVENTS',
              filterBranchOperator: 'AND'
            }
          ]
        },
        crmObjectCreationStatus: 'COMPLETE',
        type: 'PLATFORM_FLOW'
      })

    }

    // console.log(optionsShipment)

    
    request(optionsShipment, function (error, response, body) {
      console.log(body)
      if (error) throw new Error(error)
    })

    const sourceFilePathCustomer = path.join(__dirname, 'workflow_customer.js')
    const sourceCodeContentCustomer = fs.readFileSync(sourceFilePathCustomer, 'utf8')

    const optionsCustomer = {
      method: 'POST',
      url: hubspotUrl,
      headers: {
        Authorization: 'Bearer ' + environment.HUBSPOT_ACCESS_TOKEN,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        isEnabled: true,
        objectTypeId: '0-123',
        flowType: 'WORKFLOW',
        name: 'Customer Edit Notification to Magento',
        startActionId: '1',
        actions: [
          {
            actionId: '1',
            type: 'CUSTOM_CODE',
            secretNames: [
              'clientId',
              'providerId',
              'clientSecret'
            ],
            sourceCode: sourceCodeContentCustomer,
            runtime: 'NODE20X',
            inputFields: [
              {
                name: 'hs_shipping_tracking_number',
                value: {
                  type: 'OBJECT_PROPERTY',
                  propertyName: 'hs_shipping_tracking_number'
                }
              },
              {
                name: 'hs_external_order_id',
                value: {
                  type: 'OBJECT_PROPERTY',
                  propertyName: 'hs_external_order_id'
                }
              }
            ]
          }
        ],
        enrollmentCriteria: {
          type: 'EVENT_BASED',
          eventFilterBranches: [
            {
              filters: [
                {
                  property: 'hs_name',
                  operation: {
                    operator: 'IS_EQUAL_TO',
                    includeObjectsWithNoValueSet: false,
                    value: 'hs_shipping_tracking_number',
                    operationType: 'STRING'
                  },
                  filterType: 'PROPERTY'
                },
                {
                  property: 'hs_value',
                  operation: {
                    operator: 'IS_KNOWN',
                    includeObjectsWithNoValueSet: false,
                    operationType: 'ALL_PROPERTY'
                  },
                  filterType: 'PROPERTY'
                }
              ],
              eventTypeId: '4-655002',
              operator: 'HAS_COMPLETED',
              filterBranchType: 'UNIFIED_EVENTS',
              filterBranchOperator: 'AND'
            }
          ]
        },
        crmObjectCreationStatus: 'COMPLETE',
        type: 'PLATFORM_FLOW'
      })

    }
    request(optionsCustomer, function (error, response, body) {
      console.log(body)
      if (error) throw new Error(error)
    })

    return {
      code: 200,
      success: true
    }
  } catch (error) {
    const errorMessage = `Unable to complete the process of Hubspot configuration: ${error.message}`
    console.log(errorMessage)
    return {
      code: 500,
      success: false,
      error: errorMessage
    }
  }
}

exports.main = main
