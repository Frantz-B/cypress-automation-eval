const { clone, extend } = require('lodash');
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
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
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

      cy.get('[data-qa="deal-create--set-preferred-rate"]').click();
      cy.get('[data-qa="Priority-dropdown--button"]').click().then(() => {
        cy.get('[data-qa="Priority-dropdown--select--1"]').click();
      });
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
        cy.get('[data-qa="modal--confirm"]').click();
      });

      // Validating Deal info

      cy.get('[data-qa="deal-detail--title"]').should('contain', dealName).wait(300);
      cy.get('main > article > aside > div > section:nth-child(3) > div:nth-child(7) > p4').should('contain', targetSpend);
      cy.get('article > aside > div > section:nth-child(3) > div:nth-child(6) > p4').should('contain', rate);
      cy.get('article > aside > div > section:nth-child(3) > div:nth-child(9) > p4').should('contain', 'Bottom Banner');

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealID = urlPathName.split('/').pop(); // Grabbing Deal ID from URL
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
      cy.get('main > article > aside > div > section:nth-child(3) > div:nth-child(7) > p4').should('contain', targetSpend);
      cy.get('article > aside > div > section:nth-child(3) > div:nth-child(6) > p4').should('contain', rate);
      cy.get('article > aside > div > section:nth-child(3) > div:nth-child(9) > p4').should('contain', 'ABA Adhesion Display');
      cy.get('aside > div > section:nth-child(3) > div:nth-child(11) > p4').should('contain', 'Adhesive Bottom Banner');
      // Grabbing Deal ID
      cy.get('article > aside > div > div.button-group.push-wrapper > button > div > span').click().wait(3000);
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
  });
});
