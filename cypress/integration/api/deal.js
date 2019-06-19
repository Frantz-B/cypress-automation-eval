const extend = require('lodash/extend');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal',
  };
  return extend(defaultOptions, options);
};

context('Deals', () => {
  describe('Deals API', () => {
    it('Get list of deals', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a deal', () => {
      const random = Date.now();

      /**
       * The following need to happen in order:
       * 1. Create a bidder
       * 2. Create a seat attached to the bidder
       * 3. Create a deal group
       * 4. Create a deal attached to the deal group
       */

      let bidderPayload = {};
      cy.fixture('bidder.json').then((bidder) => {
        bidderPayload = extend(bidderPayload, bidder);
        bidderPayload.name = `Test Bidder ${random}`;
      });

      let seatPayload = {};
      cy.fixture('seat.json').then((seat) => {
        seatPayload = extend(seatPayload, seat);
        seatPayload.name = `Test Seat ${random}`;
      });

      let dealGroupPayload = {};
      cy.fixture('deal-group.json').then((dealGroup) => {
        dealGroupPayload = extend(dealGroupPayload, dealGroup);
        dealGroupPayload.name = `Test Deal Group ${random}`;
      });

      let dealPayload = {};
      cy.fixture('deal.json').then((deal) => {
        dealPayload = extend(dealPayload, deal);
        dealPayload.name = `Test Deal ${random}`;
      });

      const bidderReqOpts = getRequest({
        method: 'POST',
        body: bidderPayload,
        url: '/api/v1/bidder',
      });
      cy.request(bidderReqOpts).then((resp) => {
        seatPayload.bidder_id = resp.body.id;
        dealPayload.bidder_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });

      const seatReqOpts = getRequest({
        method: 'POST',
        body: seatPayload,
        url: '/api/v1/seat',
      });
      cy.request(seatReqOpts).then((resp) => {
        dealPayload.seat_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });

      const dealGroupReqOpts = getRequest({
        method: 'POST',
        body: dealGroupPayload,
        url: '/api/v1/deal-group',
      });
      cy.request(dealGroupReqOpts).then((resp) => {
        dealPayload.deal_group_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.status).to.be.gt(0);
      });

      const dealReqOpts = getRequest({
        method: 'POST',
        body: dealPayload,
      });
      cy.request(dealReqOpts).then((dealResponse) => {
        expect(dealResponse.status).to.eq(200);
        expect(dealResponse.body.id).to.be.gt(0);

        const getReqOpts = getRequest();
        getReqOpts.url += `/${dealResponse.body.id}`;

        cy.request(getReqOpts).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          expect(getResponse.body.id).to.eq(dealResponse.body.id);
        });
      });
    });
  });
});
