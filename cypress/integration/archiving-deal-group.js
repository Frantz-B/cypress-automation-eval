/* eslint-disable linebreak-style */
const nameHelper = require('../../helpers/name-helper');
const { generateRandomNum } = require('../../helpers/name-helper');

context('Deal Groups UI', () => {
  describe('Deals Groups UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    const dealGroupName = nameHelper.generateName('UI-DealGroup_created');
    let dealGroupID;
    let targetSpend;

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
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 10000 }).should('contain', dealGroupName);

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupID = urlPathName.split('/').pop(); // Grabbing Deal-Group ID from URL
      });
    });

    it('Edit Deal Group', () => {
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupID}`);
      cy.get('[class="button button--edit"]').click({ force: true }).then(() => { // Requires 'force: true' for hidden element
        cy.url().should('include', 'deal-dashboard/deal-groups/edit');
      });

      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-group-form--name"]').focus().type('_edited');
      cy.get('[data-qa="deal-group-form--target-spend"]').clear().focus().type(targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--closed-loop--2"]').click();
      });

      // Team Member Section
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click().type('Agency{enter}');
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]').click().type('Client{enter}');
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]').click().type('A{enter}');

      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().clear().then(() => {
        cy.get('[data-qa="deal-group-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // KPI Section
      cy.get('[data-qa="deal-group-form--optimizable-kpi"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--optimizable-kpi--1"]').click();
      });
      cy.get('[data-qa="deal-group-form--outcome-kpi"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--outcome-kpi--1"]').click();
      });

      // Submitting Deal Group info and Validating
      cy.get('[data-qa="deal-group-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 3000 }).should('contain', `${dealGroupName}_edited`);
      cy.get('[data-qa="deal-group-detail--target_spend"]').should('contain', targetSpend);
      cy.get('[data-qa="deal-group-detail--optimizable_kpi_vendor"]').should('contain', 'CPM');
      cy.get('[data-qa="deal-group-detail--outcome_vendor"]').should('contain', 'KBR');
    });

    it('Verifying that deal group was created and archived', () => {
      cy.visit('https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups');
      cy.wait(1000).get('input[type="search"]').clear().type(dealGroupName);
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 5000 }).first().click().then(() => {
        cy.get('header').should('contain', dealGroupName);
      });

      cy.get('[data-qa="deal-group-detail--archive_button"]', { timeout: 1500 }).click();
      cy.get('deal-group-detail > message-modal button.button.button--primary', { timeout: 1500 }).click();

      cy.get('[data-qa="deal-dashboard--add-deal"]', { timeout: 2000 }).should('be.disabled');
      cy.get('.icon-archive', { timeout: 1000 }).should('exist');
      cy.get('[data-qa="deal-group-detail--archive_button"]', { timeout: 5000 }).should('contain', 'Unarchive');
      cy.get('.breadcrumb', { timeout: 5000 }).click(); // User return to deal groups landing page
      cy.get('input[type="search"]', { timeout: 5000 }).clear().type(dealGroupName);

      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]', { timeout: 1000 }).click();
      cy.get('.t-regular').should('exist', { timeout: 1000 }); // No deal group is returned
      cy.get('div.dropdown-toggle', { timeout: 1000 }).click();
      cy.get('ul li:nth-child(3) a', { timeout: 1000 }).click(); // Clicking on archive option
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('exist');
      cy.get('.t-regular').should('not.exist', { timeout: 1000 }); // "No results found" text should NOT display
      cy.get('div.table data-row:nth-child(2) p2:nth-child(1)').should('contain', 'ARCHIVED', { timeout: 5000 });
    });

    it('Clicking on "Unrchive" button in the deal group entry page', () => {
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 5000 }).first().click();
      cy.get('[data-qa="deal-group-detail--archive_button"]', { timeout: 5000 }).click();
      cy.get('deal-group-detail > message-modal button.button.button--primary').click();
    });

    it('Verifying that deal group is Unarchived', () => {
      cy.get('[data-qa="deal-dashboard--add-deal"]').should('be.enabled', { timeout: 500 });
      cy.get('.icon-archive').should('not.exist', { timeout: 1000 });
      cy.get('[data-qa="deal-group-detail--archive_button"]').should('contain', 'Archive');
      cy.get('.breadcrumb', { timeout: 200 }).click(); // User return to deal groups landing page
      cy.get('input[type="search"]', { timeout: 2000 }).clear().type(dealGroupName);
      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]', { timeout: 5000 }).click();
      cy.get('.t-regular', { timeout: 1000 }).should('not.exist'); // deal group is returned
      cy.get('div.table data-row:nth-child(2) p2:nth-child(1)', { timeout: 5000 }).should('not.exist');
    });
  });
});
