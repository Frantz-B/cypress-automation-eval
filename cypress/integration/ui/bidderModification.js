const bidderName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Bidder_created';
const biddeUpdatedName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Bidder_updated';


context('Editing Bidder UI', () => {
  describe('Create/ Edit Bidder - UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

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
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(1000);
    });

    it('Validating new Bidder was created in UI and open it', () => {
      //After Bidder is successfully created, UI should navigate to bidder page
      // Search functionality is not worknig for bidders page at the moment.
      //  So, for now comments will be added to the "Search" functionality lines to prevent them from execution
      /////////// > "Search" functionality lines  
      //cy.get('[type="search"]').type(bidderName, { force: true });
      //cy.get('[data-qa="bidder--data-row--name"]').should('contain', bidderName);
      cy.get('[data-qa="bidder--data-row--name"]').first()
      .should('contain', bidderName) // // Confirming the new createed bidder is at the top of the table
      .click({force: true});  
    });

    it('Editing the Bidder values from "bidders" table', () => {      
      cy.get('[data-qa="bidder--data-row--select--actions"]').first().click();
      cy.get('[data-qa="bidder--data-row--edit"]').click().wait(1500).then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders/edit'); // User redirected to bidder editing page
      });
      cy.get('[data-qa="bidder-add-edit--name-input"]').focus().clear().type(biddeUpdatedName, { force: true });
      cy.get('[data-qa="toggle-tabs--select-PMP & Open"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').clear().type("http://google.com", { force: true });
      cy.get('[data-qa="bidder-add-edit--secure-url-input"]').clear().type("https://google.com", { force: true });
      cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--gzip"]').click({force: true});  
      cy.get('[data-qa="bidder-add-edit--send--cookie-sync"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--video-traffic"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--native-traffic"]').click({force: true});
      cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').clear().type("0.9", { force: true });
      cy.get('[data-qa="bidder-add-edit--save"]').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(1000);
    });

    it('Validating Bidder was updated in UI', () => {
      //After Bidder is successfully created, UI should navigate to bidder page
      // Search functionality is not worknig for bidders page at the moment.
      //  So, for now comments will be added to the "Search" functionality lines to prevent them from execution
      /////////// > "Search" functionality lines  
      //cy.get('[type="search"]').type(bidderName, { force: true });
      //cy.get('[data-qa="bidder--data-row--name"]').should('contain', bidderName);
      cy.get('[data-qa="bidder--data-row--name"]').first()
      .should('contain', biddeUpdatedName).click({force: true}).wait(1500);
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(2) p3')
      .should('contain', 'Open and PMP');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(3) p3')
      .should('contain', '0.9');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(2)')
      .should('contain', 'Use direct-like cookie sync');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(3)')
      .should('contain', 'Send video traffic');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(4)')
      .should('contain', 'Send Native Traffic');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(5) p3')
      .should('contain', 'http://google.com');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(6) p3')
      .should('contain', 'https://google.com');      
  });

  it('Editing the Bidder values from specific bidder page', () => {      
    cy.get('[data-qa="bidder-detail--edit"]').click().wait(1500).then(() => {
      cy.url().should('include', 'buyers-dashboard/bidders/edit'); // User redirected to bidder editing page
    });
    cy.get('[data-qa="bidder-add-edit--name-input"]').focus().clear().type(biddeUpdatedName, { force: true });
    cy.get('[data-qa="toggle-tabs--select-PMP"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').clear().type("http://kargo.com", { force: true });
    cy.get('[data-qa="bidder-add-edit--secure-url-input"]').clear().type("https://kargo.com", { force: true });
    cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--send--gzip"]').click({force: true});  
    cy.get('[data-qa="bidder-add-edit--send--cookie-sync"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--send--video-traffic"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--send--native-traffic"]').click({force: true});
    cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').clear().type("0.5", { force: true });
    cy.get('[data-qa="bidder-add-edit--save"]').click({force: true});
    cy.get('[data-qa="modal--confirm"]').click({force: true}).wait(1000);
  });

  it('Validating Bidder was updated from detail rail in UI', () => {
    //After Bidder is successfully created, UI should navigate to bidder page
    // Search functionality is not worknig for bidders page at the moment.
    //  So, for now comments will be added to the "Search" functionality lines to prevent them from execution
    /////////// > "Search" functionality lines  
    //cy.get('[type="search"]').type(bidderName, { force: true });
    //cy.get('[data-qa="bidder--data-row--name"]').should('contain', bidderName);
    cy.get('[data-qa="bidder--data-row--name"]').first()
    .should('contain', biddeUpdatedName).click({force: true}).wait(1500);
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(2) p3')
    .should('contain', 'PMP');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(3) p3')
    .should('contain', '0.5');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(2)')
    .should('contain', 'Send non-matched users');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(3)')
    .should('contain', 'Use iframe wrapper for sync URL users');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(4)')
    .should('contain', 'Send gzip request');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(5) p3')
    .should('contain', 'http://kargo.com');
    cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(6) p3')
    .should('contain', 'https://kargo.com');      
});
});
});