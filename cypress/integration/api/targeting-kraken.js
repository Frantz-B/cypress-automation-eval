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
          expect(resp.status).to.eq(200);
          expect(resp.body.status).to.eq('success');
          expect(resp.body.data.deals[0].viewabilitySampling).to.eq(0.420000);
          expect(resp.body.data.deals[0].viewabilityThreshold).to.eq(1.000000);
          expect(resp.body.data.deals[0].pacingType).to.eq('evenly');
          expect(resp.body.data.deals[0].active).to.eq(true);
          expect(resp.body.data.deals[0].dealID).to.eq(dealIdDM);
          expect(resp.body.data.deals[0].CPM).to.eq(9000);
          expect(resp.body.data.deals[0].startDate).to.eq('2020-11-06T05:00:00Z');
          expect(resp.body.data.deals[0].endDate).to.eq('2030-12-29T04:59:59Z');
          expect(resp.body.data.deals[0].goal).to.eq(0);
          expect(resp.body.data.deals[0].adFormat).to.eq(8);
          expect(resp.body.data.deals[0].targeting.editorialGraph).to.eq(true);
          expect(resp.body.data.deals[0].targeting.runOfNetwork).to.eq(false);
          expect(resp.body.data.deals[0].targeting.dma.exclude[0]).to.eq(501);
          expect(resp.body.data.deals[0].targeting.country.exclude[0]).to.eq(826);
          expect(resp.body.data.deals[0].targeting.country.include[0]).to.be.oneOf([124, 840]);
          expect(resp.body.data.deals[0].targeting.carrier.include[0]).to.eq('verizon');
          expect(resp.body.data.deals[0].targeting.os.exclude[0]).to.eq('android');
          expect(resp.body.data.deals[0].targeting.browser.include[0]).to.eq('chrome');
          expect(resp.body.data.deals[0].targeting.socialBrowser.include[0]).to.eq('facebook');
          expect(resp.body.data.deals[0].targeting.isp.include[0]).to.eq('charter communications');
          // Custom Targeting
          expect(resp.body.data.deals[0].targeting.custom.logicalOperator).to.eq('AND');
          expect(resp.body.data.deals[0].targeting.custom.children[0].logicalOperator).to.eq('AND');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[0].operator).to.eq('IS');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[0].keyName).to.eq('GS_CHANNELS_ALL');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[0].valueNames[0]).to.eq('gs_auto');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[1].operator).to.eq('IS_NOT');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[1].keyName).to.eq('GS_CHANNELS_ALL');
          expect(resp.body.data.deals[0].targeting.custom.children[0].children[1].valueNames[0]).to.eq('gs_auto_commercial');
          expect(resp.body.data.deals[0].targeting.custom.children[1].logicalOperator).to.eq('OR');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].logicalOperator).to.eq('AND');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].operator).to.eq('IS');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].keyName).to.eq('mas');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[0].valueNames[0]).to.eq('wwE');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].operator).to.eq('IS_NOT');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].keyName).to.eq('mas');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[0].children[1].valueNames[0]).to.eq('jRw');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].logicalOperator).to.eq('AND');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].operator).to.eq('IS');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].keyName).to.eq('ksg');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[0].valueNames[0]).to.eq('test');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].operator).to.eq('IS_NOT');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].keyName).to.eq('ksg');
          expect(resp.body.data.deals[0].targeting.custom.children[1].children[1].children[1].valueNames[0]).to.eq('teest45');
          // End of Custom targeting
          expect(resp.body.data.deals[0].targeting.deviceType.include[0]).to.eq('phone');
          expect(resp.body.data.deals[0].frequencyCap.day).to.eq(77);
          expect(resp.body.data.deals[0].frequencyCap.hour).to.eq(96);
          expect(resp.body.data.deals[0].frequencyCap.week).to.eq(456);
        });
    });
  });
});
