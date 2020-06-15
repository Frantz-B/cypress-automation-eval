const { clone, extend } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/brand',
  };
  return extend(defaultOptions, options);
};

context('Brands', () => {
  describe('Brands API', () => {
    let brandId;
    let openAuction;
    let pmpAllowed;
    let sspId;
    let isSynced;
    let athenabrandId;
    const brandName = nameHelper.generateName('API-brand-created');
    const updatedBrandName = nameHelper.generateName('API-brand-updated');
    const domainName = `${Date.now()}.com`;

    it('Get list of brands', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a brand', () => {
      cy.fixture('brand.json').then((brand) => {
        const reqBody = clone(brand);
        reqBody.name = brandName;
        reqBody.advertiser_domains[0] = domainName;
        reqBody.is_open_auction_allowed = false;
        reqBody.is_pmp_allowed = false;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            brandId = resp.body.id;
            openAuction = resp.body.is_open_auction_allowed;
            pmpAllowed = resp.body.is_pmp_allowed;
            sspId = resp.body.ssp_id;
            isSynced = resp.body.is_synced;
            assert.equal(resp.status, 200, 'response status value ');
            assert.isAbove(resp.body.id, 0, 'id is greater than 0 ');
          });
      });
    });

    it('Retrieve the created brand', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${brandId}`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, brandId, 'brand id value ');
          assert.equal(resp.body.name, brandName, 'brand name ');
          assert.equal(resp.body.is_open_auction_allowed, openAuction, 'allowed to open auction ');
          assert.equal(resp.body.is_pmp_allowed, pmpAllowed, 'is pmp allowed ');
          assert.equal(resp.body.is_synced, isSynced, 'is Synced? ');
          assert.equal(resp.body.athena_id, athenabrandId, 'athena brand ID ');
        });
    });

    it('Update the brand', () => {
      cy.fixture('brand.json').then((brandJson) => {
        const reqBody = clone(brandJson);
        reqBody.name = updatedBrandName;
        reqBody.advertiser_domains[0] = domainName;
        reqBody.is_open_auction_allowed = true;
        reqBody.is_pmp_allowed = true;
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
        });
        requestOptions.url += `/${brandId}`;
        cy.request(requestOptions).then((resp) => {
          brandId = resp.body.id;
          openAuction = resp.body.is_open_auction_allowed;
          pmpAllowed = resp.body.is_pmp_allowed;
          sspId = resp.body.ssp_id;
          isSynced = resp.body.is_synced;
          assert.equal(resp.status, 200, ['response status value ']);
          assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          assert.equal(resp.body.name, reqBody.name, ['name value ']);
        });
      });
    });

    it('Pushing the created Brand to athena', () => {
      const requestOptions = getRequest({
        method: 'POST',
      });
      requestOptions.url += `/${brandId}/push-to-athena`;

      cy.request(requestOptions).then((resp) => {
        athenabrandId = resp.body.data.brandID;
        assert.equal(resp.status, 200, ['response status value ']);
      });
    });

    it('Pushing the created Brand to ad-server', () => {
      const requestOptions = getRequest({
        method: 'POST',
      });
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/brand/${brandId}/push-to-ad-server`;

      cy.request(requestOptions).then((resp) => {
        sspId = resp.body.id;
        isSynced = true;
        assert.equal(resp.status, 200, ['response status value ']);
        assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
      });
    });

    it('Retrieve the created brand', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${brandId}`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, brandId, 'brand id value ');
          assert.equal(resp.body.name, updatedBrandName, 'brand name ');
          assert.equal(resp.body.is_open_auction_allowed, openAuction, 'allowed to open auction ');
          assert.equal(resp.body.is_pmp_allowed, pmpAllowed, 'is pmp allowed ');
          assert.equal(resp.body.ssp_id, sspId, 'ssp ID ');
          assert.equal(resp.body.is_synced, isSynced, 'is Synced? ');
          assert.equal(resp.body.athena_id, athenabrandId, 'athena brand ID ');
        });
    });

    it('Verify brands against athena side', () => {
      const requestOptions = getRequest();
      requestOptions.url = `http://athena-dev-athena.staging.kargo.com/api/v1/brands?id=${athenabrandId}`;

      cy.request(requestOptions)
        .then((resp) => {
          const athena = resp.body;
          assert.equal(resp.status, 200, ['response status value ']);
          assert.equal(athena.data.brands[0].id, athenabrandId, ['Brands ID in athena side ']);
          assert.equal(athena.data.brands[0].name, updatedBrandName, [' Brands Name']);
          assert.equal(athena.status, 'success', ['brands status at athena ']);
          assert.equal(athena.data.brands[0].externalID.slice(3, 8), brandId, ['DM Brand ID ']);
          assert.equal(athena.data.brands[0].domains[0], domainName, ['domain name ']);
          assert.equal(athena.data.brands[0].approvedForPmp, openAuction, [' ']);
          assert.equal(athena.data.brands[0].approvedForOpen, pmpAllowed, [' ']);
        });
    });
  });
});
