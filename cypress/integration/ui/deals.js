context('Deals', () => {
  describe('Deals UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });

    it('Navigate to Dashboard', () => {
      cy.get('[data-qa="deals-dashboards--select-deals"]').click({ force: true });
      cy.get('[data-qa="deals-dashboards--select-deals"]').scrollIntoView();
      cy.get('.input').first().focus().type('This is an automated test');
    });

    it('Filter deals dashboard', () => {
      cy.get('[data-qa="deals-dashboards--select-deals"]').click({ force: true });
      cy.get('[data-qa="deal-dashboard--archived-only"]').click({ force: true }).then(() => {
        cy.get('[data-qa="deal-dashboard--archived-only"]').children('span').should('have.class', 'is-checked');
      });
    });

    it('Add a deal', () => {
      cy.get('[data-qa="deals-dashboards--select-deal-groups"]').click({ force: true }).then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 1000 }).first().click({ force: true }).then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups');
      });

      cy.get('[data-qa="deal-dashboard--add-deal"]').click({ force: true }).then(() => {
        cy.url().should('include', 'deal-dashboard/deals/create');
      });

      const targetSpend = Math.floor(Math.random() * 200);

      cy.get('[data-qa="deal-create--set-preferred-rate"]').click({ force: true }).then(() => {
        cy.get('[data-qa="Priority-dropdown--button"]').click({ force: true });
      });

      cy.get('[data-qa="Priority-dropdown--button"]').click({ force: true }).then(() => {
        cy.get('[data-qa="Priority-dropdown--select--1"]').click({ force: true });
      });

      cy.get('[data-qa="deal-create--rate"]').focus({ force: true }).type(targetSpend, { force: true });
      cy.get('[data-qa="deal-create--target-spend"]').focus({ force: true }).type(targetSpend, { force: true });

      cy.get('[data-qa="deal-create--ignore-pub-floor"]').click({ force: true }).then(() => {
        cy.get('[data-qa="deal-create--ignore-pub-floor"]').should('have.class', 'is-on');
        cy.get('[data-qa="deal-create--ignore-pub-floor"]').click({ force: true });
      });

      cy.get('[data-qa="Format(s)-dropdown--button"]', { timeout: 7000 }).click({ force: true });
      cy.get('[data-qa="Format(s)-dropdown--select--0"]', { timeout: 100 }).click({ force: true });

      cy.get('[data-qa="Execution-dropdown--button"]').click({ force: true });
      cy.get('[data-qa="Execution-dropdown--select--2"]', { timeout: 100 }).click({ force: true });

      cy.get('[data-qa="deal-create--submit"]').click({ force: true });
      cy.get('[data-qa="modal--confirm"]').click({ force: true });
    });
  });
});
