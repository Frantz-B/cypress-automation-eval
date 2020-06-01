const { clone, extend } = require('lodash');
const { login } = require('../../helpers/login-helper');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/creative',
  };
  return extend(defaultOptions, options);
};

context('Creatives', () => {
  describe('Creatives UI', () => {
    let userSessionToken;
    let creativeID;
    let snippetGenerated;
    const creativeHTML = nameHelper.generateName('generated_creative');


    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });

    const dealGroupName = nameHelper.generateName('API_automated-Deal_Group_created');
    const creativeName = nameHelper.generateName('UI_automated-Creative_created');
    let dealGroupId;

    it('API-Add a deal group', () => {
      cy.fixture('deal-group.json').then((dealgroup) => {
        const reqBody = clone(dealgroup);
        reqBody.name = dealGroupName;
        reqBody.salesforce_id = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss'); // adds Unique Salesforce ID
        reqBody.is_test = false;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/deal-group',
        });

        cy.request(requestOptions)
          .then((resp) => {
            dealGroupId = resp.body.id;
            assert.equal(resp.status, 200, 'status');
            assert.isAbove(resp.body.id, 0, 'Deal-group ID ');
            cy.log('Created Deal-Group via API');
          });
      });
    });

    it('Add a creative', () => {
      // Navigate to creation form
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupId}?t=creatives`);
      cy.get('[data-qa="creative-dashboard--create"]').click({ force: true })
        .then(() => {
          cy.url().should('include', 'deal-dashboard/creatives/create');
        });

      // Add unique creative name
      cy.get('[data-qa="creative-form--name"]').focus().type(creativeName, { force: true });

      // Select a format
      cy.get('[data-qa="Format-dropdown--button"]').click({ force: true });
      cy.get('[data-qa="Format-dropdown--select--4"]', { timeout: 100 }).click({ force: true });
      //    Selecting the 4th format because it translate to Bottom-Banner, which has an execution

      // Select a execution
      cy.get('[data-qa="Execution-dropdown--button"]').click({ force: true });
      cy.get('[data-qa="Execution-dropdown--select--1"]', { timeout: 100 }).click({ force: true });

      // Submit form
      cy.get('[data-qa="deal-group-add-edit--submit"]').click({ force: true });
      cy.get('[data-qa="modal--confirm"]').click({ force: true });
    });

    it('Validating new Creative was created in UI within Deal-Group', () => {
      cy.visit(`/deal-dashboard/deal-groups/${dealGroupId}?t=creatives`);
      cy.get('.table-row').first().find('h6 a').should('contain', creativeName);
      cy.get('div.table data-row:nth-child(2) h6 a').click().wait(500);
      cy.get('header div div h2').should('contain', creativeName);
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        creativeID = urlPathName.split('/').pop();
        cy.log(creativeID);
      });
    });

    it('Navigate to Creatives Dashboard and verify New Creative is displayed', () => {
      cy.visit('');
      cy.get('[data-qa="deals-dashboards--select-creatives"]').click({ force: true });
      cy.get('.layout--search-filter').scrollIntoView();
      cy.get('.layout--search-filter [type="search"]').focus().type(creativeName);
      cy.get('.table-row').first().find('h6 a').should('contain', creativeName); // will be modified later when QA selector is added.
      cy.get('creatives-dashboard data-row:nth-child(2) h6 a').first().click().wait(500);
      cy.get('aside div:nth-child(3) p4').should('contain', creativeID);
    });

    it('Generating Snippet in the created creative', () => {
      cy.get('[data-qa="snippet-dashboard--edit"]').click();
      cy.get('div:nth-child(3) div code-block textarea').focus().type(creativeHTML);
      cy.get('[data-qa="creative-snippet-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('creative-snippet div.table.table--code pre code').should('contain', creativeHTML);
      cy.get('[data-qa="snippet-dashboard-actions"]').click();
      cy.get('div.action-button-wrap.u-fillRemaining.u-pullRight div ul li:nth-child(2) a').click();
    });

    it('retrieve data for creative', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${creativeID}`;

      cy.request(requestOptions)
        .then((resp) => {
          snippetGenerated = resp.body.snippet_generated;
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, creativeID, 'brand id value ');
          cy.log(snippetGenerated);
        });
    });

    it('Validating creative snippet', () => {
      cy.visit(`https://ad-snippet-service.dev.kargo.com/snippet/dm/${creativeID}`);
      cy.get('div:nth-child(2) span').should('contain', creativeID);
      cy.get('#snippet').should('contain', snippetGenerated);
    });
  });
});
