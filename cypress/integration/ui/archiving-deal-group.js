/* eslint-disable linebreak-style */
const { extend } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal-group',
  };
  return extend(defaultOptions, options);
};

context('Deal Groups UI', () => {
  describe('Deals Groups UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    const dealGroupName = nameHelper.generateName('UI-DealGroup_created');
    let dealGroupID;
    let targetSpend;
    let dealGroupsCount;
    let dealGroupRows;
    let ArchivedDealGroupName;

    it('Add a deal group', () => {
      cy.visit('');
      cy.get('[data-qa="deal-group-dashboard--create"]').click().then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups/create');
      });


      const salesforceId = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss');
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-group-form--name"]').focus().type(dealGroupName);
      cy.get('[data-qa="deal-group-form--sf-id"]').focus().type(salesforceId);
      cy.get('[data-qa="deal-group-form--target-spend"]').focus().type(targetSpend);
      cy.get('[data-qa="deal-group-form--closed-loop"]').click().then(() => {
        cy.get('[data-qa="deal-group-form--closed-loop--1"]').click();
      });

      // Agency Sales Lead takes around 500ms to load
      // This is hopefully a temporary measure until we can speed that up
      cy.wait(1000);

      // Team Member Section
      cy.wait(500);
      cy.get('[data-qa="deal-group-form--select--agency_sales_lead"]').click().type('A{enter}');
      cy.get('[data-qa="deal-group-form--select--client_service_manager"]', { timeout: 5000 }).click().type('A{enter}');
      cy.get('[data-qa="deal-group-form--select--campaign_manager"]', { timeout: 3000 }).click().type('A{enter}');

      // Buyers Section
      cy.get('[data-qa="deal-group-form--select-bidder"]').click().type('A').then(() => {
        cy.get('[data-qa="deal-group-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });
      cy.get('[data-qa="deal-form--select-advertiser"]').click().type('a').wait(2000)
        .type('{enter}');

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
      cy.get('[data-qa="deal-group-detail--title"]', { timeout: 5000 }).should('contain', dealGroupName);

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

    it('Get deal group via API', () => {
      const requestOptions = getRequest();
      requestOptions.url += `?limit=1&page=1&is_archived=false&exclude_tests=false&by_user=false&search=${dealGroupName}`;
      cy.request(requestOptions).then((resp) => {
        assert.equal(resp.status, 200, 'status');
        dealGroupsCount = resp.body.count;
        dealGroupRows = resp.body.rows;
      });
    });

    it('Verifying that deal group was created and archived', () => {
      cy.visit('https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups');
      cy.wait(1000).get('input[type="search"]').clear().type(dealGroupName);
      if (dealGroupsCount === 1) {
        cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').first().click().then(() => {
          cy.get('header').should('contain', dealGroupName);
        });
        ArchivedDealGroupName = dealGroupRows[0].name;
      } else {
        cy.log('There is no/more than one deal group');
      }
      cy.get('[data-qa="deal-group-detail--archive_button"]').click().wait(1500);
      cy.get('deal-group-detail > message-modal button.button.button--primary').click().wait(1800);

      cy.get('[data-qa="deal-dashboard--add-deal"]').should('be.disabled').wait(500);
      cy.get('.icon-archive').should('exist').wait(1000);
      cy.get('[data-qa="deal-group-detail--archive_button"]').should('contain', 'Unarchive');
      cy.get('.breadcrumb').click().wait(200); // User return to deal groups landing page
      if (dealGroupsCount === 0) {
        cy.wait(1000).get('input[type="search"]').clear().type(dealGroupName)
          .wait(1500);
      } else {
        cy.wait(1000).get('input[type="search"]').clear().type(ArchivedDealGroupName)
          .wait(1500);
      }
      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]').click().wait(1000);
      cy.get('.t-regular').should('exist').wait(1000); // No deal group is returned
      cy.get('div.dropdown-toggle').click().wait(1000);
      cy.get('ul li:nth-child(3) a').click().wait(1000); // Clicking on archive option
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').should('exist');
      cy.get('.t-regular').should('not.exist').wait(1000); // "No results found" text should NOT display
      cy.get('div.table data-row:nth-child(2) p2:nth-child(1)').should('contain', 'ARCHIVED').wait(1000);
    });

    it('Clicking on "Unrchive" button in the deal group entry page', () => {
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]').click().wait(2000);
      cy.get('[data-qa="deal-group-detail--archive_button"]').click().wait(1500);
      cy.get('deal-group-detail > message-modal button.button.button--primary').click().wait(2000);
    });

    it('Verifying that deal group is Unarchived', () => {
      cy.get('[data-qa="deal-dashboard--add-deal"]').should('be.enabled').wait(500);
      cy.get('.icon-archive').should('not.exist').wait(1000);
      cy.get('[data-qa="deal-group-detail--archive_button"]').should('contain', 'Archive');
      cy.get('.breadcrumb').click().wait(200); // User return to deal groups landing page
      if (dealGroupsCount === 0) {
        cy.wait(1000).get('input[type="search"]').clear().type(dealGroupName)
          .wait(1500);
      } else {
        cy.wait(1000).get('input[type="search"]').clear().type(ArchivedDealGroupName)
          .wait(1500);
      }
      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]').click().wait(1000);
      cy.get('.t-regular').should('not.exist').wait(1000); // deal group is returned
      cy.get('div.table data-row:nth-child(2) p2:nth-child(1)').should('not.exist').wait(1000);
    });
  });
});
