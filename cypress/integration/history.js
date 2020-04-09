const { clone, extend } = require('lodash');
const { login } = require('../../helpers/login-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/deal-group',
  };
  return extend(defaultOptions, options);
};

context('Checking History for deal-group & deal', () => {
  describe('Checking History', () => {
    let userSessionToken;
    let dealgroupId;
    let saleForceID;
    let dealGroupName;
    let closedLoopReport;
    let target;
    let optKpi;
    let optMeasurement;
    let outcomeKpi;
    let kpiPartner;
    let bidderID;
    let dealId;
    let executionID;
    let formatID;
    let dealName;
    let rate;
    let targetSpend;
    let Type;
    let id;
    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });


    it('Create a deal group', () => {
      cy.fixture('deal-group.json').then((dealgroup) => {
        const random = Date.now();
        const reqBody = clone(dealgroup);
        reqBody.name = `Test Deal Group ${random}`;
        reqBody.salesforce_id = Cypress.moment().format('[api]YYYYMMMDDhhmm');

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealgroupId = resp.body.id;

            assert.equal(resp.status, 200, 'response status value ');
            assert.isAbove(resp.body.id, 0, 'id is greater than 0 ');
          });
      });
    });

    it('Retrieve the deal-group', () => {
      const requestOptions = getRequest();
      requestOptions.url += `/${dealgroupId}?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealgroupId, 'deal group ID value ');
          saleForceID = resp.body.salesforce_id;
          dealGroupName = resp.body.name;
          closedLoopReport = resp.body.closed_loop_report;
          target = resp.body.target_spend;
          optKpi = resp.body.kpi.optimizable_kpi;
          optMeasurement = resp.body.kpi.optimizable_kpi_measurement_partner;
          outcomeKpi = resp.body.kpi.outcome_kpi;
          kpiPartner = resp.body.kpi.outcome_kpi_measurement_partner;
          bidderID = resp.body.dealGroupBuyer.bidder_id;
        });
    });

    it('Checking History for deal-group', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deal-groups/${dealgroupId}`);
      cy.get('a:nth-child(4) > div', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', dealgroupId);
      cy.get('div:nth-child(4) pre').should('contain', dealGroupName);
      cy.get('div:nth-child(6) > pre').should('contain', closedLoopReport);
      cy.get('div:nth-child(8) pre').should('contain', saleForceID);
      cy.get('div:nth-child(10) pre').should('contain', target);
      cy.get('div:nth-child(18) pre').should('contain', optKpi);
      cy.get('div:nth-child(20) pre ').should('contain', optMeasurement);
      cy.get('div:nth-child(22) pre ').should('contain', outcomeKpi);
      cy.get('div:nth-child(24) pre ').should('contain', kpiPartner);
      cy.get('div:nth-child(30) pre ').should('contain', bidderID);
    });

    it('Create a deal ', () => {
      cy.fixture('deal.json').then((deal) => {
        const reqBody = clone(deal);
        const random = Date.now();
        reqBody.name = `Test Deal ${random}`;
        reqBody.deal_group_id = dealgroupId;
        reqBody.dealBuyer.bidder_id = bidderID;
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/deal',
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealId = resp.body.id;
            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Retrieve the deal', () => {
      const requestOptions = getRequest();
      requestOptions.url = `/api/v1/deal/${dealId}?with=dealGroup.siteList.siteListProperty,dealBuyer,siteList.siteListProperty,dealBuyer.bidder,dealBuyer.seat,dealAdvertiser`;
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status value ');
          assert.equal(resp.body.id, dealId, 'deal group ID value ');
          executionID = resp.body.km_execution_id;
          formatID = resp.body.km_format_id;
          dealName = resp.body.name;
          rate = resp.body.price;
          targetSpend = resp.body.target_spend;
          Type = resp.body.type;
          id = resp.body.deal_id;
        });
    });

    it('Checking History for deal', () => {
      cy.wait(3000);
      cy.visit(`https://deal-manager.dev.kargo.com/deal-dashboard/deals/${dealId}`);
      cy.get('div.actions.u-pullRight.u-fillRemaining a:nth-child(2)', { timeout: 3000 }).click();
      cy.get('div:nth-child(3) div:nth-child(2) code').should('contain', 'DRAFT');
      cy.get('div:nth-child(4) pre').should('contain', dealId);
      cy.get('div:nth-child(6) > pre').should('contain', '{"disablePauseOutOfView":false}');
      cy.get('div:nth-child(8) pre').should('contain', dealgroupId);
      cy.get('div:nth-child(10) pre').should('contain', executionID);
      cy.get('div:nth-child(12) pre').should('contain', formatID);
      cy.get('div:nth-child(14) pre ').should('contain', dealName);
      cy.get('div:nth-child(16) pre ').should('contain', rate);
      cy.get('div:nth-child(18) pre ').should('contain', '0.1');
      cy.get('div:nth-child(20) pre ').should('contain', '10');
      cy.get('div:nth-child(29) pre ').should('contain', targetSpend);
      cy.get('div:nth-child(31) pre ').should('contain', Type);
      cy.get('div:nth-child(24) pre ').should('contain', 'standard');
      cy.get('div:nth-child(35) pre ').should('contain', id);
    });
  });
});
