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

context('Deals', () => {
  describe('Deals UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });

    let dealID;
    const dealName = nameHelper.generateName('UI-Deal_created');

    it('Navigate to Dashboard', () => {
      cy.get('[data-qa="deals-dashboards--select-deals"]').click();
      cy.get('[data-qa="deals-dashboards--select-deals"]').scrollIntoView();
      cy.get('.input').first().focus().type('This is an automated test');
    });

    it('Add a deal', () => {
      cy.get('[data-qa="deals-dashboards--select-deal-groups"]').click().then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]').first().click().then(() => {
      });

      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 1000 }).first().click({ force: true }).then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      // adding wait temporarily until Deal creation page loads faster, like Deal-Group creation pg
      cy.get('[data-qa="deal-dashboard--add-deal"]').click().wait(4000).then(() => {
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

      cy.get('[data-qa="deal-create--rate"]').focus().type('10');
      cy.get('[data-qa="deal-create--target-spend"]').focus().type('10');

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

      // Edit deal name
      cy.get('[data-qa="deal-create--name"]').focus().type('_edited');

      // Edit rate and target spend
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type('10');
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type('10');

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
      cy.get('[data-qa="deal-detail--title"]').should('contain', `${dealName}_edited`);
    });

    it('Adding Targeting to the deal', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      cy.wait(500);
      cy.get('[class="button button--primary button--medium"]').click();
      // OPTIMIZATION SETTINGS
      cy.get('optimization-settings form div div:nth-child(1) div:nth-child(2) div div toggle-tabs section div div:nth-child(2) h8').click();
      cy.get('div input[name="threshold_viewability"]').click().type('10');
      cy.get('[name="sample_rate_viewability"]').focus().type('10');
      cy.get('optimization-settings form div div:nth-child(2) div:nth-child(2) div div toggle-tabs section div div:nth-child(2)').click();
      cy.get('div input[name="frequency_cap_week"]').focus().type('10');
      cy.get('div input[name="frequency_cap_day"]').focus().type('20');
      cy.get('div input[name="frequency_cap_hour"]').focus().type('30');
      // SITE LIST TARGETING
      cy.get('targeting section form section:nth-child(2) div div.input-wrapper div').click();
      cy.get('button[class="button button--secondary QA-GoToSiteList"]').click().wait(2500);
      cy.get('div div input[placeholder="Search"]').focus().type('MohammadAwad20.2.23').wait(2000);
      cy.get('button[class="button button--primary QA-addAll"]').click({ force: true }).wait(3000);
      cy.get('deal-details site-list header div.button-group button.button.button--primary.button--medium div span').wait(1500).click();
      cy.get('div.u-grid.editorial-graph-wrapper div toggle-tabs section div div:nth-child(2)').click();

      // TECHNOGRAPHIC TARGETING
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

      // CUSTOM TARGETING
      cy.get('targeting section form section:nth-child(3) div div div').click();

      cy.get('contextual-targeting [placeholder="+ Add Target Value"]').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      });
      cy.get('contextual-targeting form div div section:nth-child(2) div.layout--targeting-item div div:nth-child(1) span').click().then(() => {
        cy.get('contextual-targeting form div section:nth-child(2) div.layout--targeting-item ul li:nth-child(2) a').click();
      });
      cy.get('contextual-targeting  div section:nth-child(2) div.layout--targeting-item div.input-wrapper.input-wrapper--typeahead.u-fillRemaining tags-input section div input').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(2)').click();
      });
      cy.get('section:nth-child(2) audience-targeting [placeholder="+ Add Target Value"]').click().type('Abc').click();

      cy.get('audience-targeting form div div.layout--targeting-section section:nth-child(2) div.layout--targeting-item div div:nth-child(1) div span').click().then(() => {
        cy.get('audience-targeting form div div.layout--targeting-section section:nth-child(2) div.layout--targeting-item div div:nth-child(1) ul li:nth-child(2) a').click();
      });
      cy.get('audience-targeting form div .layout--targeting-section section:nth-child(2) .layout--targeting-item div .input-wrapper.input-wrapper--typeahead.u-fillRemaining tags-input section div input').click().type('A').then(() => {
        cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(2)').click();
      });
      // will be enabeled when the bug fixed

      // GEO TARGETING
      // cy.get('geo-targeting section div.u-grid.actions-row div:nth-child(1) div div').click().then(() => {
      //   cy.get('geo-targeting  div.u-grid.actions-row > div:nth-child(1) > div > ul > li:nth-child(2) > a').click();
      // });
      // cy.get('geo-targeting [placeholder="Choose a location"]').focus().type('new york').then(() => {
      //   cy.get('ul.dropdown-menu:nth-child(1) li:nth-child(1)').click();
      // });
      cy.get('[class="button button--primary button--medium"]').click().wait(1000);
      cy.get('div[class="button-group push-wrapper"] button').click();
      cy.wait(3000);
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
          assert.equal(resp.body.targeting.editorialGraph, true, 'editorialGraph ');
          assert.equal(resp.body.targeting.country.include[0], 840, 'country ');
          assert.equal(resp.body.CPM, 1000, 'CPM Value');
          assert.equal(resp.body.priority, 6, 'Priority');
          // assert.equal(resp.body.targeting.city.exclude[0], 18014, 'city ');
          assert.equal(resp.body.targeting.carrier.include[0], 'att inc.', 'carrier ');
          assert.equal(resp.body.targeting.os.include[0], 'blackberry', 'os ');
          assert.equal(resp.body.targeting.browser.include[0], 'android', 'browser ');
          assert.equal(resp.body.targeting.socialBrowser.include[0], 'facebook', 'socialBrowser include value ');
          assert.equal(resp.body.targeting.isp.include[0], 'comcast cable communications inc.', 'isp include value ');
          assert.equal(resp.body.viewabilitySampling, 1, 'veiwability sampling ');
          assert.equal(resp.body.frequencyCap.day, 20, 'day ');
          assert.equal(resp.body.frequencyCap.hour, 30, 'hour');
          assert.equal(resp.body.frequencyCap.week, 10, 'week');
          // Custom Targeting
          assert.equal(resp.body.targeting.custom.logicalOperator, 'AND', 'Logical Operator');
          assert.equal(resp.body.targeting.custom.children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
          assert.equal(resp.body.targeting.custom.children[0].children[0].valueNames, 'apac-airnz', 'Value name (Grapeshot) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].keyName, 'citadel', 'Vendor type (citadel) ');
          assert.equal(resp.body.targeting.custom.children[0].children[1].valueNames[0], '5108f0b9-7509-4ea9-83d8-054c2f2621ed', 'Value name (citadel) ');
          assert.equal(resp.body.targeting.custom.children[1].logicalOperator, 'OR', 'operator between Audience Targeting sets  ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].keyName, 'ksg', 'Vendor type (krux) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[0].valueNames, 'abc', 'Value name (krux) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].keyName, 'mas', 'Vendor type (mas) ');
          assert.equal(resp.body.targeting.custom.children[1].children[0].children[1].valueNames, '2Ya', 'Value name (mas) ');
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
  });
});
