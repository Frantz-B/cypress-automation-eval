const { clone, extend } = require('lodash');
const bidderName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-API_automation-Bidder_created';
const bidderUpdatedName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-API_automation-Bidder_updated';
let bidderId;

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/bidder',
  };
  return extend(defaultOptions, options);
};

context('Editing Bidders - API', () => {
  describe('Bidders API', () => {

    it('Create a bidder', () => {
      cy.fixture('bidder.json').then((bidder) => 
      {
        const reqBody = clone(bidder);
        reqBody.name =  bidderName;
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions).then((resp) => 
          {
            bidderId = resp.body.id;
            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Retrieve the bidder', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${bidderId}`;
      cy.request(requestOptions).then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(bidderId);
        });
    });

    it('Update the bidder', () => {
      cy.fixture('bidderModification.json').then((bidderModification) => { 
        const reqBody = clone(bidderModification);
        reqBody.name =  bidderUpdatedName; 
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
        });
        requestOptions.url += `/${bidderId}`;
                      
        cy.request(requestOptions).then((resp) => {
            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
            expect(resp.body.name).to.eq(bidderUpdatedName);
          });
        });
    });

    it('Retrieve the updated bidder', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${bidderId}`;
      cy.request(requestOptions).then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.id).to.eq(bidderId);
        });
    });
    
  });
});
