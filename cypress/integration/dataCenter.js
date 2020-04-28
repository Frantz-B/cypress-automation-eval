const { extend } = require('lodash');
const { login } = require('../../helpers/login-helper');
const nameHelper = require('../../helpers/name-helper');// import the name-helpers file

Cypress.env('RETRIES', 4);
context('Data Center UI', () => {
  describe('Creating/ updating Data center - UI', () => {
    let userSessionToken;

    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });

    const bidderCreatedToday = Cypress.moment().format('YY.MM.DD_');
    const dataCenterName = nameHelper.generateName('UI-dataCenter_created');
    const dataCenterEditName = nameHelper.generateName('UI-dataCenter_updated');
    let bidderId;

    const getRequest = (options = {}) => {
      const defaultOptions = {
        auth: {
          bearer: Cypress.env('authToken'),
        },
      };
      return extend(defaultOptions, options);
    };

    it('Retrieve Bidder ID that was created today', () => {
      /*
        The Expectation for this is test is that '/api/bidder.js' was ran previously,
        because it will create & push the bidder needed so errors are not thrown due
        to incorrect bidder setup.
      */

      const requestOptions = getRequest({
        url: `/api/v1/bidder?search=${bidderCreatedToday}`,
      });

      cy.request(requestOptions).then((resp) => {
        const bidderRow = resp.body.rows;
        bidderId = bidderRow.find(bidderObj => bidderObj.is_synced === true).id;
      });
    });

    // This cannot be run on feature branches so it is disabled
    it('Add a data center', () => {
      cy.visit(`https://deal-manager.dev.kargo.com/buyers-dashboard/bidders/${bidderId}`);
      cy.get('[data-qa="bidder-detail--select--data-center-tab"]').click({ force: true }).wait(1000);
      cy.get('[data-qa="data-center-table--add-data-center"]').click().then(() => {
        cy.url().should('include', 'buyers-dashboard/data-centers/create?bidder_id=');
      });
      cy.get('[data-qa="data-center-add-edit--name-input"]').focus().type(dataCenterName, { force: true });
      cy.get('[data-qa="data-center-add-edit--status-input"]').click();
      cy.get('form div:nth-child(2) div ul li:nth-child(1) a').click({ force: true });
      cy.get('[data-qa="data-center-add-edit--region-input"]').click();
      cy.get('form div:nth-child(3) div ul li:nth-child(1) a').click({ force: true });
      cy.get('[data-qa="data-center-add-edit--bid-url-input"]').type('https://kargo.com', { force: true });
      cy.get('[data-qa="data-center-add-edit--qps-limit-input"]').type('1', { force: true }).wait(1000);
      cy.get('[data-qa="data-center-add-edit--save"]').click({ force: true }).wait(1000);
      cy.get('[data-qa="modal--confirm"]').click({ force: true }).wait(2000);
    });

    it('Validating new data center was created in UI', () => {
      /*
        A few issues here:
        1. The user us getting redirected to seat tab.
        2. No search field
        -> we will be working around these issues at the moment till they are fixed.
      */
      cy.get('[data-qa="bidder-detail--select--data-center-tab"]').click({ force: true }).wait(1500);
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(1)')
        .should('contain', 'Active');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(2)')
        .should('contain', dataCenterName);
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(3)')
        .should('contain', 'us-east-1');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(4)')
        .should('contain', 'https://kargo.com');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(5)')
        .should('contain', '1');
    });

    it('Editing data center', () => {
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 div div')
        .click().wait(1500);
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 div div ul li')
        .click().wait(1500).then(() => {
          cy.url().should('include', 'buyers-dashboard/data-centers/edit/');
        });
      cy.get('[data-qa="data-center-add-edit--name-input"]').focus()
        .clear().type(dataCenterEditName, { force: true });
      cy.get('[data-qa="data-center-add-edit--status-input"]').click();
      cy.get('form div:nth-child(2) div ul li:nth-child(2) a').click({ force: true });
      cy.get('[data-qa="data-center-add-edit--region-input"]').click();
      cy.get('form div:nth-child(3) div ul li:nth-child(2) a').click({ force: true });
      cy.get('[data-qa="data-center-add-edit--bid-url-input"]').clear()
        .type('https://automation.kargo.com', { force: true });
      cy.get('[data-qa="data-center-add-edit--qps-limit-input"]').clear()
        .type('5', { force: true }).wait(1000);
      cy.get('[data-qa="data-center-add-edit--save"]').click({ force: true }).wait(1000);
      cy.get('[data-qa="modal--confirm"]').click({ force: true }).wait(2000);
    });

    it('Validating new data center was updated in UI', () => {
      /*
        A few issues here:
        1. The user us getting redirected to seat tab.
        2. No search field
        -> we will be working around these issues at the moment till they are fixed.
      */
      cy.get('[data-qa="bidder-detail--select--data-center-tab"]').click({ force: true }).wait(1500);
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(1)')
        .should('contain', 'Inactive');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(2)')
        .should('contain', dataCenterEditName);
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(3)')
        .should('contain', 'ap-southeast-2');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(4)')
        .should('contain', 'https://automation.kargo.com');
      cy.get('div.table.table--paginated div.table-row.datatable-row.u-grid-gap-24 p:nth-child(5)')
        .should('contain', '5');
    });
  });
});
