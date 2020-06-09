const { generateName, generateRandomNum } = require('../../helpers/name-helper');
const { login } = require('../../helpers/login-helper');

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

    let dealGroupID;
    const dealGroupElements = {
      reportingType: 'Closed Loop',
      bidderName: '1072 Charo',
      salesLead: 'Amy Tseng',
      serviceManager: 'Alena Pranckevicius',
      campaignManager: 'Frantz Bazile',
      Optimizable_KPI: 'Brand Safety Rate',
      Measurement_Partner: 'IAS',
      outcome_KPI: 'App Downloads',
      outcome_Measurement: 'Kochava',
      dealGroupName: generateName('UI-DealGroup_created'),
      targetSpend: generateRandomNum(200),
      salesforceId: Cypress.moment().format('[ui-]YYYYMMMDDhhmmss'),
    };

    it('Add a Deal Group', () => {
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
      cy.get('[data-qa="deal-group-form--name"]').focus().type(dealGroupElements.dealGroupName);
      cy.get('[data-qa="deal-group-form--sf-id"]').focus().type(dealGroupElements.salesforceId);
      cy.get('[data-qa="deal-group-form--target-spend"]').focus().type(dealGroupElements.targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click();
      cy.contains(dealGroupElements.reportingType).click()
        .wait('@teamMembers')
        .wait('@advertiserList')
        .wait('@atd-api')
        .wait('@role')
        .wait('@sessionUser'); // making sure these APIs are cleared

      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click();
      cy.contains(dealGroupElements.bidderName).click();
      cy.get('[data-qa="deal-form--select-advertiser"]').click().type('max effort');
      cy.contains('max effort').click(); // clicking on advertiser dropdown

      // // Team Member Section
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click();
      cy.contains(dealGroupElements.salesLead).click();
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click();
      cy.contains(dealGroupElements.serviceManager).click();
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click();
      cy.contains(dealGroupElements.campaignManager).click();

      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').focus().click();
      cy.contains(dealGroupElements.Optimizable_KPI).click();
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click();
      cy.contains(dealGroupElements.outcome_KPI).click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi-measurement"]').click();
      cy.contains(dealGroupElements.Measurement_Partner).click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi-measurement-partner"]').click();
      cy.contains(dealGroupElements.outcome_Measurement).click();

      // Submitting Deal Group info
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
    });

    it('Verify deal-group elements', () => {
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 5000 }).should('contain', dealGroupElements.dealGroupName);
      cy.get('[data-qa="deal-group-detail--target_spend"]').should('contain', dealGroupElements.targetSpend);
      cy.get('[data-qa="deal-group-detail--deal_group_salesforce_id"]').should('contain', dealGroupElements.salesforceId);
      cy.get('[data-qa="deal-group-detail--deal_group_bidder"]').should('contain', dealGroupElements.bidderName);
      cy.get('[data-qa="deal-group-detail--optimizable_kpi_vendor"]').should('contain', `${dealGroupElements.Optimizable_KPI} / ${dealGroupElements.Measurement_Partner}`);
      cy.get('[data-qa="deal-group-detail--outcome_vendor"]').should('contain', `${dealGroupElements.outcome_KPI} / ${dealGroupElements.outcome_Measurement}`);

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupID = urlPathName.split('/').pop(); // Grabbing Deal-Group ID from URL
      });
    });

    it('Checking History for deal-group', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('a:nth-child(4) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', dealGroupID);
      cy.get('div:nth-child(4) pre').should('contain', dealGroupElements.dealGroupName);
      cy.get('div:nth-child(8) pre').should('contain', dealGroupElements.salesforceId);
      cy.get('div:nth-child(10) pre').should('contain', dealGroupElements.targetSpend);
      cy.get('div:nth-child(22) pre').should('contain', dealGroupElements.Optimizable_KPI);
      cy.get('div:nth-child(24) pre ').should('contain', dealGroupElements.Measurement_Partner);
      cy.get('div:nth-child(26) pre ').should('contain', dealGroupElements.outcome_KPI);
      cy.get('div:nth-child(28) pre ').should('contain', dealGroupElements.outcome_Measurement);
    });

    it('Edit Deal Group', () => {
      dealGroupElements.targetSpend = generateRandomNum(9000);
      dealGroupElements.reportingType = 'Merkle';
      dealGroupElements.dealGroupName += '_edited';
      dealGroupElements.bidderName = '1072 Charo';
      dealGroupElements.salesLead = 'Andrew Webster';
      dealGroupElements.serviceManager = 'Adrienne Ross';
      dealGroupElements.campaignManager = 'Alonso Calle';
      dealGroupElements.Optimizable_KPI = 'CPM';
      dealGroupElements.Measurement_Partner = 'Kargo';
      dealGroupElements.outcome_KPI = 'Brand Awareness';
      dealGroupElements.outcome_Measurement = 'Research Now';

      cy.server();
      cy.route('/api/v1/km-proxy/users?company_type_id=71422&limit=9999&page=1&sort=name&sort_direction=ASC&with=groups').as('teamMembers');

      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[class="button button--edit"]').click({ force: true }); // Requires 'force: true' for hidden element
      cy.url().should('include', 'deal-dashboard/deal-groups/edit');

      // Editing Basic info
      cy.get('[data-qa="deal-group-form--name"]').focus().clear().type(dealGroupElements.dealGroupName);
      cy.get('[data-qa="deal-group-form--target-spend"]').clear().focus().type(dealGroupElements.targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click();
      cy.contains(dealGroupElements.reportingType).click()
        .wait('@teamMembers');

      // Team Member Section
      cy.get('div:nth-child(2) div:nth-child(1) div section div i').click(); // this selector for (x) mark to delete the team member
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click();
      cy.contains(dealGroupElements.salesLead).click();

      cy.get('div:nth-child(2) > div:nth-child(2) div > div > i').click();
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click().clear();
      cy.contains(dealGroupElements.serviceManager).click();

      cy.get('section:nth-child(2) div:nth-child(3) div section div i').click();
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click().clear();
      cy.contains(dealGroupElements.campaignManager).click();

      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().clear();
      cy.contains(dealGroupElements.bidderName).click();

      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').click();
      cy.contains(dealGroupElements.Optimizable_KPI).click();
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click();
      cy.contains(dealGroupElements.outcome_KPI).click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi-measurement"]').click();
      cy.contains(dealGroupElements.Measurement_Partner).click();
      cy.get('[data-qa="deal-group-form--optimizable-kpi-measurement-partner"]').click();
      cy.contains(dealGroupElements.outcome_Measurement).click();

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
    });

    it('Verify deal-group elements after editing', () => {
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 5000 }).should('contain', dealGroupElements.dealGroupName);
      cy.get('[data-qa="deal-group-detail--target_spend"]').should('contain', Intl.NumberFormat().format(dealGroupElements.targetSpend));
      cy.get('[data-qa="deal-group-detail--deal_group_salesforce_id"]').should('contain', dealGroupElements.salesforceId);
      cy.get('[data-qa="deal-group-detail--deal_group_bidder"]').should('contain', dealGroupElements.bidderName);
      cy.get('[data-qa="deal-group-detail--optimizable_kpi_vendor"]').should('contain', `${dealGroupElements.Optimizable_KPI} / ${dealGroupElements.Measurement_Partner}`);
      cy.get('[data-qa="deal-group-detail--outcome_vendor"]').should('contain', `${dealGroupElements.outcome_KPI} / ${dealGroupElements.outcome_Measurement}`);
    });

    it('Checking History for deal-group', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('a:nth-child(4) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', dealGroupID);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(3) pre').should('contain', dealGroupElements.dealGroupName);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(6) div:nth-child(2) pre').should('contain', dealGroupElements.salesLead);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(8) div:nth-child(2) pre').should('contain', dealGroupElements.serviceManager);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(10) div:nth-child(2) pre').should('contain', dealGroupElements.campaignManager);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(13) pre').should('contain', Intl.NumberFormat().format(dealGroupElements.targetSpend));
      cy.get('history-dashboard div.history-log-type-column div:nth-child(19) pre').should('contain', dealGroupElements.Optimizable_KPI);
      cy.get('history-dashboard div:nth-child(2) div:nth-child(22) pre').should('contain', dealGroupElements.Measurement_Partner);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(25) pre').should('contain', dealGroupElements.outcome_KPI);
      cy.get('history-dashboard div.history-log-type-column div:nth-child(28) pre').should('contain', dealGroupElements.outcome_Measurement);
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
      cy.get('[placeholder="Search"]').click().type(dealGroupElements.dealGroupName);
      cy.contains('No Results Found').should('exist'); // No results found" text should is displayed
      cy.get('div.dropdown-wrapper').click(); // Archive Filter
      cy.get('li:nth-child(3)').click(); // Clicking on Yes for Archive Filter
      cy.get('[placeholder="Search"]').click().type(dealGroupElements.dealGroupName); //
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('contain', dealGroupElements.dealGroupName);
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
      cy.get('[placeholder="Search"]').click().type(dealGroupElements.dealGroupName);
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('contain', dealGroupElements.dealGroupName);
    });
  });
});
