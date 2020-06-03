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
    const dealData = {
      formatType: 'Bottom Banner',
      executionName: 'AbedEXECUTION  28-6 8.51',
      rate: generateRandomNum(200),
      discount: generateRandomNum(10),
      targetSpend: generateRandomNum(200),
      bidderName: '1072 Charo',
      advertiser: '10aug2017adver -dev',
      priority: 'Highest',
    };
    let dealID;
    let citadelValue;
    // let masValue; temporarily until MAS is working
    let gsValue;
    let rateValue;
    const dealName = generateName('UI-Deal');
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
      const searchTerm = Cypress.moment().format('YY.MM'); // Search for a deal-group made via automation

      cy.visit('');
      cy.server();
      cy.route(`/api/v1/deal-group?limit=25&page=1&search=${searchTerm}&is_archived=false&exclude_tests=true&by_user=false`).as('searchAPI');

      cy.get('[placeholder="Search"]', { timeout: 4000 }).type(searchTerm).wait('@searchAPI');
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 1000 }).first().click();
      cy.url().should('include', 'deal-dashboard/deal-groups');
      cy.get('[data-qa="deal-dashboard--add-deal"]', { timeout: 6000 }).click();
      cy.url().should('include', 'deal-dashboard/deals/create');
      cy.get('[data-qa="deal-create--name"]').focus().clear().type(dealName);
      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      cy.get('[data-qa="Priority-dropdown--button"]').click();
      cy.contains(dealData.priority).click();

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click();
      cy.contains(dealData.formatType).click();
      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click();
      cy.contains(dealData.executionName).click();

      // Select rate and target spend
      cy.get('[data-qa="deal-create--rate"]').focus().type(dealData.rate);
      cy.get('[data-qa="deal-create--rate-discount"]').focus().type(dealData.discount);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(dealData.targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').click().clear();
      cy.contains(dealData.bidderName).click();
      cy.get('[data-qa="deal-form--select-advertiser"]').click().clear();
      cy.contains(dealData.advertiser).click();

      // Commenting below to verify this will not be need at all
      // cy.get('[data-qa="deal-create--ignore-pub-floor"]').click().then(() => {
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').should('have.class', 'is-on');
      //   cy.get('[data-qa="deal-create--ignore-pub-floor"]').click();
      // });

      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]', { timeout: 6000 }).click();
    });

    it('verifying deal elements', () => {
      cy.get('[data-qa="deal-detail--title"]').should('contain', dealName);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', dealData.rate);
      cy.get('[data-qa="deal-detail--deal_discount"]').should('contain', dealData.discount);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', dealData.targetSpend);
      cy.get('[data-qa="deal-detail--deal_bidder"]').should('contain', dealData.bidderName);
      cy.get('aside div:nth-child(11) p4').should('contain', dealData.executionName);
      cy.get('[data-qa="deal-detail--deal_advertiser"]').should('contain', dealData.advertiser);
      cy.get('[data-qa="deal-detail--deal_priority"]').should('contain', dealData.priority);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
        cy.log(dealID);
      });
    });

    it('Edit Deal', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      dealData.formatType = 'Anchor';
      dealData.discount = generateRandomNum(10);
      dealData.rate = generateRandomNum(200);
      dealData.targetSpend = generateRandomNum(200);
      dealData.executionName = 'Standard';

      cy.get('[class="button button--edit"]').click({ force: true }).then(() => { // Requires 'force: true' for hidden element
        cy.url().should('include', 'deal-dashboard/deals/edit/');
      });

      // Edit deal name
      cy.get('[data-qa="deal-create--name"]').focus().type('_edited');

      // Edit rate and target spend
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type(dealData.rate);
      cy.get('[data-qa="deal-create--rate-discount"]').clear().focus().type(dealData.discount);
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type(dealData.targetSpend);

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().clear();
      cy.contains(dealData.formatType).click();

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type(dealData.executionName);
      cy.contains(dealData.executionName).click();

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-detail--deal_rate"]')
        .invoke('text').then((text) => {
          rateValue = text.replace(/\D/g, ''); // Using Regex to grab number from string
        });
    });

    it('verifying deal elements', () => {
      cy.get('[data-qa="deal-detail--title"]', { timeout: 10000 }).should('contain', `${dealName}_edited`);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', dealData.rate);
      cy.get('[data-qa="deal-detail--deal_discount"]').should('contain', dealData.discount);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', dealData.targetSpend);
      cy.get('[data-qa="deal-detail--deal_bidder"]').should('contain', dealData.bidderName);
      cy.get('aside div:nth-child(11) p4').should('contain', dealData.executionName);
      cy.get('[data-qa="deal-detail--deal_advertiser"]').should('contain', dealData.advertiser);
      cy.get('[data-qa="deal-detail--deal_priority"]').should('contain', dealData.priority);
    });

    it('Adding Targeting to the deal and Pushing to Ad Server', () => {
      cy.visit(`/deal-dashboard/deals/${dealID}`);
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
      // Temp disable since MAS is not working
      // cy.get('audience-targeting div.layout--targeting-section section:nth-child(2) p2')
      //   .invoke('text').then((text) => {
      //     masValue = text;
      //   });
    });

    it('Verifying Deal Info on SSP service', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          cy.log(dealID);
          assert.equal(resp.body.name, `${dealName}_edited`, 'deal Name ');
          assert.equal(resp.body.external_id, dealID, 'deal ID ');
          assert.equal(resp.body.type, 'preferred_fixed_price', 'Deal Type ');
          assert.equal(resp.body.bidder.name, dealData.bidderName, 'Bidder name ');
          assert.equal(resp.body.ad_formats[0].name, dealData.formatType, 'adFormat name ');
          assert.equal(resp.body.ad_formats[0].type, 'banner', 'adFormat type ');
          assert.equal(resp.body.priority, 'highest', 'priority ');
        });
    });

    // MAS is temporarily not working so commented out MAS assertion
    it('Verifying Deal Info on Kraken service', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/kraken`;

      cy.request(requestOptions)
        .then((resp) => {
          const krakenResponse = resp.body;

          assert.equal(resp.status, 200, 'response status ');
          assert.equal(krakenResponse.active, true, 'active ');
          assert.equal(krakenResponse.adFormat, 3, 'adFormat type ');
          assert.equal(krakenResponse.CPM, rateValue, 'CPM Value');
          assert.equal(krakenResponse.priority, 6, 'Priority');
          assert.equal(krakenResponse.viewabilitySampling, 0.84, 'veiwability sampling ');
          assert.equal(krakenResponse.frequencyCap.day, 20, 'day ');
          assert.equal(krakenResponse.frequencyCap.hour, 30, 'hour');
          assert.equal(krakenResponse.frequencyCap.week, 10, 'week');
          assert.equal(krakenResponse.targeting.editorialGraph, false, 'editorialGraph '); // will change to true
          assert.equal(krakenResponse.targeting.deviceType.include.includes('phone'), true, 'Device type contains phone');
          assert.equal(krakenResponse.targeting.country.include[0], 840, 'country ');
          assert.equal(krakenResponse.targeting.region.exclude[0], '9492', 'region ');
          assert.equal(krakenResponse.targeting.carrier.include[0], 'att inc.', 'carrier ');
          assert.equal(krakenResponse.targeting.os.include[0], 'nintendo', 'os ');
          assert.equal(krakenResponse.targeting.browser.include[0], 'firefox', 'browser ');
          assert.equal(krakenResponse.targeting.socialBrowser.include[0], 'pinterest', 'socialBrowser include value ');
          assert.equal(krakenResponse.targeting.isp.include[0], 'digital ocean inc.', 'isp include value ');
          expect(krakenResponse.targeting.deviceType.include).to.include('tablet'); // verifying device-type

          // Custom Targeting
          assert.equal(krakenResponse.targeting.custom.logicalOperator, 'AND', 'Logical Operator');
          assert.equal(krakenResponse.targeting.custom.children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[0].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[0].valueNames, gsValue, 'Value name (Grapeshot) ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[1].keyName, 'citadel', 'Vendor type (citadel) ');
          assert.equal(krakenResponse.targeting.custom.children[0].children[1].valueNames[0], citadelValue, 'Value name (citadel) ');
          assert.equal(krakenResponse.targeting.custom.children[1].logicalOperator, 'OR', 'operator between Audience Targeting sets  ');
          assert.equal(krakenResponse.targeting.custom.children[1].children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
          assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[0].keyName, 'ksg', 'Vendor type (krux) ');
          assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[0].valueNames, 'qa-krux', 'Value name (krux) ');
          // eslint-disable-next-line max-len
          // assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          // eslint-disable-next-line max-len
          // assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[1].keyName, 'mas', 'Vendor type (mas) ');
          // eslint-disable-next-line max-len
          // assert.equal(krakenResponse.targeting.custom.children[1].children[0].children[1].valueNames, masValue, 'Value name (mas) ');
        });
    });

    it('Clicking on "Archive" button in the deal entry page', () => {
      cy.server();
      cy.route('/api/v1/citadel/segments').as('citadelApi');
      cy.route('/api/v1/users/session-user').as('sessionUserApi');
      cy.route('/api/v1/km-proxy/isp-targeting-list').as('ispApi');
      cy.route('/api/v1/km-proxy/grapeshot-categories?limit=2000').as('grapeshotApi');
      cy.route('/api/v1/km-proxy/technology-targeting-integrations').as('techTargetApi');
      cy.route('/api/v1/km-proxy/service-proxy?limit=999&page=1&requested_endpoint=api/v1/segments&requested_service=cma-mgmt&sort_direction=ASC&type=0,2,3').as('cmaApi');

      cy.visit(`deal-dashboard/deals/${dealID}`)
        .wait('@sessionUserApi')
        .wait('@grapeshotApi')
        .wait('@cmaApi')
        .wait('@citadelApi')
        .wait('@ispApi')
        .wait('@techTargetApi');
      cy.get('[data-qa="deal-detail--deal_archive"]').click();
      cy.get('[data-qa="modal--confirm"]').last().click();
    });

    it('Verifying that deal is archived', () => {
      cy.get('[data-qa="targeting--edit_targeting"]', { timeout: 8000 }).should('be.disabled');
      cy.get('.icon-archive').should('exist');
      cy.get('[data-qa="deal-detail--deal_unarchive"]').should('contain', 'Unarchive');
      cy.get('[data-qa="deal-create--goto-deal-group"] .breadcrumb').click(); // User return to deal groups entry page
      cy.get('[type="search"]', { timeout: 8000 }).clear().type(dealName);
      cy.get('.t-regular').should('exist'); // No deal is returned
      cy.get('.u-grid-gap-24 > div:nth-child(4)').click(); // Clicking no "archive" filter
      cy.get('li:nth-child(3) a').click(); // Clicking on archive option
      cy.get('[data-qa="deal-dashboard--select-deal"]', { timeout: 7000 }).should('exist');
      cy.get('.t-regular').should('not.exist'); // "No results found" text should NOT display
    });

    it('Clicking on "Unarchive" button in the deal entry page', () => {
      cy.get('[data-qa="deal-dashboard--select-deal"]').click();
      cy.get('[data-qa="deal-detail--deal_unarchive"]').click();
      cy.get('[data-qa="modal--confirm"]').last().click();
    });

    it('Verifying that deal is Unarchived', () => {
      cy.get('[data-qa="targeting--edit_targeting"]', { timeout: 8000 }).should('be.enabled');
      cy.get('.icon-archive').should('not.exist');
      cy.get('[data-qa="deal-detail--deal_archive"]').should('contain', 'Archive');
      cy.get('[data-qa="deal-create--goto-deal-group"] .breadcrumb').click(); // User return to deal groups landing page
      cy.get('[type="search"]').clear().type(dealName);
      cy.get('.t-regular').should('not.exist'); // "No results found" text should NOT display
    });
  });
});
