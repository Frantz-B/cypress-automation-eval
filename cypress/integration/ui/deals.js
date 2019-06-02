context('Deals', () => {
  describe('Deals UI', () => {
    before(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
    });

    it('Navigate to Dashboard', () => {
      cy.visit('');
      cy.get('.input').first().focus().type('This is an automated test');
    });
  });
});
