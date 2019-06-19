const { clone, extend } = require('lodash');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/km-proxy/open-discussions',
  };
  return extend(defaultOptions, options);
};

context('Discussions', () => {
  describe('Discussion API', () => {
    let discussionId;

    it('Get list of discussions', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a Discussion', () => {
      cy.fixture('discussion.json').then((discussion) => {
        const random = Date.now();
        const reqBody = clone(discussion);
        reqBody.name = `Test Discussion ${random}`;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            discussionId = resp.body.id;

            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });
  });
});
