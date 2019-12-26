const { extend, clone } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '',
  };
  return extend(defaultOptions, options);
};

context('Targeting in Kraken', () => {
  describe('Pushing deal with targeting to kraken', () => {
    const dealGroupName = nameHelper.generateName('API-dealGroup_created_TargetingInKraken');
    const dealName = nameHelper.generateName('API-deal_created_TargetingInKraken');
    const random = Date.now();
    let dealgroupId;
    let dealId;
    let dealIdDM;
    let dealIdKraken;
    let bidderId;

    it('Create a bidder', () => {
      cy.fixture('bidder.json').then((bidder) => {
        const reqBody = clone(bidder);
        reqBody.name = `Test Bidder ${random}`;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/bidder',
        });
        cy.request(requestOptions)
          .then((resp) => {
            bidderId = resp.body.id;

            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Push the bidder to Ad server (make it sync)', () => {
      const requestOptions = getRequest({
        method: 'POST',
        body: {},
        url: `api/v1/bidder/${bidderId}/push-to-ad-server`,
      });
      cy.request(requestOptions)
        .then((resp) => {
          expect(resp.status).to.eq(200);
        });
    });

    it('Create a deal group', () => {
      cy.fixture('deal-group-fullPayload.json').then((dealgroup) => {
        const reqBody = clone(dealgroup);
        reqBody.name = dealGroupName;
        reqBody.salesforce_id = Cypress.moment().format('[api]YYYYMMMDDhhmmss');
        reqBody.buyer.bidder_id = bidderId;
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: '/api/v1/deal-group',
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealgroupId = resp.body.id;
            expect(resp.status).to.eq(200);
            expect(resp.body.id).to.be.gt(0);
          });
      });
    });

    it('Create a deal with targeting', () => {
      let dealPayload = {};
      cy.fixture('deal-fullPayload.json').then((deal) => {
        dealPayload = extend(dealPayload, deal);
        dealPayload.name = dealName;
        dealPayload.deal_group_id = dealgroupId;
        dealPayload.dealBuyer.bidder_id = bidderId;
        const requestOptions = getRequest({
          method: 'POST',
          body: dealPayload,
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

    it('Pushing the deal to ad server', () => {
      let dealPayload = {};
      cy.fixture('deal-fullPayload.json').then((deal) => {
        dealPayload = extend(dealPayload, deal);
        dealPayload.name = dealName;
        dealPayload.deal_group_id = dealgroupId;
        dealPayload.dealBuyer.bidder_id = bidderId;
        const requestOptions = getRequest({
          method: 'POST',
          body: dealPayload,
          url: `api/v1/deal/${dealId}/push-to-ad-server`,
        });
        cy.request(requestOptions)
          .then((resp) => {
            expect(resp.status).to.eq(200);
            dealIdDM = resp.body.deal_id;
            dealIdKraken = resp.body.id;
          });
      });
    });

    it('Retrieve data from kraken', () => {
      const requestOptions = getRequest();
      requestOptions.url = `${Cypress.env('baseUrl')}/deal?id=${dealIdKraken}`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          assert.equal(resp.body.status, 'success', 'response body status ');
          assert.equal(resp.body.data.deals[0].viewabilitySampling, 0.420000, 'viewabilitySampling value ');
          assert.equal(resp.body.data.deals[0].viewabilityThreshold, 1.000000, 'viewabilityThreshold value ');
          assert.equal(resp.body.data.deals[0].pacingType, 'evenly', 'pacingType value ');
          assert.equal(resp.body.data.deals[0].active, true, 'active value ');
          assert.equal(resp.body.data.deals[0].dealID, dealIdDM, 'dealID value ');
          assert.equal(resp.body.data.deals[0].CPM, 9000, 'CPM value ');
          assert.equal(resp.body.data.deals[0].priority, 6, 'Priority value ');
          assert.equal(resp.body.data.deals[0].startDate, '2020-11-06T05:00:00Z', 'Start Date value ');
          assert.equal(resp.body.data.deals[0].endDate, '2030-12-29T04:59:59Z', 'End Date value ');
          assert.equal(resp.body.data.deals[0].goal, 0, 'goal value ');
          assert.equal(resp.body.data.deals[0].adFormat, 8, 'ad Format value ');
          assert.equal(resp.body.data.deals[0].targeting.editorialGraph, true, 'editorialGraph value ');
          assert.equal(resp.body.data.deals[0].targeting.runOfNetwork, false, 'runOfNetwork value ');
          assert.equal(resp.body.data.deals[0].targeting.dma.exclude[0], 501, 'dma exclude value (New York) ');
          assert.equal(resp.body.data.deals[0].targeting.country.exclude[0], 826, '"country exclude value (United Kingdom) ');
          assert.equal(resp.body.data.deals[0].targeting.country.include[0], 840, 'country include value (US ) ');
          assert.equal(resp.body.data.deals[0].targeting.os.exclude[0], 'android', 'os exclude value ');
          assert.equal(resp.body.data.deals[0].targeting.browser.include[0], 'chrome', 'browser include value ');
          assert.equal(resp.body.data.deals[0].targeting.socialBrowser.include[0], 'facebook', 'socialBrowser include value ');
          assert.equal(resp.body.data.deals[0].targeting.isp.include[0], 'charter communications', 'isp include value ');
          // Custom Targeting
          assert.equal(resp.body.data.deals[0].targeting.custom.logicalOperator, 'AND', 'first operator between sets ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].logicalOperator, 'AND', 'operator between values for the first set ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[0].operator, 'IS', 'Vendor operator (include)  ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[0].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[0].valueNames[0], 'gs_auto', 'Vendor value (include - Grapeshot) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[1].keyName, 'GS_CHANNELS_ALL', 'Vendor type (Grapeshot) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[0].children[1].valueNames[0], 'gs_auto_commercial', 'Vendor value (exclude - Grapeshot) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].logicalOperator, 'OR', 'second operator between sets ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].logicalOperator, 'AND', 'operator between values for the second set ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].keyName, 'mas', 'Vendor type (mas) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].valueNames[0], 'wwE', 'Vendor value (include - mas) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].keyName, 'mas', 'Vendor type (mas) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].valueNames[0], 'jRw', 'Vendor value (exclude - mas) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].logicalOperator, 'AND', 'operator between Vendors for the second set ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].operator, 'IS', 'Vendor operator (include) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].keyName, 'ksg', 'Vendor type (krux) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].valueNames[0], 'test', 'Vendor value (include - krux) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].operator, 'IS_NOT', 'Vendor operator (exclude) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].keyName, 'ksg', 'Vendor type (krux) ');
          assert.equal(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].valueNames[0], 'teest45', 'Vendor value (exclude - krux) ');
          // End of Custom targeting
          assert.equal(resp.body.data.deals[0].targeting.deviceType.include[0], 'phone', 'deviceType include value ');
          assert.equal(resp.body.data.deals[0].frequencyCap.day, 77, '(frequencyCap - day) value ');
          assert.equal(resp.body.data.deals[0].frequencyCap.hour, 96, '(frequencyCap - hour) value ');
          assert.equal(resp.body.data.deals[0].frequencyCap.week, 456, '(frequencyCap - week) value ');
        });
    });
  });
});
