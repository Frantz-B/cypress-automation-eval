const pageHelper = require('../../helpers/pagination-helper');

const rowsSelector = 'data-row';
let totalNumberOfEntries = 0;
context('Creatives Pagination', () => {
  describe('creatives Pagination UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    it('Navigate to Creatives page', () => {
      cy.visit('');
      cy.get('[data-qa="deals-dashboards--select-creatives"]').click({ force: true }).wait(2500).then(() => {
        cy.url().should('include', 'deal-dashboard/creatives');
      });
      cy.get('.QA-totalPages').then((totalPages) => {
        totalNumberOfEntries = totalPages.text().split('entries')[0].split('of')[1].replace(' ', '');
      });
    });

    it('Verify < arrow is disabled by default', () => {
      pageHelper.leftArrowIsDisabled(totalNumberOfEntries);
    });

    it('Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      pageHelper.navigatingUsingArrows(totalNumberOfEntries);
    });

    it('Verify when clicking on 50 displayed results changes', () => {
      pageHelper.resultsFor_50_rows(totalNumberOfEntries, rowsSelector);
    });

    it('Verify when clicking on 75 displayed results changes', () => {
      pageHelper.resultsFor_75_rows(totalNumberOfEntries, rowsSelector);
    });

    it('Verify when clicking on 25 displayed results changes', () => {
      pageHelper.resultsFor_25_rows(totalNumberOfEntries, rowsSelector);   
    });

    it('Verify when clicking on page number "2", active number page changes', () => {
      pageHelper.resultsForPageNumber_2(totalNumberOfEntries);
  });
 });
});
