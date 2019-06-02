const { clone, extend } = require('lodash');

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

    it('Get list of bidders', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a bidder', () => {
      cy.fixture('bidder.json').then((bidder) => {
        const random = Date.now();
        const reqBody = clone(bidder);
        reqBody.name = `Test Bidder ${random}`;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            bidderId = resp.body.id;

            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Retrieve the bidder', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${bidderId}`;

      cy.request(requestOptions)
        .then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(bidderId);
        });
    });
  });
});
