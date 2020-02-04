/* eslint-disable linebreak-style */
const { clone, extend } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

let siteListId;
const dealGroupName = nameHelper.generateName('API-DealGroup_created_ArchiveTesting');
const siteListName = nameHelper.generateName('API_SiteLisr');
let dealgroupId;

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal-group',
  };
  return extend(defaultOptions, options);
};


context('Site Lists', () => {
  describe('Site Lists API', () => {
    it('Get List of site lists', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a Site List without name', () => {
      cy.fixture('site-list.json').then((sitelist) => {
        const reqBody = clone(sitelist);
        reqBody.name = '';

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          failOnStatusCode: false,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 400, 'status value ');
            // assert.isAbove(resp.body.id, 0, 'site list id above 0 ');
          });
      });
    });
    it('Create a Site List without properties', () => {
      cy.fixture('site-list.json').then((sitelist) => {
        const reqBody = clone(sitelist);
        reqBody.name = nameHelper.generateName('API-Site_List-created');
        reqBody.properties = [];

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          failOnStatusCode: false,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 400, 'status value ');
            // assert.isAbove(resp.body.id, 0, 'site list id above 0 ');
          });
      });
    });
    it('Create a correct Site List', () => {
      cy.fixture('site-list.json').then((sitelist) => {
        const reqBody = clone(sitelist);
        reqBody.name = nameHelper.generateName('API-Site_List-created');

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/site-list',
        });
        cy.request(requestOptions)
          .then((resp) => {
            siteListId = resp.body.id;
            assert.equal(resp.status, 200, 'status value ');
            assert.isAbove(resp.body.id, 0, 'site list id above 0 ');

            cy.log(siteListId);
          });
      });
    });
    it('Create a deal-group', () => {
      cy.fixture('deal-group.json').then((dealgroup) => {
        const reqBody = clone(dealgroup);
        reqBody.name = dealGroupName;
        reqBody.salesforce_id = Cypress.moment().format('[ui-]YYYYMMMDDhhmmss');
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/deal-group',
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealgroupId = resp.body.id;
            cy.log(dealgroupId);
            assert.equal(resp.status, 200, 'status value ');
            assert.isAbove(resp.body.id, 0, 'deal-group id above 0 ');
          });
      });
    });
    it('Create site-list targeting for the created deal-group', () => {
      cy.fixture('dealGroup-forEmpty_siteList.json').then((dealGroupTargeting) => {
        const reqBody = clone(dealGroupTargeting);
        reqBody.name = dealGroupName;
        reqBody.site_list_id = siteListId;
        reqBody.id = dealgroupId;
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `https://deal-manager.dev.kargo.com/api/v1/deal-group/${dealgroupId}`,
        });
        cy.request(requestOptions)
          .then((resp) => {
            // dealgroupId = resp.body.id;
            assert.equal(resp.status, 200, 'status value ');
            assert.isAbove(resp.body.id, 0, 'deal-group id above 0 ');
          });
      });
    });
    it('attach site-list with [] property', () => {
      cy.fixture('site-list.json').then((dealGroupTargeting) => {
        const reqBody = clone(dealGroupTargeting);
        reqBody.properties = [];
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `/api/v1/site-list/${siteListId}`,
          failOnStatusCode: false,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 400, 'status value ');
          });
      });
    });
    it('attach site-list with null property', () => {
      cy.log(siteListId);
      cy.fixture('site-list.json').then((dealGroupTargeting) => {
        const reqBody = clone(dealGroupTargeting);
        reqBody.name = siteListName;
        reqBody.properties = [null, null];
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `/api/v1/site-list/${siteListId}`,
          failOnStatusCode: false,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 400, 'status value ');
          });
      });
    });
    it('attach site-list with empty property', () => {
      cy.log(siteListId);
      cy.fixture('site-list.json').then((dealGroupTargeting) => {
        const reqBody = clone(dealGroupTargeting);
        reqBody.name = siteListName;
        reqBody.properties = '';
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `/api/v1/site-list/${siteListId}`,
          failOnStatusCode: false,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 400, 'status value ');
          });
      });
    });
    it('Update the site-list to give the right response', () => {
      cy.log(siteListId);
      cy.fixture('site-list.json').then((dealGroupTargeting) => {
        const reqBody = clone(dealGroupTargeting);
        reqBody.name = siteListName;
        reqBody.properties = [3];
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `/api/v1/site-list/${siteListId}`,
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 200, 'status value ');
          });
      });
    });
  });
});
