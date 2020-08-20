const { login } = require('../../helpers/login-helper');
const { generateName, generateRandomNum, generateRandomNumBetween } = require('../../helpers/name-helper');

context('Deals', () => {
  describe('Deals UI', () => {
    let userSessionToken;

    before(async () => {
      userSessionToken = await login('Frantz+19.12.04@kargo.com', 'admin'); // This login allows to view option to Ignore Pub Floors
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });
    const deal = {};
    let externalDealId;
    let dealType;

    const getRequest = (options = {}) => {
      const defaultOptions = {
        auth: {
          bearer: Cypress.env('authToken'),
        },
        url: '/api/v1/deal',
      };
      return Cypress._.extend(defaultOptions, options);
    };

    it('Add Preferred-Fixed-Rate Deal', () => {
      deal.executionName = 'Standard';
      deal.formatName = 'Bottom Banner';
      deal.bidderName = 'BidSwitch-dev';
      deal.rate = generateRandomNum(200);
      deal.name = generateName('UI-Deal');
      deal.discount = generateRandomNum(100);
      deal.targetSpend = generateRandomNum(4000);
      deal.advertiser = 'Frantz-09.17 max effort -Dev';
      deal.exclusivity = 'Social Canvas';
      const recentlyCreatedDealGroup = Cypress.moment().format('YY.MM'); // Search for a deal-group made via automation

      cy.server();
      cy.route('POST', '/api/v1/deal').as('dealCreation');
      cy.route(`/api/v1/deal-group?limit=25&page=1&search=${recentlyCreatedDealGroup}&is_archived=false&exclude_tests=true&by_user=false`).as('searchAPI');

      cy.visit('');
      cy.get('[placeholder="Search"]', { timeout: 8000 }).type(recentlyCreatedDealGroup).wait('@searchAPI');
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 8000 }).first().click();
      cy.url().should('include', 'deal-dashboard/deal-groups');
      cy.get('[data-qa="deal-dashboard--add-deal"]', { timeout: 8000 }).click();
      cy.url().should('include', 'deal-dashboard/deals/create');
      cy.get('[data-qa="deal-create--name"]').focus().clear().type(deal.name);
      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      cy.get('[data-qa="Priority-dropdown--button"]').click();
      cy.get('[data-qa="Priority-dropdown--select--1"]').click(); // Selects 'Highest' priority to match deal.priority
      deal.priority = 'Highest';

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type(deal.formatName);
      cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type(deal.executionName);
      cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();

      // Select rate and target spend
      cy.get('[data-qa="deal-create--rate"]').focus().type(deal.rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(deal.targetSpend);
      cy.get('[data-qa="deal-create--rate-discount"]').focus().clear().type(deal.discount); // clear() needed since field initially has a '0'

      // test
      cy.get('[data-qa="deal-form--inventory_exclusivity"]').click().then(() => {
        cy.get('section:nth-child(1) div:nth-child(8) div div ul li:nth-child(2) a').click({ force: true });
      });

      // Turning on option to Ignore Publisher Floors
      cy.get('[data-qa="deal-create--ignore-pub-floor"]').click().should('have.class', 'is-on');
      deal.pubFloorStatus = true; // Setting to 'true' due to above statement
      deal.ignorePubFloor = 'Yes'; // Setting to 'Yes' due this option being now turned on

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').clear().type(deal.bidderName);
      cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
        .children('li')
        .first()
        .children('a')
        .click();

      cy.get('[data-qa="deal-form--select-advertiser"]').clear().type(deal.advertiser);
      cy.get('[class="active"]').should('be.visible').click(); // Clicking on 1st result for Advertiser

      cy.get('[data-qa="deal-add-edit--submit"]').should('be.visible').click();
      cy.get('[data-qa="modal--confirm"]').should('be.visible').click().wait('@dealCreation');

      cy.get('[data-qa="deal-detail--title"]').should('contain', deal.name);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        deal.id = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
      });
    });

    it('Verifying Created Preferred-Fixed-Rate Deal elements on Detail Page - left section', () => {
      cy.visit(`/deal-dashboard/deals/${deal.id}`);
      cy.get('[data-qa="deal-detail--title"]', { timeout: 8000 }).should('contain', deal.name).should('be.visible'); // 'be.visible needed so cypress does not see it as hidden during run // 'be.visible' needed so cypress does not see it as hidden during run
      cy.get('[data-qa="deal-detail--deal_execution"]').should('contain', deal.executionName);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', deal.rate);
      cy.get('[data-qa="deal-detail--deal_format"]').should('contain', deal.formatName);
      cy.get('[data-qa="deal-detail--deal_bidder"]').should('contain', deal.bidderName);
      cy.get('[data-qa="deal-detail--deal_discount"]').should('contain', deal.discount);
      cy.get('[data-qa="deal-detail--deal_priority"]').should('contain', deal.priority);
      cy.get('[data-qa="deal-detail--deal_advertiser"]').should('contain', deal.advertiser);
      cy.get('[data-qa="deal-detail--deal_ignore_pub_floors"]').should('contain', deal.ignorePubFloor);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', Intl.NumberFormat().format(deal.targetSpend));
      cy.get('[data-qa="deal-detail--deal_inventory_exclusivity"]').should('contain', deal.exclusivity);
    });

    it('Edit Preferred-Fixed-Rate Deal', () => {
      deal.name += '-edited';
      deal.formatName = 'Anchor';
      deal.rate = generateRandomNum(200);
      deal.discount = generateRandomNum(10);
      deal.executionName = 'Slide to Reveal';
      deal.targetSpend = generateRandomNum(200);

      cy.visit(`/deal-dashboard/deals/${deal.id}`);
      cy.get('[class="button button--edit"]', { timeout: 8000 }).click({ force: true }); // Requires 'force: true' for hidden element
      cy.url().should('include', 'deal-dashboard/deals/edit/');

      // Edit Deal Name
      cy.get('[data-qa="deal-create--name"]').focus().clear().type(deal.name);

      // Edit Rate, Target Spend, & Discount
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type(deal.rate);
      cy.get('[data-qa="deal-create--rate-discount"]').focus().clear().type(deal.discount); // clear() needed since field initially has a '0'
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type(deal.targetSpend);

      // Select a Format
      cy.get('[data-qa="deal-form--select-format"]').clear().type(deal.formatName);
      cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type(deal.executionName);
      cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-detail--title"]', { timeout: 8000 }).should('contain', deal.name);
    });

    it('Verifying Edited Preferred-Fixed-Rate Deal elements on Detail Page - left section', () => {
      cy.visit(`/deal-dashboard/deals/${deal.id}`);
      cy.get('[data-qa="deal-detail--title"]', { timeout: 8000 }).should('contain', deal.name).should('be.visible'); // 'be.visible needed so cypress does not see it as hidden during run
      cy.get('[data-qa="deal-detail--deal_execution"]', { timeout: 8000 }).should('contain', deal.executionName);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', deal.rate);
      cy.get('[data-qa="deal-detail--deal_format"]').should('contain', deal.formatName);
      cy.get('[data-qa="deal-detail--deal_bidder"]').should('contain', deal.bidderName);
      cy.get('[data-qa="deal-detail--deal_discount"]').should('contain', deal.discount);
      cy.get('[data-qa="deal-detail--deal_priority"]').should('contain', deal.priority);
      cy.get('[data-qa="deal-detail--deal_advertiser"]').should('contain', deal.advertiser);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', Intl.NumberFormat().format(deal.targetSpend));
    });

    it('Adding Targeting to the Preferred-Fixed-Rate Deal and Pushing to Ad Server', () => {
      deal.masValue = 'YD';
      deal.priorityKraken = 6; // Default Kraken Priority that is pushed. User can't change from UI
      deal.osValue = 'Nintendo';
      deal.kruxValue = 'qa-krux';
      deal.browserValue = 'Firefox';
      deal.carrierValue = 'T-Mobile';
      deal.socialValue = 'Pinterest';
      deal.grapeShotValue = 'apac-airnz';
      deal.ispValue = 'digital ocean inc.';
      deal.deviceValue = ['phone', 'Tablet'];
      deal.includeSocialCanvas = 'volvo-safety';
      deal.excludeSocialCanvas = 'volvo-masters';
      deal.locationValue = { name: 'Tokyo', id: 9492 };
      deal.viewabilitySampling = Math.floor(Math.random() * 99) + 1;
      deal.viewabilityThreshold = generateRandomNum(100);
      deal.citadelValue = 'f55ffa62-e24e-411c-be8b-ab5f0da12ea0';
      deal.frequencyCapHour = generateRandomNumBetween(1, 7); // Show any # from 1-7 times an hour
      deal.frequencyCapDay = generateRandomNumBetween(8, 21); // Show any # from 8-21 times a day
      deal.frequencyCapWeek = generateRandomNumBetween(22, 80); // Show # from 22-80 times a week
      // Above FrequencyCap variables follow the formula of: 'Math.random() * (max - min) + min;'

      cy.server();
      cy.route('PATCH', '/api/v1/deal/*').as('dmUpdate');
      cy.route('/api/v1/deal/*/push-status').as('pushStatus');
      cy.route('/api/v1/citadel/segments').as('citadelUpdate');
      cy.route('POST', '/api/v1/deal/*/sync').as('adServerPush');
      cy.route('/api/v1/km-proxy/isp-targeting-list').as('ispTargetingUpdate');
      cy.route('/api/v1/km-proxy/technology-targeting-integrations').as('techTargetingUpdate');
      cy.route('/api/v1/km-proxy/grapeshot-categories?limit=2000').as('grapeShotUpdate');

      cy.visit(`/deal-dashboard/deals/${deal.id}`);
      cy.get('[data-qa="targeting--edit_targeting"]').click();

      // OPTIMIZATION SETTINGS
      cy.get('[data-qa="toggle-tabs--select-viewability-On"]').click();
      cy.get('[data-qa="optimization-settings--sample-rate"]').focus().clear().type(deal.viewabilitySampling);
      cy.get('[data-qa="optimization-settings--viewability-threshold"]').clear().click().type(deal.viewabilityThreshold);
      cy.get('[data-qa="toggle-tabs--select-frequency-cap-On"]').click();
      cy.get('[data-qa="optimization-settings--frequency-cap-week"]').focus().type(deal.frequencyCapWeek);
      cy.get('[data-qa="optimization-settings--frequency-cap-day"]').focus().type(deal.frequencyCapDay);
      cy.get('[data-qa="optimization-settings--frequency-cap-hour"]').focus().type(deal.frequencyCapHour);

      // SITE LIST TARGETING
      cy.get('[data-qa="targeting--site-list-targeting--switch"]').click();
      cy.get('[data-qa="site-list-table--add-existing-btn"]').click();
      cy.get('div [data-qa="site-list-table--search-site-list"]').focus().type('Mo');
      cy.get('[class="active"]').first().click(); // selecting 1st option from dropdown

      // will enable after proper site-list is chosen
      // cy.get('[data-qa="toggle-tabs--select-editorial-graph-ON"]').click();

      // CUSTOM TARGETING
      cy.get('[data-qa="targeting--custom-targeting--switch"]').click();
      cy.get('[data-qa="contextual-targeting--include_grapeshot_input"]').click().type(`${deal.grapeShotValue}{enter}`);
      cy.get('[data-qa="contextual-targeting--key_exclude_dropdown"]').click();
      cy.get('[data-qa="contextual-targeting--exclude_Citadel"]').click();
      cy.get('[data-qa="contextual-targeting--exclude_citadel_input"]').click().type(`${deal.citadelValue}{enter}`);
      cy.get('[data-qa="audience-targeting--include_krux_input"]').click().type(`${deal.kruxValue}{enter}`);
      cy.get('[data-qa="audience-targeting--key_exclude_dropdown"]').click();
      cy.get('[data-qa="audience-targeting--exclude_MAS"]').click();
      cy.get('[data-qa="audience-targeting--exclude_mas_input"]').click().type(`${deal.masValue}{enter}`);

      // Adding social canvas targeting
      // include
      cy.get('[data-qa="audience-targeting--add_include_extra_key"]').click();
      cy.get('audience-targeting > form > div > div.layout--targeting-section > section:nth-child(1) > div:nth-child(2) > div > div:nth-child(1) > div > div').click();
      cy.get('[data-qa="audience-targeting--include_Social Canvas"]').click();
      cy.get('[data-qa="audience-targeting--include_social_canvas_input"]').click().type(`${deal.includeSocialCanvas}{enter}`);
      // exclude
      cy.get('[data-qa="audience-targeting--add_exclude_extra_key"]').click();
      cy.get('audience-targeting > form > div > div.layout--targeting-section > section:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div > div').click();
      cy.get('audience-targeting > form > div > div.layout--targeting-section > section:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div > ul > li:nth-child(3) > a').click();
      cy.get('[data-qa="audience-targeting--exclude_social_canvas_input"]').click().type(`${deal.excludeSocialCanvas}{enter}`);

      // TECHNOGRAPHIC TARGETING
      cy.get('[placeholder="+ Add Browser"]').click().type(`${deal.browserValue}{enter}`);
      cy.get('[placeholder="+ Add Operating System"]').click().type(`${deal.osValue}{enter}`);
      cy.get('[placeholder="+ Add ISP Target"]').click().type(`${deal.ispValue}{enter}`);
      cy.get('[placeholder="+ Add Carrier"]').click().type(`${deal.carrierValue}{enter}`);
      cy.get('[placeholder="+ Add Social"]').click().type(`${deal.socialValue}{enter}`);
      cy.get('[placeholder="+ Add Device"]').click().type(`${deal.deviceValue[1]}{enter}`);
      // cy.contains(deal.deviceValue[1], { timeout: 8000 }).click();

      // GEO TARGETING
      cy.get('[data-qa="geo-targeting--dropdown_type"]').click();
      cy.get('[data-qa="geo-targeting--dropdown_type_EXCLUDE"]').click();
      cy.get('[placeholder="Choose a location"]').focus().type(deal.locationValue.name);
      cy.contains('Region', { timeout: 8000 }).click(); // selecting Region version option from dropdown in UI
      cy.get('[data-qa="targeting--save_targeting"]').click().wait(['@dmUpdate', '@ispTargetingUpdate', '@techTargetingUpdate', '@grapeShotUpdate', '@citadelUpdate']);

      cy.get('[data-qa="deal-details--push_to_ad_server"]').click().wait('@adServerPush'); // Adding this way to make sure data is pushed fully to external systems.

      /* This request is executed 3 times during this test and waits
       * are needed for external (SSP & Kraken) calls not to
       * fail due to GET requests calling them prematurely
       */
      cy.wait('@pushStatus')
        .wait('@pushStatus')
        .wait('@pushStatus').its('status')
        .should('eq', 200);
    });

    it('Verifying targeting in UI', () => {
      cy.get('optimization-settings p:nth-child(3)').should('contain', deal.viewabilityThreshold);
      cy.get('optimization-settings p:nth-child(4)').should('contain', deal.viewabilitySampling);
      cy.get('optimization-settings div:nth-child(1) > p:nth-child(1) > strong').should('contain', deal.frequencyCapWeek);
      cy.get('optimization-settings div:nth-child(2) > p:nth-child(1) > strong').should('contain', deal.frequencyCapDay);
      cy.get('optimization-settings div:nth-child(3) > p:nth-child(1) > strong').should('contain', deal.frequencyCapHour);
      cy.get('contextual-targeting section:nth-child(1) p2').should('contain', deal.grapeShotValue);
      cy.get('contextual-targeting section:nth-child(2) p2').should('contain', deal.citadelValue);
      cy.get('audience-targeting  section:nth-child(1) p2').should('contain', deal.kruxValue);
      cy.get('audience-targeting  section:nth-child(2) p2').should('contain', deal.masValue);
      cy.get('geo-targeting div.target.target--subtarget').should('contain', deal.locationValue.name);
      cy.get('technographic-targeting  div div:nth-child(1) p2').should('contain', deal.browserValue);
      cy.get('technographic-targeting form div div:nth-child(2) div p2').should('contain', deal.osValue);
      cy.get('technographic-targeting form div div:nth-child(3) div p2').should('contain', deal.ispValue);
      cy.get('technographic-targeting form div div:nth-child(4) div p2').should('contain', deal.carrierValue);
      cy.get('technographic-targeting form div div:nth-child(5) div p2').should('contain', deal.socialValue);
      cy.get('technographic-targeting form div div:nth-child(6) div p2').should('contain', deal.deviceValue[1]);
      cy.get('[data-qa="deal-detail--deal_type"]').invoke('text').then((text) => {
        dealType = text; // Grabbing external deal id
      });

      cy.get('deal-details aside div h4').invoke('text').then((text) => {
        externalDealId = text; // Grabbing external deal id
      });
    });

    it('Verifying PFR Deal Info on SSP service', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${deal.id}/ssp`;

      cy.request(requestOptions).then((resp) => {
        assert.equal(resp.body.status, 1, 'Response Status ');
        assert.equal(resp.body.name, deal.name, 'Deal Name ');
        assert.equal(resp.body.external_id, deal.id, 'Deal ID ');
        assert.equal(resp.body.type, 'preferred_fixed_price', 'Deal Type ');
        assert.equal(resp.body.bidder.name, deal.bidderName, 'Bidder name ');
        assert.equal(resp.body.ad_formats[0].type, 'banner', 'Ad-Format type ');
        assert.equal(resp.body.priority, deal.priority.toLowerCase(), 'Priority ');
        assert.equal(resp.body.ad_formats[0].name, deal.formatName, 'Ad-Format name ');
        assert.equal(resp.body.no_publishers_floor, deal.pubFloorStatus, 'Ignore Publisher Floor ');
      });
    });

    it('Verifying PFR Deal Info on Kraken service', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${deal.id}/kraken`;

      cy.request(requestOptions).then((resp) => {
        const krakenResponse = resp.body;

        assert.equal(resp.status, 200, 'Response Status ');
        assert.equal(krakenResponse.active, true, 'Active ');
        assert.equal(krakenResponse.adFormat, 3, 'adFormat type ');
        assert.equal(krakenResponse.CPM, deal.rate * 100, 'CPM Value '); // Adding '* 100' due to no decimal in Kraken
        assert.equal(krakenResponse.priority, deal.priorityKraken, 'Priority in Kraken ');
        assert.equal(krakenResponse.viewabilitySampling, deal.viewabilitySampling / 100, 'veiwability sampling ');
        assert.equal(krakenResponse.viewabilityThreshold, deal.viewabilityThreshold / 100, 'veiwability sampling :');
        assert.equal(krakenResponse.frequencyCap.day, deal.frequencyCapDay, 'Day ');
        assert.equal(krakenResponse.frequencyCap.hour, deal.frequencyCapHour, 'Hour ');
        assert.equal(krakenResponse.frequencyCap.week, deal.frequencyCapWeek, 'Week ');
        assert.equal(krakenResponse.targeting.editorialGraph, false, 'editorialGraph '); // will change to true
        assert.equal(krakenResponse.targeting.deviceType.include.includes(deal.deviceValue[0]), true, 'Device type contains phone ');
        assert.equal(krakenResponse.targeting.country.include[0], 840, 'country ');
        assert.equal(krakenResponse.targeting.region.exclude[0], deal.locationValue.id, 'Region ');
        assert.equal(krakenResponse.targeting.carrier.include[0], deal.carrierValue.toLowerCase(), 'Carrier ');
        assert.equal(krakenResponse.targeting.os.include[0], deal.osValue.toLowerCase(), 'OS ');
        assert.equal(krakenResponse.targeting.browser.include[0], deal.browserValue.toLowerCase(), 'Browser ');
        assert.equal(krakenResponse.targeting.socialBrowser.include[0], deal.socialValue.toLowerCase(), 'Social Browser include value ');
        assert.equal(krakenResponse.targeting.isp.include[0], deal.ispValue, 'ISP include value ');
        // Following line is verifying device-type: Tablet
        // eslint-disable-next-line max-len
        expect(krakenResponse.targeting.deviceType.include).to.include(deal.deviceValue[1].toLowerCase());

        // Custom Targeting
        const krakenRespTargetingCustom = krakenResponse.targeting.custom;
        assert.equal(krakenRespTargetingCustom.logicalOperator, 'AND', 'Logical Operator');
        assert.equal(krakenRespTargetingCustom.children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
        assert.equal(krakenRespTargetingCustom.children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
        assert.equal(krakenRespTargetingCustom.children[0].children[0].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
        assert.equal(krakenRespTargetingCustom.children[0].children[0].valueNames, deal.grapeShotValue, 'Value name (Grapeshot) ');
        assert.equal(krakenRespTargetingCustom.children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
        assert.equal(krakenRespTargetingCustom.children[0].children[1].keyName, 'citadel', 'Vendor type (citadel) ');
        assert.equal(krakenRespTargetingCustom.children[0].children[1].valueNames[0], deal.citadelValue, 'Value name (citadel) ');
        assert.equal(krakenRespTargetingCustom.children[1].logicalOperator, 'OR', 'operator between Audience Targeting sets  ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].logicalOperator, 'AND', 'operator between Contextual Targeting fields ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[0].keyName, 'ksg', 'Vendor type (krux) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[0].valueNames, deal.kruxValue, 'Value name (krux) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[1].operator, 'IS', 'Vendor operator (include) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[1].keyName, 'social_canvas', 'Vendor type (social_canvas) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[1].valueNames, deal.includeSocialCanvas, 'Value name (social_canvas) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[2].operator, 'IS_NOT', 'Vendor operator (exclude) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[2].keyName, 'mas', 'Vendor type (mas) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[2].valueNames, deal.masValue, 'Value name (mas) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[3].operator, 'IS_NOT', 'Vendor operator (exclude) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[3].keyName, 'social_canvas', 'Vendor type (social_canvas) ');
        assert.equal(krakenRespTargetingCustom.children[1].children[0].children[3].valueNames, deal.excludeSocialCanvas, 'Value name (social_canvas) ');
      });
    });

    it('Archiving Preferred-Fixed-Rate Deal from Detail page', () => {
      cy.server();
      cy.route('/api/v1/citadel/segments').as('citadelApi');
      cy.route('/api/v1/users/session-user').as('sessionUserApi');
      cy.route('/api/v1/km-proxy/isp-targeting-list').as('ispApi');
      cy.route('DELETE', `/api/v1/deal/${deal.id}`).as('archivingDeal');
      cy.route('/api/v1/km-proxy/grapeshot-categories?limit=2000').as('grapeShotApi');
      cy.route('/api/v1/km-proxy/technology-targeting-integrations').as('techTargetApi');
      cy.route('/api/v1/km-proxy/service-proxy?limit=999&page=1&requested_endpoint=api/v1/segments&requested_service=cma-mgmt&sort_direction=ASC&type=0,2,3').as('cmaApi');

      cy.visit(`deal-dashboard/deals/${deal.id}`).wait(['@sessionUserApi', '@grapeShotApi', '@cmaApi', '@citadelApi', '@ispApi', '@techTargetApi']);
      cy.get('[data-qa="deal-detail--deal_archive"]', { timeout: 8000 }).click();
      cy.get('[data-qa="modal--confirm"]').last().should('be.visible')
        .click()
        .wait(['@archivingDeal', '@cmaApi', '@grapeShotApi', '@cmaApi', '@grapeShotApi']) // Added grapeshot & cma twice because 2 extra call were being made
        .each((apiCall) => {
          assert.equal(apiCall.status, 200, 'Response Status ');
        });
    });

    it('Verifying Preferred-Fixed-Rate Deal is archived', () => {
      cy.server();
      cy.route('/api/v1/deal?page=1&limit=25&search=*').as('seachAPI');

      cy.get('[data-qa="targeting--edit_targeting"]', { timeout: 8000 }).should('be.disabled');
      cy.get('.icon-archive', { timeout: 8000 }).should('exist');
      cy.get('[data-qa="deal-detail--deal_unarchive"]').should('contain', 'Unarchive');
      cy.get('[data-qa="deal-create--goto-deal-group"] .breadcrumb').click(); // User return to deal groups entry page
      cy.get('[type="search"]', { timeout: 8000 }).clear().type(deal.name).wait('@seachAPI');
      cy.get('.t-regular').should('exist'); // No deal is returned
      cy.get('.u-grid-gap-24 > div:nth-child(4)').click(); // Clicking no "archive" filter
      cy.get('li:nth-child(3) a').click(); // Clicking on archive option
      cy.get('[data-qa="deal-dashboard--select-deal"]', { timeout: 8000 }).should('exist');
      cy.get('.t-regular').should('not.exist'); // "No results found" text should NOT display
    });

    it('Unarchiving Preferred-Fixed-Rate Deal from Detail page', () => {
      cy.get('[data-qa="deal-dashboard--select-deal"]').click();
      cy.get('[data-qa="deal-detail--deal_unarchive"]').click();
      cy.get('[data-qa="modal--confirm"]').last().click();
    });

    it('Verifying Preferred-Fixed-Rate Deal is Unarchived', () => {
      cy.get('[data-qa="targeting--edit_targeting"]', { timeout: 8000 }).should('be.enabled');
      cy.get('.icon-archive').should('not.exist');
      cy.get('[data-qa="deal-detail--deal_archive"]').should('contain', 'Archive');
      cy.get('[data-qa="deal-create--goto-deal-group"] .breadcrumb').click(); // User return to deal groups landing page
      cy.get('[type="search"]').clear().type(deal.name);
      cy.get('.t-regular').should('not.exist'); // "No results found" text should NOT display
    });

    it('Verify deal info from deal-group level', () => {
      cy.get('deals > section > div.table > data-row:nth-child(2) > h6 > a').should('contain', deal.name);
      cy.get('deals div.table data-row:nth-child(2) p2:nth-child(4)').should('contain', externalDealId);
      cy.get('deals div.table data-row:nth-child(2) p2:nth-child(5)').should('contain', dealType);
      cy.get('deals div.table data-row:nth-child(2) p2:nth-child(6)').should('contain', deal.rate);
      cy.get('deals data-row:nth-child(2) div.deal-status.u-centerXY.red').should('contain', ' INACTIVE ');
    });
  });
});
