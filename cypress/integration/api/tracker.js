const extend = require('lodash/extend');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/tracker',
  };
  return extend(defaultOptions, options);
};

context('Trackers', () => {
  describe('Trackers API', () => {
    it('Get list of trackers', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a tracker', () => {
      const random = Date.now();

      /**
       * The following need to happen in order:
       * 1. Create a deal group 
       * 2. Create a creative attached to the deal group
       * 3. Create a tracker attached to the creative
       */

      let dealGroupPayload = {};
      cy.fixture('deal-group.json').then((dealGroup) => {
        dealGroupPayload = extend(dealGroupPayload, dealGroup);
        dealGroupPayload.name = `Test Deal Group ${random}`;
      });

      let creativePayload = {};
      cy.fixture('creative.json').then((creative) => {
        creativePayload = extend(creativePayload, creative);
        creativePayload.name = `Test Creative ${random}`;
      });


      let trackerPayload = {};
      cy.fixture('tracker.json').then((tracker) => {
        trackerPayload = extend(trackerPayload, tracker);
        trackerPayload.name = `Test Tracker ${random}`;
      });

      const dealGroupReqOpts = getRequest({
        method: 'POST',
        body: dealGroupPayload,
        url: '/api/v1/deal-group',
      });
      cy.request(dealGroupReqOpts).then((resp) => {
        creativePayload.deal_group_id = resp.body.id;
        trackerPayload.deal_group_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      }); 

      const creativeReqOpts = getRequest({
        method: 'POST',
        body: creativePayload,
        url: '/api/v1/creative',
      });
      cy.request(creativeReqOpts).then((resp) => {
        trackerPayload.creative_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.status).to.be.gt(0);
      });

      const trackerReqOpts = getRequest({
        method: 'POST',
        body: trackerPayload,
      });
      cy.request(trackerReqOpts).then((trackerResponse) => {
        expect(trackerResponse.status).to.eq(200);
        expect(trackerResponse.body.id).to.be.gt(0);

        const getReqOpts = getRequest();
        getReqOpts.url += `/${trackerResponse.body.id}`;

        cy.request(getReqOpts).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          expect(getResponse.body.id).to.eq(trackerResponse.body.id);
        });
      });
   
    });
  });
});
