const bidderName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Bidder_created';
;

context('Bidder UI', () => {
  describe('Create Bidder - UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });


    it('Add a Bidder', () => {

      cy.get('[ng-reflect-router-link="buyers-dashboard"]').click({ force: true }).wait(3000); // Opening Buyers section

      cy.get('div.tab-row.u-flex  div:nth-child(2)').click({ force: true }); // clicking on Bidder tab      
      
      cy.get('bidders-dashboard section button').click().then(() => { // Clicking on Add Bidder bidder 
      cy.url().should('include', 'buyers-dashboard/bidders/create'); // User redirected to bidder craetion page
      });
      
      cy.get('[name="name"]').focus().type(bidderName, { force: true }); // Entering a bidder name
      cy.get('toggle-tabs section div div:nth-child(1)').click({force: true}); // Updating auction type to PMP
      cy.get('[name="user_sync_url"]').type("http://kargo.com", { force: true }); // Adding a user matching URL
      cy.get('[name="user_sync_url_secure"]').type("https://kargo.com", { force: true }); // Adding a user matching URL secure
      cy.get('[ng-reflect-name="send_not_synced_users"]').click({force: true}); // Checking Send non-matched users field
      cy.get('[ng-reflect-name="iframe_wrapper"]').click({force: true}); // Checking Use iframe wrapper for sync URL users field 
      cy.get('[ng-reflect-name="gzip_compression"]').click({force: true}); // Checking Send gzip request field
      cy.get('[name="sync_weight"]').type("0.1", { force: true }); // Entering a Sync weight
      cy.get('button.button.button--primary.button--long').click({force: true}); // Clicking on 'save' button
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(3000);

      
      cy.get('bidders-dashboard section div.table data-row:nth-child(2) h6').should('contain', bidderName); // // Confring that the bidder is created
    });
  });
});
