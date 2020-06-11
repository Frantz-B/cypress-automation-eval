/* eslint-disable linebreak-style */
const { clone, extend } = require('lodash');

const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/bidder',
  };
  return extend(defaultOptions, options);
};

context('Bidders', () => {
  describe('Bidders API', () => {
    let bidderId;
    let athenaId;
    let secureUrl;
    let unSecureurl;
    let notSyncedUsers;
    let iFrame;
    let vidTraffic;
    let nativeTraffic;
    let trafType;
    let gzipComp;

    it('Get list of bidders', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a bidder', () => {
      cy.fixture('bidder.json').then((bidder) => {
        const reqBody = clone(bidder);
        reqBody.name = nameHelper.generateName('API-bidder_created');
        reqBody.exchange_name = nameHelper.generateName('Exchange-bidder_name');

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            bidderId = resp.body.id;

            assert.equal(resp.status, 200, ['response status value ']);
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          });
      });
    });

    it('Pushing the created Bidder to athena', () => {
      const requestOptions = getRequest({
        method: 'POST',
      });
      requestOptions.url += `/${bidderId}/push-to-athena`;

      cy.request(requestOptions).then((resp) => {
        assert.equal(resp.status, 200, ['response status value ']);
      });
    });

    it('Retrieve the bidder', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${bidderId}`;

      cy.request(requestOptions)
        .then((resp) => {
          athenaId = resp.body.athena_id;
          secureUrl = resp.body.user_sync_url_secure;
          unSecureurl = resp.body.user_sync_url;
          notSyncedUsers = resp.body.send_not_synced_users;
          iFrame = resp.body.iframe_wrapper;
          vidTraffic = resp.body.send_video_traffic;
          nativeTraffic = resp.body.send_native_traffic;
          trafType = resp.body.traffic_type;
          gzipComp = resp.body.gzip_compression;

          assert.equal(resp.status, 200, ['response status value ']);
          assert.equal(resp.body.id, bidderId, ['bidder id value ']);
        });
    });

    it('Update the bidder', () => {
      cy.fixture('bidder.json').then((bidderJson) => {
        const reqBody = clone(bidderJson);
        reqBody.name = nameHelper.generateName('bidder-updated');
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
        });
        requestOptions.url += `/${bidderId}`;
        cy.request(requestOptions).then((resp) => {
          assert.equal(resp.status, 200, ['response status value ']);
          assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          assert.equal(resp.body.name, reqBody.name, ['name value ']);
        });
      });
    });

    it('Retrieve the bidder after editing', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${bidderId}`;

      cy.request(requestOptions)
        .then((resp) => {
          athenaId = resp.body.athena_id;
          secureUrl = resp.body.user_sync_url_secure;
          unSecureurl = resp.body.user_sync_url;
          notSyncedUsers = resp.body.send_not_synced_users;
          iFrame = resp.body.iframe_wrapper;
          vidTraffic = resp.body.send_video_traffic;
          nativeTraffic = resp.body.send_native_traffic;
          trafType = resp.body.traffic_type;
          gzipComp = resp.body.gzip_compression;

          assert.equal(resp.status, 200, ['response status value ']);
          assert.equal(resp.body.id, bidderId, ['bidder id value ']);
        });
    });

    it('Pushing the created Bidder to ad-server', () => {
      const requestOptions = getRequest({
        method: 'POST',
      });
      requestOptions.url += `/${bidderId}/push-to-ad-server`;

      cy.request(requestOptions).then((resp) => {
        assert.equal(resp.status, 200, ['response status value ']);
        assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
      });
    });

    it('Verify bidder against athena side', () => {
      const requestOptions = getRequest();
      requestOptions.url = `http://athena-dev-athena.staging.kargo.com/api/v1/bidder?id=${athenaId}`;

      cy.request(requestOptions)
        .then((resp) => {
          const athena = resp.body;
          assert.equal(resp.status, 200, ['response status value ']);
          assert.equal(athena.data.bidders[0].id, athenaId, ['athena id value ']);
          assert.equal(athena.data.bidders[0].active.toString(), 'true', ['status ']);
          assert.equal(athena.status, 'success', ['bidder status at athena ']);
          assert.equal(athena.data.bidders[0].userSyncUrlSecure, secureUrl, ['athena secure url value ']);
          assert.equal(athena.data.bidders[0].userSyncURL, unSecureurl, ['athena unsecure url value ']);
          assert.equal(athena.data.bidders[0].iFrameWrapper, iFrame, ['IFrame wrapper ']);
          assert.equal(athena.data.bidders[0].sendVideoTraffic, vidTraffic, ['send video traffic ']);
          assert.equal(athena.data.bidders[0].sendNotSyncedUsers, notSyncedUsers, ['not synced users ']);
          assert.equal(athena.data.bidders[0].sendNativeTraffic, nativeTraffic, ['send native traffic ']);
          assert.equal(athena.data.bidders[0].gzipCompression, gzipComp, ['gzip Compression ']);
          assert.equal(athena.data.bidders[0].trafficType, trafType, ['trafficType ']);
        });
    });
  });
});
