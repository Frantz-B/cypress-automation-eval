/* eslint-disable linebreak-style */
const { clone, extend } = require('lodash');
const { login } = require('../../helpers/login-helper');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/bidder',
  };
  return extend(defaultOptions, options);
};

context('Deals with template type', () => {
  describe('Deals UI', () => {
    let userSessionToken;
    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });


    let dealID;
    let rate;
    const dealName = nameHelper.generateName('UI-Deal_created');
    let dealgroupId;
    let targetSpend = Math.floor(Math.random() * 200);
    const bidderName = nameHelper.generateName('API-bidder_created');
    let bidderId;
    let AsideDealId;

    it('Create a bidder', () => {
      cy.fixture('bidder.json').then((bidder) => {
        const reqBody = clone(bidder);
        reqBody.name = bidderName;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: 'https://deal-manager.dev.kargo.com/api/v1/bidder',
        });
        cy.request(requestOptions)
          .then((resp) => {
            bidderId = resp.body.id;
            assert.equal(resp.status, 200, ['response status value ']);
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          });
      });
    });

    it('pushing the created bidder to ad-server', () => {
      cy.fixture('Bidder-to-adServer.json').then((bidder) => {
        const reqBody = clone(bidder);
        reqBody.km_id = bidderId;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: `https://deal-manager.dev.kargo.com/api/v1/bidder/${bidderId}/push-to-ad-server`,
        });
        cy.request(requestOptions)
          .then((resp) => {
            bidderId = resp.body.id;

            assert.equal(resp.status, 200, ['response status value ']);
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          });
      });
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
          url: 'https://deal-manager.dev.kargo.com/api/v1/deal-group',
        });
        cy.request(requestOptions)
          .then((resp) => {
            dealgroupId = resp.body.id;

            assert.equal(resp.status, 200, 'response status value ');
            assert.isAbove(resp.body.id, 0, 'id is greater than 0 ');
          });
      });
    });

    it('Add a deal', () => {
      cy.wait(4000);
      cy.visit(`/deal-dashboard/deal-groups/${dealgroupId}`);
      cy.get('[data-qa="deal-dashboard--add-deal"]').click().wait(4000).then(() => {
        cy.url().should('include', 'deal-dashboard/deals/create');
      });

      // cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      // cy.get('[data-qa="Priority-dropdown--button"]').click().then(() => {
      //   cy.get('[data-qa="Priority-dropdown--select--1"]').click();
      // });

      // Select a format
      cy.get('[data-qa="deal-form--select-format"]').click().type('Bottom Banner').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a execution
      cy.get('[data-qa="deal-form--select-execution"]').click().type('A').then(() => {
        cy.get('[data-qa="deal-form--select-execution"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select rate and target spend
      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--rate"]').focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').focus().type(targetSpend);

      // Buyers Section - select bidder
      cy.get('[data-qa="deal-form--select-bidder"]').clear().type(bidderName).then(() => {
        cy.get('[data-qa="deal-form--select-bidder"]').parent('.input-wrapper--typeahead').find('.dropdown-menu')
          .children('li')
          .first()
          .children('a')
          .click();
      });

      cy.get('[data-qa="deal-create--name"]').clear().type(dealName);
      cy.get('[data-qa="deal-add-edit--submit"]').click().wait(500).then(() => {
        cy.get('[data-qa="modal--confirm"]', { timeout: 9000 }).click();
      });

      // pushing the deal to ad-server
      cy.get('[data-qa="deal-details--push_to_ad_server"]').click();

      // Validating Deal info
      cy.wait(1000);
      cy.get('[data-qa="deal-detail--title"]', { timeout: 9000 }).should('contain', dealName).wait(300);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', targetSpend);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', rate);
      cy.get('[data-qa="deal-detail--deal_format"]').should('contain', 'Bottom Banner');

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
      });
    });

    it('checking the deal in ssp side', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          assert.equal(resp.body.name, dealName, 'deal Name ');
          assert.equal(resp.body.external_id, dealID, 'deal ID ');
          assert.equal(resp.body.type, 'private_auction', 'Deal Type ');
          assert.equal(resp.body.bid_floor, rate, 'bid floor value ');
          assert.equal(resp.body.ad_formats[0].name, 'Bottom Banner', 'ad format ');
          assert.equal(resp.body.ad_formats[0].type, 'banner', 'ad format type ');
        });
    });

    it('Edit Deal', () => {
      cy.wait(500);
      cy.visit(`/deal-dashboard/deals/${dealID}`);
      cy.get('[class="button button--edit"]').click({ force: true }).then(() => { // Requires 'force: true' for hidden element
        cy.url().should('include', 'deal-dashboard/deals/edit/');
      });

      rate = Math.floor(Math.random() * 200);
      targetSpend = Math.floor(Math.random() * 200);

      // Edit deal name
      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      cy.get('[data-qa="deal-create--name"]').focus().type('_edited');

      // Edit rate and target spend
      cy.get('[data-qa="deal-create--rate"]').clear().focus().type(rate);
      cy.get('[data-qa="deal-create--target-spend"]').clear().focus().type(targetSpend);

      // Edit format
      cy.get('[data-qa="deal-form--select-format"]').clear().type('ABA Adhesion Display').then(() => {
        cy.get('[data-qa="deal-form--select-format"]').parent('.input-wrapper--typeahead').find('.dropdown-menu').children('li')
          .first()
          .children('a')
          .click();
      });

      // Select a Template type
      cy.get('input[placeholder="Add ABA Template"]').click().type('A').then(() => {
        cy.get('typeahead-container ul li:nth-child(2)').click();
      });

      // Submitting Deal info and Validating
      cy.get('[data-qa="deal-add-edit--submit"]').click();
      cy.get('[data-qa="modal--confirm"]').click();
      cy.get('[data-qa="deal-detail--title"]').should('contain', `${dealName}_edited`).wait(300);
      cy.get('[data-qa="deal-detail--deal_target_spend"]').should('contain', targetSpend);
      cy.get('[data-qa="deal-detail--deal_rate"]').should('contain', rate);
      cy.get('[data-qa="deal-detail--deal_format"]').should('contain', 'ABA Adhesion Display');
      cy.get('[data-qa="deal-detail--deal_template"]').should('contain', 'Adhesive Bottom Banner');

      // Grabbing Deal ID
      cy.get('[data-qa="deal-details--push_to_ad_server"]').click().wait(3000);
      cy.get('section.status-box h4 ')
        .invoke('text').then((text) => {
          AsideDealId = text;
          cy.log(AsideDealId);
        });
    });

    it('Pushing Creative Optimizer', () => {
      cy.fixture('creativeOptimizer.json').then((optimizer) => {
        const reqBody = clone(optimizer);
        reqBody.deal_id = AsideDealId;
        reqBody.template_id = 6;

        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: 'https://deal-manager.dev.kargo.com/api/v1/deal/template',
        });
        cy.request(requestOptions)
          .then((resp) => {
            assert.equal(resp.status, 200, ['response status value ']);
          });
      });
    });

    it('checking the deal in ssp side', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/deal/${dealID}/ssp`;

      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.status, 1, 'response status ');
          assert.equal(resp.body.name, `${dealName}_edited`, 'deal Name ');
          assert.equal(resp.body.external_id, dealID, 'deal ID ');
          assert.equal(resp.body.type, 'preferred_fixed_price', 'Deal Type ');
          assert.equal(resp.body.first_look_cpm, rate, 'bid floor value ');
          assert.equal(resp.body.ad_formats[0].name, 'Native Anchor', 'ad format ');
          assert.equal(resp.body.ad_formats[0].type, 'native', 'ad format type ');
        });
    });
  });
});
