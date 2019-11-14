// All methods used in pagination test cases
//
exports.leftArrowIsDisabled = (totalNumberOfEntries) => {
  if (totalNumberOfEntries < 26) {
    cy.log('No pagination for this page, < 26 rows');
  } else {
    cy.get('.QA-chevron-left').should('have.class', 'is-disabled');
  }
};

exports.navigatingUsingArrows = (totalNumberOfEntries) => {
  if (totalNumberOfEntries < 26) {
    cy.log('No pagination for this page, < 26 rows');
  } else {
    cy.get('.icon-arrow-right').click().wait(1000);
    cy.get('.QA-chevron-left+.page+.page>p2').should('have.class', 'is-active');
    cy.get('.QA-chevron-left').click().wait(1000);
    cy.get('.QA-chevron-left+.page>p2').should('have.class', 'is-active');
  }
};

exports.resultsFor_50_rows = (totalNumberOfEntries, rowsSelector) => {
  if (totalNumberOfEntries < 26) {
    cy.log('No pagination for this page, < 26 rows');
  } else if (totalNumberOfEntries > 25 && totalNumberOfEntries < 50) {
    cy.get('[class="pageLength QA-pageLength-50"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
      const countOfRows = Cypress.$(rowsSelector).length;
      expect(countOfRows).to.be.greaterThan(25);
      expect(countOfRows).to.be.lessThan(51);
    });
  } else if (totalNumberOfEntries > 49) {
    cy.get('[class="pageLength QA-pageLength-50"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
      const countOfRows = Cypress.$(rowsSelector).length;
      expect(countOfRows).to.equal(50);
    });
  }
};

exports.resultsFor_75_rows = (totalNumberOfEntries, rowsSelector) => {
  // check if data > 50 we will check 75, otherwise no need to check
  if (totalNumberOfEntries < 25) {
    cy.log('No pagination for this page, < 25 rows');
  } else if (totalNumberOfEntries > 50 && totalNumberOfEntries < 75) {
    cy.get('[class="pageLength QA-pageLength-75"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
      const countOfRows = Cypress.$(rowsSelector).length;
      expect(countOfRows).to.be.greaterThan(50);
      expect(countOfRows).to.be.lessThan(75);
    });
  } else if (totalNumberOfEntries > 74) {
    cy.get('[class="pageLength QA-pageLength-75"] span:nth-child(2)').click({ force: true }).wait(2000).then(() => {
      const countOfRows = Cypress.$(rowsSelector).length;
      expect(countOfRows).to.equal(75);
    });
  }
};

exports.resultsFor_25_rows = (totalNumberOfEntries, rowsSelector) => {
  if (totalNumberOfEntries < 25) {
    cy.log('No pagination for this page, < 25 rows');
  } else {
    cy.get('[class="pageLength QA-pageLength-25"] span').click({ force: true }).wait(2000).then(() => {
      const countOfRows = Cypress.$(rowsSelector).length;
      expect(countOfRows).to.be.greaterThan(0);
      expect(countOfRows).to.eq(25);
    });
  }
};

exports.resultsForPageNumber_2 = (totalNumberOfEntries) => {
  if (totalNumberOfEntries < 26) {
    cy.log('No pagination for this page, < 26 rows');
  } else {
    cy.get('.QA-chevron-left+.page+.page').click({ force: true }).wait(2000).then(() => {
      cy.get('p2.is-active').should('contain', '2');
    });
  }
};
