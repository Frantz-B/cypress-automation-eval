const { clone, extend } = require('lodash');
const bidderName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-API_automation-Bidder.with.a.seat_created';
const seatName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-API_automation-Seat_created';
const seatUpatedName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-API_automation-Seat_updated';
let seatId;
let bidderId;

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/seat',
  };
  return extend(defaultOptions, options);
};

context('Editing Seats - API', () => {
  describe('Seats API', () => {
 
    it('Create a seat', () => {
      // First create a bidder since it's required for a seat
      let bidderPayload = {};
      cy.fixture('bidder.json').then((bidder) => {
        bidderPayload = extend(bidderPayload, bidder);
        bidderPayload.name = bidderName;
      });
      let reqBody = {};
      cy.fixture('seat.json').then((seat) => {
         reqBody = extend(reqBody, seat);
        reqBody.name = seatName;
      });
      const bidderReqOpts = getRequest({
        method: 'POST',
        body: bidderPayload,
        url: '/api/v1/bidder',
      });

      cy.request(bidderReqOpts).then((resp) => {
        reqBody.bidder_id = resp.body.id;
        bidderId = resp.body.id;
        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });

      const seatReqOpts = getRequest({
        method: 'POST',
        body: reqBody,
      });
      cy.request(seatReqOpts).then((resp) => {
        seatId = resp.body.id;
        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });
    });

    it('Update the seat', () => {
      cy.fixture('seatModification.json').then((seatEdtion) => { 
        const reqBody = clone(seatEdtion);
        reqBody.name =  seatUpatedName; 
        reqBody.bidder_id = bidderId;       
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
        });
        requestOptions.url += `/${seatId}`;                      
        cy.request(requestOptions).then((resp) => {
            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
            expect(resp.body.name).to.eq(seatUpatedName);
        });
      });
  });
});
});