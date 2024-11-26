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

    return await hubspotClient.crm.contacts.getAll(50);
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
