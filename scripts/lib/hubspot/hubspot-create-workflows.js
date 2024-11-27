// const { Core } = require('@adobe/aio-sdk')
// const logger = Core.Logger('commerce-eventing-api-client', { level: 'info' })
const request = require('request')
const fs = require('fs')
const path = require('path')
const hubspotUrl = 'https://api.hubapi.com/automation/v4/flows'

/**
 *
 * @param {*} environment
 * @returns
 */
async function main (environment) {
  if (!allowToProceed(environment)) {
    return {
      code: 200,
      success: true
    }
  }

  try {
    const sourceFilePath = path.join(__dirname, 'workflow.js')
    const sourceCodeContent = fs.readFileSync(sourceFilePath, 'utf8')

    const options = {
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
            sourceCode: sourceCodeContent,
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
    request(options, function (error, response) {
      if (error) throw new Error(error)
      const flowResponse = JSON.parse(response.body)
      saveWorkflowId(flowResponse.id)
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

/**
 *
 * @param {*} flowId
 */
function saveWorkflowId (flowId) {
  // Define the new environment variable and its value
  const newVariable = 'HUBSPOT_FLOW_ID'
  const newValue = flowId
  const newLine = `\n${newVariable}=${newValue}\n`

  // Path to the .env file
  const envFilePath = path.join(__dirname, '../../../.env')

  // Read the .env file
  fs.readFile(envFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading .env file:', err)
      return
    }

    // Split the content into lines
    const lines = data.split('\n')

    // Filter out the line that starts with the given variable name
    const updatedLines = lines.filter(line => !line.startsWith(newVariable + '='))

    // Join the lines back into a single string
    const updatedContent = updatedLines.join('\n')

    // Write the updated content back to the .env file
    fs.writeFile(envFilePath, updatedContent, 'utf8', (err) => {
      // Append the new variable to the .env file
      fs.appendFile(envFilePath, newLine, (err) => {
        if (err) {
          console.error('Error appending to .env file:', err)
        } else {
          console.log(`Successfully added ${newVariable} to .env file.`)
        }
      })
    })
  })
}

/**
 *
 * @param environment
 */
function allowToProceed (environment) {
  // Access the environment variable
  const hubspotFlowId = environment.HUBSPOT_FLOW_ID

  // Check if it exists and is not empty
  if (hubspotFlowId && hubspotFlowId.trim() !== '') {
    console.log('HUBSPOT_FLOW_ID exists and is not empty:', hubspotFlowId)
    return false
  }

  console.log('HUBSPOT_FLOW_ID is either undefined or empty')
  return true
}

exports.main = main
