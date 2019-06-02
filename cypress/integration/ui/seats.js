const moment = require('moment');
const bidderName = 'UI_Automation_Add_Bidder.With.A.Seat_' + moment().format('YY.MM.DD_hh:mm:ss');
const seatName = 'UI_Automation_Add_seat_' + moment().format('YY.MM.DD_hh:mm:ss');


context('Seat UI', () => {
  describe('Create Seat - UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });

//  First create a bidder since it's required for a seat
    it('Add a Bidder', () => {

      cy.get('[ng-reflect-router-link="buyers-dashboard"]').click({ force: true }).wait(3000);

      cy.get('div.tab-row.u-flex  div:nth-child(2)').click({ force: true }); // clicking on Bidder tab      
      
      cy.get('bidders-dashboard section button').click().then(() => { // Clicking on Add Bidder bidder (there is ni "qa-data" selector) 
      cy.url().should('include', 'buyers-dashboard/bidders/create');
      });
      
      cy.get('[name="name"]').focus().type(bidderName, { force: true });
      cy.get('toggle-tabs section div div:nth-child(1)').click({force: true});
      cy.get('[name="user_sync_url"]').type("http://kargo.com", { force: true });
      cy.get('[name="user_sync_url_secure"]').type("https://kargo.com", { force: true });
      cy.get('[ng-reflect-name="send_not_synced_users"]').click({force: true});
      cy.get('[ng-reflect-name="iframe_wrapper"]').click({force: true});
      cy.get('[ng-reflect-name="gzip_compression"]').click({force: true});
      cy.get('[name="sync_weight"]').type("0.1", { force: true });
      cy.get('button.button.button--primary.button--long').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(3000);
    });

    it('Add a Seat', () => {

      cy.get('[ng-reflect-router-link="buyers-dashboard"]').click({ force: true }).wait(3000);
      cy.get('div.tab-row.u-flex  div:nth-child(2)').click({ force: true }); // clicking on Bidder tab  
      cy.get('bidders-dashboard section div.table data-row:nth-child(2) h6 a').click({ force: true }).wait(2000);
      cy.get('seats-table div.u-flex div.u-fillRemaining.u-pullRight button').click({ force: true });
      cy.get('[name="seatName"]').type(seatName, { force: true });
      cy.get('button.button.button--primary.button--long').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(3000);
      cy.get('input[type="search"]').focus().type(seatName, { force: true }).wait(3000);

      cy.get('seats-table div.table p')
      .should('contain', seatName);


    });


  });
});
