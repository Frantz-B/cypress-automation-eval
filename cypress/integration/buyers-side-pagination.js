const { login } = require('../../helpers/login-helper');

context('Checking Brands and Bidders pagination', () => {
  describe('Pagination UI', () => {
    let userSessionToken;

    before(() => {
      userSessionToken = login('kargoqa@gmail.com', 'K@rgo123!');
    });

    // This beforeEach is needed because when a subsequent tests hits
    // the same URL, cookies is not properly retained
    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });

    const rowsSelector = 'data-row';
    let totalNumberOfEntries = 0;

    it('Navigate to Brands page', () => {
      cy.visit('');
      cy.get('[data-qa="nav-bar--buyers"]').click({ force: true }).wait(2500).then(() => {
        cy.url().should('include', 'buyers-dashboard/brands');
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

    it('Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.icon-arrow-right').click().wait(1000);
        cy.get('.QA-chevron-left+.page+.page>p2').should('have.class', 'is-active');
        cy.get('.QA-chevron-left').click().wait(1000);
        cy.get('.QA-chevron-left+.page>p2').should('have.class', 'is-active');
      }
    });

    it('Verify when clicking on 50 displayed results changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('[class="pageLength QA-pageLength-50"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          expect(countOfRows).to.be.greaterThan(25);
          expect(countOfRows).to.be.lessThan(51);
        });
      }
    });

    it('Verify when clicking on 75 displayed results changes', () => {
    // check if data > 50 we will check 75, otherwise no need to check
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else if (totalNumberOfEntries > 50) {
        cy.get('[class="pageLength QA-pageLength-75"] span:nth-child(2)')
          .click({ force: true }).wait(2000).then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            expect(countOfRows).to.be.greaterThan(50);
            expect(countOfRows).to.be.lessThan(76);
          });
      }
    });

    it('Verify when clicking on 25 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else {
        cy.get('[class="pageLength QA-pageLength-25"] span').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          expect(countOfRows).to.be.greaterThan(0);
          expect(countOfRows).to.eq(25);
        });
      }
    });

    it('Verify when clicking on page number "2", active number page changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.QA-chevron-left+.page+.page').click({ force: true }).wait(2000).then(() => {
          cy.get('p2.is-active').should('contain', '2');
        });
      }
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

    it('Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.icon-arrow-right').click().wait(1000);
        cy.get('.QA-chevron-left+.page+.page>p2').should('have.class', 'is-active');
        cy.get('.QA-chevron-left').click().wait(1000);
        cy.get('.QA-chevron-left+.page>p2').should('have.class', 'is-active');
      }
    });

    it('Verify when clicking on 50 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else {
        cy.get('[class="pageLength QA-pageLength-50"]').find('span').last()
          .click({ force: true })
          .wait(2000)
          .then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            expect(countOfRows).to.be.greaterThan(25);
            expect(countOfRows).to.be.lessThan(51);
          });
      }
    });

    it('Verify when clicking on 75 displayed results changes', () => {
      // check if data > 50 we will check 75, otherwise no need to check
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else if (totalNumberOfEntries > 50) {
        cy.get('[class="pageLength QA-pageLength-75"]').find('span').last()
          .click({ force: true })
          .wait(2000)
          .then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            expect(countOfRows).to.be.greaterThan(50);
            expect(countOfRows).to.be.lessThan(76);
          });
      }
    });

    it('Verify when clicking on 25 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else {
        cy.get('[class="pageLength QA-pageLength-25"]').find('span').first()
          .click({ force: true })
          .wait(2000)
          .then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            expect(countOfRows).to.be.greaterThan(0);
            expect(countOfRows).to.be.lessThan(26);
          });
      }
    });

    it('Verify when clicking on page number "2", active number page changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.QA-chevron-left+.page+.page').click({ force: true }).wait(2000).then(() => {
          cy.get('p2.is-active').should('contain', '2');
        });
      }
    });
  });
});
