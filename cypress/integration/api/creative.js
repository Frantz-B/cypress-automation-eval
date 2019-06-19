const { extend } = require('lodash');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/creative',
  };
  return extend(defaultOptions, options);
};

context('Creatives', () => {
  describe('Creatives API', () => {
    it('Get list of creatives', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a creative', () => {
      const random = Date.now();

      // First create a deal group to associate it to
      let dealGroupPayload = {};
      let creativePayload = {};

      cy.fixture('deal-group.json').then((dealGroup) => {
        dealGroupPayload = extend(dealGroupPayload, dealGroup);
        dealGroupPayload.name = `Test Deal Group ${random}`;
      });

      const dgReqOpts = getRequest({
        method: 'POST',
        body: dealGroupPayload,
        url: '/api/v1/deal-group',
      });

      cy.request(dgReqOpts).then((resp) => {
        dealGroupPayload.id = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);
      });

      // Now create a creative, assigning it the deal group id that was created above
      cy.fixture('creative.json').then((creative) => {
        creativePayload = extend(creativePayload, creative);
        creativePayload.name = `Test Creative ${random}`;
        creativePayload.deal_group_id = dealGroupPayload.id;
      });

      const creativeReqOpts = getRequest({
        method: 'POST',
        body: creativePayload,
      });

      cy.request(creativeReqOpts).then((resp) => {
        const newCreativeId = resp.body.id;

        expect(resp.status).to.eq(200);
        expect(resp.body.id).to.be.gt(0);

        const getRequestOptions = getRequest();
        getRequestOptions.url += `/${newCreativeId}`;

        cy.request(getRequestOptions).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          expect(getResponse.body.id).to.eq(newCreativeId);
        });
      });
    });
  });
});
