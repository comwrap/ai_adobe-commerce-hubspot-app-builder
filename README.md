# Adobe App Builder integration for Adobe Commerce and Hubspot

The integration between Adobe Commerce and HubSpot facilitates seamless data synchronization and management across customer, company, and order domains. 

This application serves as a reference implementation for integrating HubSpot and Adobe Commerce. It is designed to demonstrate basic integration features and provide a foundational starting point for further development. Users are encouraged to extend and customize the application to meet specific business requirements and leverage additional functionalities beyond the basic features provided.

Here's a brief description:

## Adobe Commerce to HubSpot Integration

### Customer Management
- **Bi-directional Synchronization:** Ensures customer data is consistently updated between Adobe Commerce and HubSpot.
- **Data Mapping:** Maps customer details and contacts for accurate synchronization.
- **Full Import Synchronization:** Allows comprehensive data import for complete records.

### Company Management
- **Event-Based Updates:** Automates updates of company information and associations. From Adobe Commerce to Hubspot.
- **Delta Updates:** Captures and synchronizes only changes for efficiency. From Adobe Commerce to Hubspot.

### Order Management
- **Event-Based Order Export:** Integrates order lifecycle events for real-time status updates. From Adobe Commerce to Hubspot.
- **Status Synchronization:** Maintains consistent order status visibility across platforms. Shipment status from Hubspot to Adobe Commerce
- **Third-Party Integration:** Supports integration with external systems for notifications.

### Workflow and Visibility
- **UI SDK:** Displays order status directly in the sales order grid for easy tracking.
- **REST API and SDK:** Facilitates communication between platforms, allowing modifications and full visibility of orders, items, and addresses.

This integration streamlines operations, enhances data accuracy, and improves customer relationship management by leveraging the capabilities of both platforms.

![alt text](docs/hubspot/hubspot-architecture.png)

## Installation

[Installation Manual](INSTALL.md)

## Backoffice integration (optional)

Additionally you can configure Admin status identifications for Order Grid in Adobe Commerce.

For more information pls go to 

[Adobe Commerce Admin UI SDK overview](https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/)

Api Mesh file for configuration you can find at mesh.json file.

## Trouble shooting

### The Backoffice Customer Sync event returns a 400 error. 

If you encounter a 400 response code for the event be-observer.customer_update, please validate your customer's required fields. Since every setup can vary, ensure that your required fields match across the Adobe Commerce Customer & Customer Address, actions/customer/external/updated/schema.json Schema, and HubSpot Workflows script.