/* eslint-disable linebreak-style */
const { extend } = require('lodash');
const { generateName, generateRandomNum } = require('../../helpers/name-helper');
const { login } = require('../../helpers/login-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal-group',
  };
  return extend(defaultOptions, options);
};

context('Deal Groups', () => {
  describe('Deals Groups UI', () => {
    let userSessionToken;

    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });

    let dealGroupName = generateName('UI-DealGroup_created');
    let dealGroupID;
    let targetSpend;
    let saleForceID;
    let closedLoopReport;
    let target;
    let optKpi;
    let optMeasurement;
    let outcomeKpi;
    let kpiPartner;
    let bidderID;

    it('Add a Deal Group', () => {
      const salesforceId = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss');
      targetSpend = generateRandomNum(200);

      cy.server();
      cy.route('/api/v1/km-proxy/users?company_type_id=71422&limit=9999&page=1&sort=name&sort_direction=ASC&with=groups').as('teamMembers');
      cy.route('/api/v1/km-proxy/advertisers?limit=5000&is_active=true&sort=name').as('advertiserList');
      cy.route('/api/v1/km-proxy/agency-trade-desks?limit=5000&sort=name').as('atd-api');
      cy.route('/api/v1/users/session-user').as('sessionUser');
      cy.route('/api/v1/role').as('role');

      cy.visit('');
      cy.get('[data-qa="deal-group-dashboard--create"]', { timeout: 9000 }).click();
      cy.url().should('include', 'deal-dashboard/deal-groups/create');

      // Adding basic Deal-Group info
      cy.get('[data-qa="deal-group-form--name"]').focus().type(dealGroupName);
      cy.get('[data-qa="deal-group-form--sf-id"]').focus().type(salesforceId);
      cy.get('[data-qa="deal-group-form--target-spend"]').focus().type(targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click();
      cy.get('[data-qa="deal-group-form--closed-loop--1"]').click()
        .wait('@teamMembers')
        .wait('@advertiserList')
        .wait('@atd-api')
        .wait('@role')
        .wait('@sessionUser'); // making sure these APIs are cleared


      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().focus().type('A');
      cy.get('[data-qa="deal-group-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();
      cy.get('[data-qa="deal-form--select-advertiser"]').click().type('max effort');
      cy.contains('max effort').click(); // clicking on advertiser dropdown

      // // Team Member Section
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click();
      cy.get('ul > li.active', { timeout: 9000 }).click(); // clicking on 1st option from dropdown
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click();
      cy.get('ul > li.active', { timeout: 9000 }).click(); // clicking on 1st option from dropdown
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click();
      cy.get('ul > li.active', { timeout: 9000 }).click(); // clicking on 1st option from dropdown

      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').focus().click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi--0"]').click();
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click();
      cy.get('[data-qa="deal-group-form--outcome-kpi--0"]').click();

      // Submitting Deal Group info
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 5000 }).should('contain', dealGroupName);

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupID = urlPathName.split('/').pop(); // Grabbing Deal-Group ID from URL
      });
    });

    it('Retrieve the deal-group', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${dealGroupID}?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealGroupID, 'deal group ID value ');
          saleForceID = resp.body.salesforce_id;
          dealGroupName = resp.body.name;
          closedLoopReport = resp.body.closed_loop_report;
          target = resp.body.target_spend;
          optKpi = resp.body.kpi.optimizable_kpi;
          optMeasurement = resp.body.kpi.optimizable_kpi_measurement_partner;
          outcomeKpi = resp.body.kpi.outcome_kpi;
          kpiPartner = resp.body.kpi.outcome_kpi_measurement_partner;
          bidderID = resp.body.dealGroupBuyer.bidder_id;
        });
    });

    it('Checking History for deal-group', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('a:nth-child(4) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', dealGroupID);
      cy.get('div:nth-child(4) pre').should('contain', dealGroupName);
      cy.get('div:nth-child(6) > pre').should('contain', closedLoopReport);
      cy.get('div:nth-child(8) pre').should('contain', saleForceID);
      cy.get('div:nth-child(10) pre').should('contain', target);
      cy.get('div:nth-child(22) pre').should('contain', optKpi);
      cy.get('div:nth-child(24) pre ').should('contain', optMeasurement);
      cy.get('div:nth-child(26) pre ').should('contain', outcomeKpi);
      cy.get('div:nth-child(28) pre ').should('contain', kpiPartner);
      cy.get('div:nth-child(34) pre ').should('contain', bidderID);
    });

    it('Edit Deal Group', () => {
      targetSpend = generateRandomNum(9000);
      dealGroupName += '_edited';

      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[class="button button--edit"]').click({ force: true }); // Requires 'force: true' for hidden element
      cy.url().should('include', 'deal-dashboard/deal-groups/edit');

      // Editing Basic info
      cy.get('[data-qa="deal-group-form--name"]').focus().clear().type(dealGroupName);
      cy.get('[data-qa="deal-group-form--target-spend"]').clear().focus().type(targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click();
      cy.get('[data-qa="deal-group-form--closed-loop--2"]').click();

      // Team Member Section
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click().type('Agency{enter}');
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click().type('Client{enter}');
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click().type('QA{enter}');

      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().clear();
      cy.get('[data-qa="deal-group-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
        .first()
        .children('a')
        .click();

      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi--1"]').click();
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click();
      cy.get('[data-qa="deal-group-form--outcome-kpi--1"]').click();

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 3000 }).should('contain', dealGroupName);
      cy.get('[data-qa="deal-group-detail--target_spend"]').should('contain', Intl.NumberFormat().format(targetSpend));
      cy.get('[data-qa="deal-group-detail--optimizable_kpi_vendor"]').should('contain', 'CPM');
      cy.get('[data-qa="deal-group-detail--outcome_vendor"]').should('contain', 'KBR');
    });

    it('Retrieve the deal-group', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${dealGroupID}?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealGroupID, 'deal group ID value ');
          saleForceID = resp.body.salesforce_id;
          dealGroupName = resp.body.name;
          closedLoopReport = resp.body.closed_loop_report;
          target = resp.body.target_spend;
          optKpi = resp.body.kpi.optimizable_kpi;
          optMeasurement = resp.body.kpi.optimizable_kpi_measurement_partner;
          outcomeKpi = resp.body.kpi.outcome_kpi;
          kpiPartner = resp.body.kpi.outcome_kpi_measurement_partner;
          bidderID = resp.body.dealGroupBuyer.bidder_id;
        });
    });

    it('Checking History for deal-group', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('a:nth-child(4) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', dealGroupID);
      cy.get('div:nth-child(3) > pre').should('contain', dealGroupName);
      cy.get('div:nth-child(9) pre').should('contain', closedLoopReport);
      cy.get('div:nth-child(2) div:nth-child(12) pre').should('contain', optKpi);
      cy.get('div:nth-child(15) pre').should('contain', optMeasurement);
      cy.get('div:nth-child(2) div:nth-child(18) pre').should('contain', outcomeKpi);
      cy.get('div:nth-child(21) pre').should('contain', kpiPartner);
      cy.get('div:nth-child(2) div:nth-child(24) pre').should('contain', bidderID);
      cy.get('div:nth-child(2) > p2:nth-child(4)').should('contain', 'Kargo QA Team');
    });

    it('Verifying Archiving Deal Group', () => {
      cy.server();
      cy.route('/api/v1/deal-group?limit=25&page=1&is_archived=false&exclude_tests=true&by_user=false').as('mainPage');

      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[data-qa="deal-group-detail--archive_button"]').click();
      cy.get('[data-qa="modal--confirm"]').last().click();

      // Verifying element after deal group is archived
      cy.get('[data-qa="deal-dashboard--add-deal"]').should('be.disabled');
      cy.get('.icon-archive').should('exist');
      cy.get('[data-qa="deal-group-detail--archive_button"]').should('contain', 'Unarchive');
      cy.get('.breadcrumb').click().wait('@mainPage');

      // Expected to now be at the Main Deal Groups page
      cy.get('[placeholder="Search"]').click().type(dealGroupName);
      cy.contains('No Results Found').should('exist'); // No results found" text should is displayed
      cy.get('div.dropdown-wrapper').click(); // Archive Filter
      cy.get('li:nth-child(3)').click(); // Clicking on Yes for Archive Filter
      cy.get('[placeholder="Search"]').click().type(dealGroupName); //
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('contain', dealGroupName);
      cy.get('p2:nth-child(1)').first().should('contain', 'ARCHIVED'); // Verifying status
    });

    it('Clicking on "Unrchive" button in the deal group entry page', () => {
      cy.server();
      cy.route('/api/v1/deal-group?limit=25&page=1&is_archived=false&exclude_tests=true&by_user=false').as('mainPage');

      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[data-qa="deal-group-detail--archive_button"]').click();
      cy.get('[data-qa="modal--confirm"]').last().click();

      // Expected page to automatically refresh
      cy.get('.icon-archive').should('not.exist');
      cy.get('[data-qa="deal-dashboard--add-deal"]').should('be.enabled');
      cy.contains('No Results Found').should('exist'); // Deals section should be blank
      cy.get('.breadcrumb').click().wait('@mainPage'); // User return to deal groups landing page
      cy.get('[placeholder="Search"]').click().type(dealGroupName);
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('contain', dealGroupName);
    });
  });
});
