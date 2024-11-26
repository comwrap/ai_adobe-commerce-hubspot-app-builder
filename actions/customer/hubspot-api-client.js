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

async function updateContact(token, data, contactId) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`})
    const properties = data

    const SimplePublicObjectInput = { properties }

    return await hubspotClient.crm.contacts.basicApi.update(contactId, SimplePublicObjectInput)
}

async function getAllContacts(token, data) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`});

    return await hubspotClient.crm.contacts.getAll();
}

async function getContactAddressProperties(token, contactId) {
    const hubspotClient = new hubspot.Client({"accessToken": `${token}`});

    const properties = [
        "address",
        "city",
        "state",
        "zip",
        "country"
    ];

    return await hubspotClient.crm.contacts.basicApi.getById(contactId, properties);
}

module.exports = {
    createContact,
    getAllContacts,
    updateContact,
    getContactAddressProperties
}
