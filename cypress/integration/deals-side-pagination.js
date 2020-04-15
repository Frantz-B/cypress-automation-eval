context('Checking deal-group & deal pagination', () => {
  describe('Pagination', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });
    const rowsSelector = 'data-row';
    let totalNumberOfEntries = 0;

    it('check Pagination for Deal-group dashboard', () => {
      cy.visit('');
      cy.url().should('include', 'deal-dashboard/deal-groups');
      cy.get('.QA-totalPages').then((totalPages) => {
        totalNumberOfEntries = totalPages.text().split('entries')[0].split('of')[1].replace(' ', '');
      });
    });

    it('Verify < arrow is disabled', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.QA-chevron-left').should('have.class', 'is-disabled');
      }
    });

    it('Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.icon-arrow-right').click().wait(1000);
        cy.get('.QA-chevron-left+.page+.page>p2').should('have.class', 'is-active');
        cy.get('.QA-chevron-left').click().wait(1000);
        cy.get('.QA-chevron-left+.page>p2').should('have.class', 'is-active');
      }
    });

    it('Verify when clicking on 50 displayed results changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('[class="pageLength QA-pageLength-50"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          assert.isAbove(countOfRows, 25, 'count of rows');
          assert.isAtLeast(countOfRows, 50, 'count of rows');
        });
      }
    });

    it('Verify when clicking on 75 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page');
      } else if (totalNumberOfEntries > 50) {
        cy.get('[class="pageLength QA-pageLength-75"] span:nth-child(2)')
          .click({ force: true }).wait(2000).then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            assert.isAbove(countOfRows, 50, 'count of rows');
            assert.isAtLeast(countOfRows, 75, 'count of rows');
          });
      }
    });

    it('Verify when clicking on 25 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page');
      } else {
        cy.get('[class="pageLength QA-pageLength-25"] span').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          assert.isAbove(countOfRows, 0, 'count of rows');
          assert.equal(countOfRows, 25, 'count of rows');
        });
      }
    });

    it('Verify when clicking on page number "2", active number page changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.QA-chevron-left+.page+.page').click({ force: true }).wait(2000).then(() => {
          cy.get('p2.is-active').should('contain', '2');
        });
      }
    });

    it('Check Pagination for Deals', () => {
      cy.visit('');
      cy.get('[data-qa="deals-dashboards--select-deals"]').click();
      cy.url().should('include', 'deal-dashboard/deals');
      cy.get('.QA-totalPages').then((totalPages) => {
        totalNumberOfEntries = totalPages.text().split('entries')[0].split('of')[1].replace(' ', '');
      });
    });

    it('Verify < arrow is disabled', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.QA-chevron-left').should('have.class', 'is-disabled');
      }
    });

    it('Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.icon-arrow-right').click().wait(1000);
        cy.get('.QA-chevron-left+.page+.page>p2').should('have.class', 'is-active');
        cy.get('.QA-chevron-left').click().wait(1000);
        cy.get('.QA-chevron-left+.page>p2').should('have.class', 'is-active');
      }
    });

    it('Verify when clicking on 50 displayed results changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('[class="pageLength QA-pageLength-50"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          assert.isAbove(countOfRows, 25, 'count of rows');
          assert.isAtLeast(countOfRows, 50, 'count of rows');
        });
      }
    });

    it('Verify when clicking on 75 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page');
      } else if (totalNumberOfEntries > 50) {
        cy.get('[class="pageLength QA-pageLength-75"] span:nth-child(2)')
          .click({ force: true }).wait(2000).then(() => {
            const countOfRows = Cypress.$(rowsSelector).length;
            assert.isAbove(countOfRows, 50, 'count of rows');
            assert.isAtLeast(countOfRows, 75, 'count of rows');
          });
      }
    });

    it('Verify when clicking on 25 displayed results changes', () => {
      if (totalNumberOfEntries < 25) {
        cy.log('No pagination for this page');
      } else {
        cy.get('[class="pageLength QA-pageLength-25"] span').click({ force: true }).wait(2000).then(() => {
          const countOfRows = Cypress.$(rowsSelector).length;
          assert.isAbove(countOfRows, 0, 'count of rows');
          assert.equal(countOfRows, 25, 'count of rows');
        });
      }
    });

    it('Verify when clicking on page number "2", active number page changes', () => {
      if (totalNumberOfEntries < 26) {
        cy.log('No pagination for this page');
      } else {
        cy.get('.QA-chevron-left+.page+.page').click({ force: true }).wait(2000).then(() => {
          cy.get('p2.is-active').should('contain', '2');
        });
      }
    });
  });
});
