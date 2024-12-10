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

const Openwhisk = require('../../../../../actions/openwhisk')
const consumer = require('../../../../../actions/customer/external/consumer')
const { HTTP_BAD_REQUEST } = require('../../../../../actions/constants')

jest.mock('../../../../../actions/openwhisk')
jest.mock('@adobe/aio-lib-state')

describe('Given customer external consumer', () => {
  describe('When method main is defined', () => {
    test('Then is an instance of Function', () => {
      expect(consumer.main).toBeInstanceOf(Function)
    })
  })
  describe('When customer event type received is not supported', () => {
    test('Then returns error response', async () => {
      const UNSUPPORTED_TYPE = 'foo'
      const TYPE_NOT_FOUND_RESPONSE = {
        error: {
          body: {
            error: 'This case type is not supported: |foo|'
          },
          statusCode: HTTP_BAD_REQUEST
        }
      }
      const params = { type: UNSUPPORTED_TYPE, data: {} }
      expect(await consumer.main(params)).toMatchObject(TYPE_NOT_FOUND_RESPONSE)
    })
  })
  describe('When customer event received is valid', () => {
    it.each([
      ['updated', 'be-observer.customer_update', 'customer-backoffice/updated', 'data']
    ]
    )('Then returns success response for %p action', async (name, type, action, data) => {
      const params = { type, data }
      const invocation = Openwhisk.prototype.invokeAction = jest.fn()
      await consumer.main(params)
      expect(invocation).toHaveBeenCalledWith(action, data)
    })
  })
})
