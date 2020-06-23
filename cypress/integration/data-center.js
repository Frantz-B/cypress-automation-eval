const { clone, extend } = require('lodash');

const bidderJson = require('../../fixtures/bidder');
const dataCenterJson = require('../../fixtures/data-center');
const nameHelper = require('../../helpers/name-helper');

const bidderEndpoint = '/api/v1/bidder';

const buildRequestOptions = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/data-center',
  };
  return extend(defaultOptions, options);
};

context('Data Center', () => {
  describe('Data Centers API', () => {
    let bidderId;
    let bidderName;
    let dataCenterId;
    let qpsLimit;
    let dataCenterName;
    let dataCenterUpdatedName;
    let regionId;
    let regionName;
    let bidUrl;
    let createDataCenter = false;
    it('Get list of data centers', () => {
      const requestOptions = buildRequestOptions();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a Data Center', () => {
      const bidderReqBody = Object.assign({}, bidderJson);
      bidderReqBody.name = nameHelper.generateName('bidder');
      const bidderReqOpts = buildRequestOptions({
        url: bidderEndpoint,
        body: bidderReqBody,
        method: 'POST',
      });

      // First create a bidder
      cy.request(bidderReqOpts).then((bidderResponse) => {
        bidderId = bidderResponse.body.id;
        const pushBidderReq = buildRequestOptions({
          url: `/api/v1/bidder/${bidderId}/push-to-ad-server`,
          method: 'POST',
        });
        cy.request(pushBidderReq).then((res) => {
          if (res.body.id > 0) {
            createDataCenter = true;
          }

          // If in hub is diabled, we cannot create datacenters at all
          if (createDataCenter) {
            const reqBody = clone(dataCenterJson);
            reqBody.name = nameHelper.generateName('data-center');
            reqBody.bidder_id = bidderId;

            // Now create the data center attached to the bidder from above
            const requestOptions = buildRequestOptions({
              method: 'POST',
              body: reqBody,
            });
            cy.request(requestOptions).then((resp) => {
              bidUrl = resp.body.bid_url;
              bidderName = resp.body.bidder.name;
              dataCenterId = resp.body.id;
              regionId = resp.body.region.id;
              regionName = resp.body.region.name;
              qpsLimit = resp.body.qps_limit;
              dataCenterName = resp.body.name;
              assert.equal(resp.status, 200, 'response status value ');
            });
          } else {
            cy.log('Skipping data center creation because IN Hub is disabled.');
          }
        });
      });
    });

    it('Verify the created dataCenter', () => {
      const requestOptions = buildRequestOptions();
      requestOptions.url += `/${dataCenterId}`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.bid_url, bidUrl, 'bid URL ');
          assert.equal(resp.body.name, dataCenterName, 'dataCenter Name ');
          assert.equal(resp.body.region.id, regionId, 'region ID ');
          assert.equal(resp.body.region.name, regionName, 'region name ');
          assert.equal(resp.body.qps_limit, qpsLimit, 'QPS value ');
          assert.equal(resp.body.bidder.name, bidderName, 'bidder name ');
          assert.equal(resp.body.id, dataCenterId, 'dataCenter ID ');
        });
    });

    it('Update the dataCenter', () => {
      cy.fixture('data-center.json').then((dataCenter) => {
        const reqBody = clone(dataCenter);
        reqBody.bidder_id = bidderId;
        reqBody.name = nameHelper.generateName('data-center_updated');
        reqBody.region.id = 4;
        reqBody.qps_limit = nameHelper.generateRandomNum(10000);
        const requestOptions = buildRequestOptions({
          method: 'PUT',
          body: reqBody,

        });

        cy.request(requestOptions).then((resp) => {
          dataCenterUpdatedName = resp.body.name;
          regionId = resp.body.region.id;
          regionName = resp.body.region.name;
          qpsLimit = resp.body.qps_limit;
          bidUrl = resp.body.bid_url;
          bidderName = resp.body.bidder.name;
          dataCenterId = resp.body.id;

          assert.equal(resp.status, 200, ['response status value ']);
        });
      });
    });

    it('Verfiy the updated dataCenter', () => {
      const requestOptions = buildRequestOptions();
      requestOptions.url += `/${dataCenterId}`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.bid_url, bidUrl, 'bid URL ');
          assert.equal(resp.body.name, dataCenterUpdatedName, 'dataCenter Name ');
          assert.equal(resp.body.region.id, regionId, 'region ID ');
          assert.equal(resp.body.region.name, regionName, 'region name ');
          assert.equal(resp.body.qps_limit, qpsLimit, 'QPS value ');
          assert.equal(resp.body.bidder.name, bidderName, 'bidder name ');
          assert.equal(resp.body.id, dataCenterId, 'dataCenter ID ');
        });
    });
  });
});
