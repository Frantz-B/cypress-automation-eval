/* eslint-disable linebreak-style */
const { login } = require('../../helpers/login-helper');
const { generateName, generateRandomNum } = require('../../helpers/name-helper');

context('Deals', () => {
  describe('Deals UI', () => {
    let userSessionToken;

    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });

    let dealID;
    let citadelValue;
    let masValue;
    let gsValue;
    let rateValue;
    const dealName = generateName('UI-Deal');
    const rate = generateRandomNum(200);
    const targetSpend = generateRandomNum(200);
    let executionID;
    let formatID;
    let Type;
    let id;
    const getRequest = (options = {}) => {
      const defaultOptions = {
        auth: {
          bearer: Cypress.env('authToken'),
        },
        url: '/api/v1/deal',
      };
      return Cypress._.extend(defaultOptions, options);
    };

    it('Add a deal', () => {
      cy.visit('');
      cy.get('[data-qa="deals-dashboards--select-deal-groups"]').click().then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 1000 }).first().click().then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      // adding wait temporarily until Deal creation page loads faster, like Deal-Group creation pg
      cy.get('[data-qa="deal-dashboard--add-deal"]', { timeout: 6000 }).click().then(() => {
        cy.url().should('include', 'deal-dashboard/deals/create');
      });
      cy.get('[data-qa="deal-create--name"]').focus().clear().type(dealName);
      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
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

      // Select rate and target spend
      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').clear().type('A').then(() => {
        cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
          .children('li')
          .first()
          .children('a')
          .click();
      });

      // Commenting below to verify this will not be need at all
      // cy.get('[data-qa="deal-create--ignore-pub-floor"]').click().then(() => {
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').should('have.class', 'is-on');
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').click();
      // });

      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();

      cy.get('[data-qa="deal-detail--title"]').should('contain', dealName);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
      });
    });

    it('Retrieve the deal', () => {
      const requestOptions = getRequest();
      requestOptions.url = `/api/v1/deal/${dealID}?with=dealGroup.siteList.siteListProperty,dealBuyer,siteList.siteListProperty,dealBuyer.bidder,dealBuyer.seat,dealAdvertiser`;
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealID, 'deal group ID value ');
          executionID = resp.body.km_execution_id;
          formatID = resp.body.km_format_id;
          Type = resp.body.type;
          id = resp.body.deal_id;
        });
    });

    it('Checking History for deal', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deals/${dealID}`);
      cy.get('div.actions.u-pullRight.u-fillRemaining a:nth-child(2)', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', 'DRAFT');
      cy.get('div:nth-child(4) pre').should('contain', dealID);
      // cy.get('div:nth-child(6) > pre').should('contain', '{"disablePauseOutOfView":false}');
      cy.get('div:nth-child(10) pre').should('contain', executionID);
      cy.get('div:nth-child(12) pre').should('contain', formatID);
      cy.get('div:nth-child(14) pre').should('contain', dealName);
      cy.get('div:nth-child(16) pre').should('contain', rate);
      cy.get('div:nth-child(28) pre').should('contain', targetSpend);
      cy.get('div:nth-child(30) pre').should('contain', Type);
      cy.get('div:nth-child(23) pre').should('contain', 'highest');
      cy.get('div:nth-child(38) pre').should('contain', id);
    });

    it('Edit Deal', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      cy.get('[class="button button--edit"]').click({ force: true }).then(() => { // Requires 'force: true' for hidden element
        cy.url().should('include', 'deal-dashboard/deals/edit/');
      });

      // Edit deal name
      cy.get('[data-qa="deal-create--name"]').focus().type('_edited');

      // Edit rate and target spend
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type(targetSpend);

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').clear().type('Anchor').then(() => {
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

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-detail--title"]', { timeout: 10000 }).should('contain', `${dealName}_edited`);
      cy.get('[data-qa="deal-detail--deal_rate"]')
        .invoke('text').then((text) => {
          rateValue = text.replace(/\D/g, ''); // Using Regex to grab number from string
        });
    });

    it('Retrieve the deal', () => {
      const requestOptions = getRequest();
      requestOptions.url = `/api/v1/deal/${dealID}?with=dealGroup.siteList.siteListProperty,dealBuyer,siteList.siteListProperty,dealBuyer.bidder,dealBuyer.seat,dealAdvertiser`;
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealID, 'deal group ID value ');
          executionID = resp.body.km_execution_id;
          formatID = resp.body.km_format_id;
          Type = resp.body.type;
          id = resp.body.deal_id;
        });
    });

    it('Checking History for deal-group after editing', () => {
      cy.get('a:nth-child(2) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(2) .history-log-kind-column.u-centerXY.one-frame').should('contain', ' Edited ');
      cy.get('div:nth-child(3) > pre').should('contain', `${dealName}_edited`);
      cy.get('div:nth-child(9) pre').should('contain', rate);
      cy.get('div:nth-child(15) > pre').should('contain', formatID);
    });

    it('Adding Targeting to the deal and Pushing to Ad Server', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      // cy.visit('/deal-dashboard/deals/83258');
      cy.get('[data-qa="targeting--edit_targeting"]').click();

      // OPTIMIZATION SETTINGS
      cy.get('[data-qa="toggle-tabs--select-viewability-On"]').click();
      cy.get('[data-qa="optimization-settings--viewability-threshold"]').click().type('10');
      cy.get('[data-qa="optimization-settings--sample-rate"]').focus().clear().type('84');
      cy.get('[data-qa="toggle-tabs--select-frequency-cap-On"]').click();
      cy.get('[data-qa="optimization-settings--frequency-cap-week"]').focus().type('10');
      cy.get('[data-qa="optimization-settings--frequency-cap-day"]').focus().type('20');
      cy.get('[data-qa="optimization-settings--frequency-cap-hour"]').focus().type('30');

      // SITE LIST TARGETING
      cy.get('[data-qa="targeting--site-list-targeting--switch"]').click();
      cy.get('[data-qa="site-list-table--add-existing-btn"]').click();
      cy.get('div [data-qa="site-list-table--search-site-list"]').focus().type('Mo');
      cy.get('[class="active"]').first().click(); // selecting 1st option from dropdown

      // will enable after proper site-list is chosen
      // cy.get('[data-qa="toggle-tabs--select-editorial-graph-ON"]').click();

      // CUSTOM TARGETING
      cy.get('[data-qa="targeting--custom-targeting--switch"]').click();
      cy.get('[data-qa="contextual-targeting--include_grapeshot_input"]').click().type('apac-airnz{enter}');
      cy.get('[data-qa="contextual-targeting--key_exclude_dropdown"]').click();
      cy.get('[data-qa="contextual-targeting--exclude_Citadel"]').click();
      cy.get('[data-qa="contextual-targeting--exclude_citadel_input"]').click().type('f55ffa62{enter}');
      cy.get('[data-qa="audience-targeting--include_krux_input"]').click().type('qa-krux{enter}');
      cy.get('[data-qa="audience-targeting--key_exclude_dropdown"]').click();
      cy.get('[data-qa="audience-targeting--exclude_MAS"]').click();
      cy.get('[data-qa="audience-targeting--exclude_mas_input"]').click().type('A{enter}');

      // TECHNOGRAPHIC TARGETING
      cy.get('[placeholder="+ Add Browser"]').click().type('firefox{enter}');
      cy.get('[placeholder="+ Add Operating System"]').click().type('nintendo{enter}');
      cy.get('[placeholder="+ Add ISP Target"]').click().type('digital{enter}');
      cy.get('[placeholder="+ Add Carrier"]').click().type('at&t{enter}');
      cy.get('[placeholder="+ Add Social"]').click().type('pin{enter}');
      cy.get('[placeholder="+ Add Device"]').click();
      cy.contains('Tablet', { timeout: 9000 }).click();

      // GEO TARGETING
      cy.get('[data-qa="geo-targeting--dropdown_type"]').click();
      cy.get('[data-qa="geo-targeting--dropdown_type_EXCLUDE"]').click();
      cy.get('[placeholder="Choose a location"]').focus().type('tokyo');
      cy.contains('Region').click(); // selecting Region version option from dropdown
      cy.get('[data-qa="targeting--save_targeting"]').click().wait(2400);

      cy.get('[data-qa="deal-details--push_to_ad_server"]').click();
      cy.wait(2000); // Adding this way to make sure data is pushed fully to external systems.

      cy.get('p2:nth-child(2)').should('have', 'Tablet'); // Verifying Deal has tablet in devices section

      // Grabbing targeting values from saved state of deal targeting section
      cy.get('contextual-targeting section:nth-child(1) p2')
        .invoke('text').then((text) => {
          gsValue = text;
        });
      cy.get('contextual-targeting section:nth-child(2) p2')
        .invoke('text').then((text) => {
          citadelValue = text;
        });
      cy.get('audience-targeting div.layout--targeting-section section:nth-child(2) p2')
        .invoke('text').then((text) => {
          masValue = text;
        });
    });

    it('Retrieve data for PFR Deal from SSP', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.name, `${dealName}_edited`, 'deal Name ');
          assert.equal(resp.body.external_id, dealID, 'deal ID ');
          assert.equal(resp.body.type, 'preferred_fixed_price', 'Deal Type ');
        });
    });

    it('Retrieve data for PFR Deal from kraken', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/kraken`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.active, true, 'active ');
          assert.equal(resp.body.adFormat, 3, 'adFormat type ');
          assert.equal(resp.body.CPM, rateValue, 'CPM Value');
          assert.equal(resp.body.priority, 6, 'Priority');
          assert.equal(resp.body.viewabilitySampling, 0.84, 'veiwability sampling ');
          assert.equal(resp.body.frequencyCap.day, 20, 'day ');
          assert.equal(resp.body.frequencyCap.hour, 30, 'hour');
          assert.equal(resp.body.frequencyCap.week, 10, 'week');
          assert.equal(resp.body.targeting.editorialGraph, false, 'editorialGraph '); // will change to true
          assert.equal(resp.body.targeting.deviceType.include[0], 'phone', 'device type ');
          assert.equal(resp.body.targeting.country.include[0], 840, 'country ');
          assert.equal(resp.body.targeting.region.exclude[0], '9492', 'region ');
          assert.equal(resp.body.targeting.carrier.include[0], 'att inc.', 'carrier ');
          assert.equal(resp.body.targeting.os.include[0], 'nintendo', 'os ');
          assert.equal(resp.body.targeting.browser.include[0], 'firefox', 'browser ');
          assert.equal(resp.body.targeting.socialBrowser.include[0], 'pinterest', 'socialBrowser include value ');
          assert.equal(resp.body.targeting.isp.include[0], 'digital ocean inc.', 'isp include value ');
          assert.equal(resp.body.targeting.deviceType.include[1], 'tablet', 'device type ');

          // Custom Targeting
          assert.equal(resp.body.targeting.custom.logicalOperator, 'AND', 'Logical Operator');
          assert.equal(resp.body.targeting.custom.children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].valueNames, gsValue, 'Value name (Grapeshot) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].keyName, 'citadel', 'Vendor type (citadel) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].valueNames[0], citadelValue, 'Value name (citadel) ');
          assert.equal(resp.body.targeting.custom.children[1].logicalOperator, 'OR', 'operator between Audience Targeting sets  ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].keyName, 'ksg', 'Vendor type (krux) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].valueNames, 'qa-krux', 'Value name (krux) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].keyName, 'mas', 'Vendor type (mas) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].valueNames, masValue, 'Value name (mas) ');
        });
    });
  });
});
