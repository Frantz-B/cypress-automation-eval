const nameHelper = require('../../helpers/name-helper');// import the name-helpers file

const bidderName = nameHelper.generateName('UI-bidder.with.dataCenter_created');
const dataCenterName = nameHelper.generateName('UI-dataCenter_created');
const dataCenterEditName = nameHelper.generateName('UI-dataCenter_updated');

context('Data Center UI', () => {
  describe('Creating/ updating Data center - UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    it('Add a Bidder and open it', () => {
      cy.visit('');
      cy.get('[data-qa="nav-bar--buyers"]').click({ force: true }).wait(3000);
      cy.get('[data-qa="buyers-dashboards--select-bidders"]').click({ force: true });
      cy.get('[data-qa="brands-dashboard--add-bidder"]').click().then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders/create');
      });
      cy.get('[data-qa="bidder-add-edit--name-input"]').focus().type(bidderName, { force: true });
      cy.get('[data-qa="toggle-tabs--select-PMP"]').click({ force: true });
      cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').type('http://kargo.com', { force: true });
      cy.get('[data-qa="bidder-add-edit--secure-url-input"]').type('https://kargo.com', { force: true });
      cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click({ force: true });
      cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click({ force: true });
      cy.get('[data-qa="bidder-add-edit--send--gzip"]').click({ force: true });
      cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').type('0.1', { force: true });
      cy.get('[data-qa="bidder-add-edit--save"]').click({ force: true });
      cy.get('[data-qa="modal--confirm"]').click({ force: true }).wait(1000);
      cy.get('[type="search"]').type(bidderName, { force: true }).wait(2000);
      cy.get('[data-qa="bidder--data-row--name"]').should('contain', bidderName).click({ force: true })
        .wait(1500);
      cy.get('header').should('contain', bidderName);
    });

    // This cannot be run on feature branches so it is disabled
    it('Add a data center', () => {
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
