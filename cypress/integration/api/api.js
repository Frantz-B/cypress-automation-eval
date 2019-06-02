context('API', () => {
  describe('API', () => {
    it('This test case passes', () => {
      // Workaround to print to the console. See here for more info:
      // https://stackoverflow.com/questions/52070262/cypress-pipe-console-log-and-command-log-to-output
      cy.log(`API Tests using cypress base URL: ${Cypress.config().baseUrl}`);
      cy.task('log', `API Tests using cypress base URL: ${Cypress.config().baseUrl}`);
    });
  });
});
