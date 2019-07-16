const bidderName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Bidder.with.an.updated.seat_created';
const seatName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Seat_created';
const seatUpdatedName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Seat_updated';

context(' Editing Seat UI', () => {
  describe('Create/ Edit Seat - UI', () => {
      beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

//  First create a bidder since it's required for a seat
    it('Add a Bidder', () => {
      cy.visit('');
      cy.get('[data-qa="nav-bar--buyers"]').click({ force: true }).wait(3000);
      cy.get('[data-qa="buyers-dashboards--select-bidders"]').click({ force: true });          
      cy.get('[data-qa="brands-dashboard--add-bidder"]').click().then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders/create'); // User redirected to bidder craetion page
      });
      cy.get('[data-qa="bidder-add-edit--name-input"]').focus().type(bidderName, { force: true });
      cy.get('[data-qa="toggle-tabs--select-PMP"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').type("http://kargo.com", { force: true });
      cy.get('[data-qa="bidder-add-edit--secure-url-input"]').type("https://kargo.com", { force: true });
      cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--gzip"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').type("0.1", { force: true });
      cy.get('[data-qa="bidder-add-edit--save"]').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(2000)
    });

    it('Add a Seat', () => { 
      cy.get('[data-qa="bidder--data-row--name"]').first().click({ force: true }).wait(2000).then(() => {
        cy.get('header').should('contain', bidderName);// User opened and confirm the newly added bidder
      }); 
      cy.get('[data-qa="seat-table--add-seat"]').click({force: true}).then(() => {
        cy.url().should('include', 'buyers-dashboard/seats/create?bidder_id='); // User redirected to seat creation page
      });
      cy.get('[data-qa="seat-create--seat-name-input"]').type(seatName, { force: true });
      cy.get('[data-qa="seat-create--save"]').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(1000)
    });

    it('Validating new Seat was created in UI', () => {        
      cy.get('input[type="search"]').focus().type(seatName, { force: true }).wait(1000); //Searching for the newly created seat
      cy.get('seats-table div.table p').should('contain', seatName); // Newly created seat is found
    });

    it('Updating the seat', () => {    
      cy.get('input[type="search"]').focus().clear().wait(1500);
      cy.get('div.table-row.datatable-row.u-grid-gap-24 div div i')
      .click({force: true}).wait(500); // Clicking on 'Actions' button
      cy.get('div.table-row.datatable-row.u-grid-gap-24 > div > div > ul > li:nth-child(1) > a')
      .click({force: true}).wait(500); // Clicking on 'Edit' Option
      cy.get('input[name="seat"]').focus().clear().type(seatUpdatedName, { force: true }).wait(500);
      cy.get('div.modal.fade.in div.modal-dialog div form div.modal-footer.button-group button.button.button--primary'
      ).click({force: true}).wait(1500); // Clicking on 'Save' button 
    });

    it('Validating the Seat was updated in UI', () => {        
      cy.get('input[type="search"]').focus().type(seatUpdatedName, { force: true }).wait(1000); //Searching for the newly created seat
      cy.get('seats-table div.table p').should('contain', seatUpdatedName); // Newly created seat is found
    });

  });
});
