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

const hubspot = require('@hubspot/api-client');

async function createContact(token, data) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`});

    const properties = data
    const SimplePublicObjectInputForCreate = { associations: [], properties };

    return await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate);
}

async function updateContact(token, data, commerceHubspotIdField) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`});

    const SimplePublicObjectInput = { associations: [], data };
    const contactId = data[commerceHubspotIdField];

    try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, SimplePublicObjectInput);
    console.log(JSON.stringify(apiResponse, null, 2));
    } catch (e) {
    e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e)
    }
}

async function getAllContacts(token, data) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`});

    return await hubspotClient.crm.contacts.getAll(50);
}

module.exports = {
    createContact,
    getAllContacts,
    updateContact
}
