const pageHelper = require('../../helpers/pagination-helper');

const rowsSelector = 'data-row';
let totalNumberOfEntries = 0;

context('bidders Pagination', () => {
  describe('bidders tab Pagination - UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    it('Navigate to bidders page', () => {
      cy.visit('');
      cy.get('[data-qa="nav-bar--buyers"]').click({ force: true }).wait(1500);
      cy.get('[data-qa="buyers-dashboards--select-bidders"]').click({ force: true }).then(() => {
        cy.url().should('include', 'buyers-dashboard/bidders'); // User redirected to bidder creation page
      });

      cy.get('.QA-totalPages').then((totalPages) => {
        totalNumberOfEntries = totalPages.text().split('entries')[0].split('of')[1].replace(' ', '');
      });
    });

    it('Verify < arrow is disabled by default', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.QA-chevron-left').should('have.class', 'is-disabled');
      }
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
