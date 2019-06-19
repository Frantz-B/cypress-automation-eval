const { clone, extend } = require('lodash');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/brand',
  };
  return extend(defaultOptions, options);
};

context('Brands', () => {
  describe('Brands API', () => {
    let brandId;

    it('Get list of brands', () => {
      const requestOptions = getRequest();
      cy.request(requestOptions)
        .its('headers')
        .its('content-type')
        .should('include', 'application/json');
    });

    it('Create a brand', () => {
      cy.fixture('brand.json').then((brand) => {
        const random = Date.now();
        const reqBody = clone(brand);
        reqBody.name = `Test Brand ${random}`;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            brandId = resp.body.id;

            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Retrieve the brand', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${brandId}`;

      cy.request(requestOptions)
        .then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(brandId);
        });
    });
  });
});
