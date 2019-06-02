const extend = require('lodash/extend');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/seat',
  };
  return extend(defaultOptions, options);
};

context('Seats', () => {
  describe('Seats API', () => {
    let seatId;

    it('Get list of seats', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a seat', () => {
      // First create a bidder since it's required for a seat
      let bidderPayload = {};
      cy.fixture('bidder.json').then((bidder) => {
        const random = Date.now();
        bidderPayload = extend(bidderPayload, bidder);
        bidderPayload.name = `Test Bidder ${random}`;
      });

      let seatPayload = {};
      cy.fixture('seat.json').then((seat) => {
        const random = Date.now();
        seatPayload = extend(seatPayload, seat);
        seatPayload.name = `Test Seat ${random}`;
      });

      const bidderReqOpts = getRequest({
        method: 'POST',
        body: bidderPayload,
        url: '/api/v1/bidder',
      });

      cy.request(bidderReqOpts).then((resp) => {
        seatPayload.bidder_id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });

      const seatReqOpts = getRequest({
        method: 'POST',
        body: seatPayload,
      });

      cy.request(seatReqOpts).then((resp) => {
        seatId = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });
    });

    it('Retrieve the seat', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${seatId}`;

      cy.request(requestOptions)
        .then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(seatId);
        });
    });
  });
});
