/* eslint-disable linebreak-style */
const nameHelper = require('../../helpers/name-helper');

context('Deals', () => {
  describe('Deals UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });

    let dealID;
    let rate;
    const dealName = nameHelper.generateName('UI-Deal_created');
    const dealGroupName = nameHelper.generateName('Automated_DealGroup');
    const salesforceId = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss');
    let targetSpend = Math.floor(Math.random() * 200);
    let dealGroupID;
    const bidderName = nameHelper.generateName('UI-bidder_created');
    const bidderUpdatedName = nameHelper.generateName('UI-bidder_updated');

    it('Add a Bidder', () => {
      cy.visit('');
      cy.get('[data-qa="nav-bar--buyers"]').click();
      cy.get('[data-qa="buyers-dashboards--select-bidders"]').click();
      cy.get('[data-qa="brands-dashboard--add-bidder"]').click().then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders/create');
        // User redirected to bidder creation page
      });
      cy.get('[data-qa="bidder-add-edit--name-input"]').focus().type(bidderName);
      cy.get('[data-qa="toggle-tabs--select-PMP"]').click();
      cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').type('http://kargo.com');
      cy.get('[data-qa="bidder-add-edit--secure-url-input"]').type('https://kargo.com');
      cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click();
      cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click();
      cy.get('[data-qa="bidder-add-edit--send--gzip"]').click();
      cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').type('0.1');
      cy.get('[data-qa="bidder-add-edit--save"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
    });


    it('Editing the Bidder values from "bidders" table', () => {
      cy.visit('/buyers-dashboard/bidders'); // to refresh the page
      cy.get('[type="search"]').type(bidderName).wait(1000);
      cy.get('[data-qa="bidder--data-row--select--actions"]').click();
      cy.get('[data-qa="bidder--data-row--edit"]').click().then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders/edit'); // User redirected to bidder editing page
      });
      cy.get('[data-qa="bidder-add-edit--name-input"]').focus().clear().type(bidderUpdatedName);
      cy.get('[data-qa="toggle-tabs--select-PMP & Open"]').click();
      cy.get('[data-qa="bidder-add-edit--non-secure-url-input"]').clear().type('http://google.com');
      cy.get('[data-qa="bidder-add-edit--secure-url-input"]').clear().type('https://google.com');
      cy.get('[data-qa="bidder-add-edit--send--non-matched"]').click();
      cy.get('[data-qa="bidder-add-edit--send--iframe-wrapper"]').click();
      cy.get('[data-qa="bidder-add-edit--send--gzip"]').click();
      cy.get('[data-qa="bidder-add-edit--send--cookie-sync"]').click();
      cy.get('[data-qa="bidder-add-edit--send--video-traffic"]').click();
      cy.get('[data-qa="bidder-add-edit--send--native-traffic"]').click();
      cy.get('[data-qa="bidder-add-edit--send--sync-weight"]').clear().type('0.9');
      cy.get('[data-qa="bidder-add-edit--save"]').click();
      cy.get('[data-qa="modal--confirm"]').click();

      // Validating Bidder was updated in UI
      cy.get('[class="u-ellipsis"]').should('contain', bidderUpdatedName);
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(2) p3').should('contain', 'Open and PMP');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(3) p3').should('contain', '0.9');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(2)').should('contain', 'Use direct-like cookie sync');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(3)').should('contain', 'Send video traffic');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(4) p3:nth-child(4)').should('contain', 'Send Native Traffic');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(5) p3').should('contain', 'http://google.com');
      cy.get('section.u-grid.layout--details.u-grid-gap-24 aside div div:nth-child(6) p3').should('contain', 'https://google.com');
    });


    it('Creating a Deal_Group ', () => {
      cy.get('[data-qa="nav-bar--deals"]').click();
      cy.get('[data-qa="deal-group-dashboard--create"]').click();
      cy.get('[data-qa="deal-group-form--name"]').focus().type(dealGroupName);
      cy.get('[data-qa="deal-group-form--sf-id"]').focus().type(salesforceId);
      cy.get('[data-qa="deal-group-form--target-spend"]').focus().type(targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--closed-loop--1"]').click();
      });
      cy.wait(2000);


      // Team Member Section
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click().type('A{enter}').wait(200);
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click().type('A{enter}').wait(200);
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click().type('A{enter}').wait(200);

      // Buyers Section
      cy.get('section:nth-child(3) div:nth-child(4) div:nth-child(1) div div button').click().get('section:nth-child(3) div:nth-child(4) div:nth-child(1) div div ul li:nth-child(2) a').click();
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().type(bidderUpdatedName).then(() => {
        cy.get('[data-qa="deal-group-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });


      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--optimizable-kpi--0"]').click();
      });
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--outcome-kpi--0"]').click();
      });

      // Submitting Deal Group info
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.wait(2000);
      cy.get('[data-qa="deal-group-detail--title"]').should('contain', dealGroupName);

      //  Grabbing Deal-Group ID from URL
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        cy.log(urlPathName);
        dealGroupID = urlPathName.split('/').pop();
      });
      cy.wait(200); cy.log(dealGroupID);
    });

    it('Add a deal', () => {
      cy.wait(3000);
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[data-qa="deal-dashboard--add-deal"]').click().wait(4000).then(() => {
        cy.url().should('include', 'deal-dashboard/deals/create');
      });

      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();

      cy.get('[data-qa="Priority-dropdown--button"]').click().then(() => {
        cy.get('[data-qa="Priority-dropdown--select--1"]').click();
      });

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type('ABA Display').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a Template type
      cy.get('input[placeholder="Add ABA Template"]').click().type('A').then(() => {
        cy.get('typeahead-container ul li:nth-child(1)')
          .click();
      });

      // Select rate and target spend
      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').focus().clear().type('A')
        .then(() => {
          cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
            .children('li')
            .first()
            .children('a')
            .click();
        });

      cy.get('[data-qa="deal-create--name"]').clear().type(dealName);

      // Commenting below to verify this will not be need at all
      // cy.get('[data-qa="deal-create--ignore-pub-floor"]').click().then(() => {
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').should('have.class', 'is-on');
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').click();
      // });

      cy.get('[data-qa="deal-add-edit--submit"]').click().wait(500).then(() => {
        cy.get('[data-qa="modal--confirm"]').click();
      });

      cy.get('[data-qa="deal-detail--title"]').should('contain', dealName);

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
      });
    });

    it('Edit Deal', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      cy.get('[class="button button--edit"]').click({ force: true }).then(() => { // Requires 'force: true' for hidden element
        cy.url().should('include', 'deal-dashboard/deals/edit/');
      });

      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      // Edit deal name
      cy.get('[data-qa="deal-create--name"]').focus().type('_edited');

      // Edit rate and target spend
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type(targetSpend);

      // Edit format
      cy.get('[data-qa="deal-form--select-format"]').click().clear().type('ABA Adhesion Display')
        .then(() => {
          cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
            .first()
            .children('a')
            .click();
        });

      // Select a Template type
      cy.get('input[placeholder="Add ABA Template"]').click().type('A').then(() => {
        cy.get('typeahead-container ul li:nth-child(2)')
          .click();
      });

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-detail--title"]').should('contain', `${dealName}_edited`);
    });
  });
});
