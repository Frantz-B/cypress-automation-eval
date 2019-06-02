const { clone, extend } = require('lodash');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal-group',
  };
  return extend(defaultOptions, options);
};

context('Deal Groups', () => {
  describe('Deal Groups API', () => {
    let dealgroupId;

    it('Get list of group deals', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a deal group', () => {
      cy.fixture('deal-group.json').then((dealgroup) => {
        const random = Date.now();
        const reqBody = clone(dealgroup);
        reqBody.name = `Test Deal Group ${random}`;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealgroupId = resp.body.id;

            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Retrieve the deal-group', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${dealgroupId}`;

      cy.request(requestOptions)
        .then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(dealgroupId);
        });
    });
  });
});
