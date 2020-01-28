/* eslint-disable linebreak-style */
const { extend } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal',
  };
  return extend(defaultOptions, options);
};


context('Deal with Targeting', () => {
  describe('UI/Deal with Targeting', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });
    const dealName = nameHelper.generateName('Automated_Deal/UI-Created');
    const paDealName = nameHelper.generateName('Automated_PA_Deal/UI-Created');
    const pgDealName = nameHelper.generateName('Automated_PG_Deal/UI-Created');
    const dealGroupName = nameHelper.generateName('Automated_DealGroup');
    const salesforceId = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss');
    let targetSpend = Math.floor(Math.random() * 200);
    let rate;
    let dealID;
    let paDealID;
    let pgDealID;
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
    it('creating targteing in the created Deal Group', () => {
      cy.wait(3000);
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[data-qa="deal-group-detail--select-tab--targeting"]').click().wait(300);
      cy.get('[class="button button--primary button--medium"]').click().wait(500);
      cy.get('optimization-settings form div div:nth-child(1) div:nth-child(2) div div toggle-tabs section div div:nth-child(2)').click();
      cy.get('div input[name="threshold_viewability"]').focus().type('10');
      cy.get('[name="sample_rate_viewability"]').focus().type('10');
      cy.get('optimization-settings form div div:nth-child(2) div:nth-child(2) div div toggle-tabs section div div:nth-child(2)').click();
      cy.get('div input[name="frequency_cap_week"]').focus().type('10');
      cy.get('div input[name="frequency_cap_day"]').focus().type('20');
      cy.get('div input[name="frequency_cap_hour"]').focus().type('30');
      cy.get('targeting section form section:nth-child(2) div div.input-wrapper div').click();
      cy.get('button[class="button button--secondary QA-GoToSiteList"]').click().wait(500);
      cy.get('div div input[placeholder="Search"]').focus().wait(500).type('TestProperty 20.1.19_1')
        .wait(5000);
      cy.get('button[class="button button--primary QA-addAll"]').click({ force: true }).wait(2000);
      cy.get('body > deal-manager > deal-group-detail > site-list > header > div.button-group > button.button.button--primary.button--medium').wait(1500).click();
      cy.get('div.u-grid.editorial-graph-wrapper div toggle-tabs section div div:nth-child(2)').click();
      cy.get('[placeholder="+ Add Browser"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('[placeholder="+ Add Operating System"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('[placeholder="+ Add ISP Target"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('[placeholder="+ Add Carrier"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('[placeholder="+ Add Social"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('[placeholder="+ Add Device"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('targeting section form section:nth-child(3) div div div').click();

      cy.get('contextual-targeting [placeholder="+ Add Target Value"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('contextual-targeting [placeholder="+ Add Anti-Target Value"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(2)').click();
      });
      cy.get('section:nth-child(2) audience-targeting [placeholder="+ Add Target Value"]').click().type('Abc').click();
      cy.get('section:nth-child(2) audience-targeting [placeholder="+ Add Anti-Target Value"]').click().type('Abc').click();

      cy.get('geo-targeting section div.u-grid.actions-row div:nth-child(1) div div').click().then(() => {
        cy.get('ul.dropdown-menu li:nth-child(2)').click();
      });
      cy.get('geo-targeting [placeholder="Choose a location"]').focus().type('new york').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });

      cy.get('targeting section [class="button button--primary button--medium"]').click().wait(1000);
    });
    // Creating a Deal
    it('Creating a PFR Deal in the created Deal group', () => {
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);


      cy.get('[class="button button--primary button--medium button--add-deal"]').click();
      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      cy.get('[data-qa="deal-create--name"]').clear().then(() => {
        cy.get('[data-qa="deal-create--name"]').focus().type(dealName);
      });

      cy.get('[data-qa="Priority-dropdown--button"]').click().then(() => {
        cy.get('[data-qa="Priority-dropdown--select--1"]').click();
      });

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type('Bottom Banner').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type('A').then(() => {
        cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });
      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').focus().clear().type(bidderUpdatedName)
        .then(() => {
          cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
            .children('li')
            .first()
            .children('a')
            .click();
        });
      cy.get('[data-qa="deal-add-edit--submit"]').click().wait(500).then(() => {
        cy.get('[data-qa="modal--confirm"]').click();
      });
      cy.get('[data-qa="deal-detail--title"]').should('contain', dealName);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop();
      });
      cy.get('[class="button button--secondary button--apply"]').click().wait(1000);
    });
    it('creating a PA Deal in the created Deal group', () => {
      cy.wait(3000);
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[class="button button--primary button--medium button--add-deal"]').click();
      cy.get('[data-qa="deal-create--set-private-auction"]').click();
      cy.get('[data-qa="deal-create--name"]').clear().then(() => {
        cy.get('[data-qa="deal-create--name"]').focus().type(paDealName);
      });
      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type('Bottom Banner').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type('A').then(() => {
        cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });
      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').focus().clear().type(bidderUpdatedName)
        .then(() => {
          cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
            .children('li')
            .first()
            .children('a')
            .click();
        });
      cy.get('[data-qa="deal-add-edit--submit"]').click().wait(500).then(() => {
        cy.get('[data-qa="modal--confirm"]').click();
      });
      cy.get('[data-qa="deal-detail--title"]').should('contain', paDealName);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        paDealID = urlPathName.split('/').pop();
      });
      cy.get('[class="button button--secondary button--apply"]').click().wait(1000);
    });
    it('creating a PG Deal in the created Deal group', () => {
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[class="button button--primary button--medium button--add-deal"]').click();
      cy.get('[data-qa="deal-create--set-programmatic-guaranteed"]').click();
      cy.get('[data-qa="deal-create--impression-goal"]').focus().type(10);
      cy.get('[data-qa="deal-create--buffer-percentage"]').focus().type(10);
      cy.get('[data-qa="deal-create--name"]').clear().then(() => {
        cy.get('[data-qa="deal-create--name"]').focus().type(pgDealName);
      });
      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type('Bottom Banner').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type('A').then(() => {
        cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });
      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').focus().clear().type(bidderUpdatedName)
        .then(() => {
          cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
            .children('li')
            .first()
            .children('a')
            .click();
        });
      cy.get('[data-qa="deal-add-edit--submit"]').click().wait(500).then(() => {
        cy.get('[data-qa="modal--confirm"]').click();
      });
      cy.get('[data-qa="deal-detail--title"]').should('contain', pgDealName);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        pgDealID = urlPathName.split('/').pop();
      });
      cy.get('[class="button button--secondary button--apply"]').click().wait(1000);
    });
    it('Pushing the Deals', () => {
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[data-qa="deal-group-detail--push_to_ad_server"]').click().wait(4000);
    });

    it('Retrieve data for PFR Deal from kraken', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/kraken`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.active, true, 'active ');
        });
    });
    it('Retrieve data for PFR Deal from SSP', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.name, dealName, 'deal Name ');
          assert.equal(resp.body.external_id, dealID, 'deal ID ');
          assert.equal(resp.body.type, 'preferred_fixed_price', 'Deal Type ');
        });
    });
    // ///////////////////////////////////////////
    it('Retrieve data for PA Deal from kraken', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${paDealID}/kraken`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          cy.log(paDealID);
          assert.equal(resp.body.active, true, 'active ');
        });
    });
    it('Retrieve data for PA Deal from SSP', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${paDealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          cy.log(paDealID);
          assert.equal(resp.body.name, paDealName, 'deal Name ');
          assert.equal(resp.body.external_id, paDealID, 'deal ID ');
          assert.equal(resp.body.type, 'private_auction', 'Deal Type ');
        });
    });
    it('Retrieve data for PG Deal from kraken', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${pgDealID}/kraken`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.active, false, 'active ');
        });
    });
    it('Retrieve data for PG Deal from SSP', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${pgDealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.name, pgDealName, 'deal Name ');
          assert.equal(resp.body.external_id, pgDealID, 'deal ID ');
          assert.equal(resp.body.type, 'programmatic_guaranteed', 'Deal Type ');
        });
    });
  });
});
