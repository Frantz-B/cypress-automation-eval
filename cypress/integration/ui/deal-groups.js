context('Deal Groups UI', () => {
  describe('Deals Groups UI', () => {
    beforeEach(() => {
      cy.setCookie('kauth_access', Cypress.env('authToken'));
      cy.visit('');
    });

    it('Filter deal groups dashboard', () => {
      cy.get('[data-qa="deal-group-dashboard--archived-only"]').click({ force: true }).then(() => {
        cy.get('[data-qa="deal-group-dashboard--archived-only"]').children('span').should('have.class', 'is-checked')
      });
      cy.get('[data-qa="deal-group-dashboard--exclude-tests"]').click({ force: true }).then(() => {
        cy.get('[data-qa="deal-group-dashboard--exclude-tests"]').children('span').should('not.have.class', 'is-checked')
      });
    });

    it('Add a deal group', () => {
      cy.get('[data-qa="deal-group-dashboard--create"]').click().then(() => {
        cy.url().should('include', 'deal-dashboard/deal-groups/create');
      });

      const random = Date.now();
      const salesforceId = Math.floor(100000000000000000 + Math.random() * 900000);
      const targetSpend = Math.floor(Math.random() * (0 + 200));

      cy.get('[data-qa="deal-group-form--name"]').focus().type(`New Deal Group ${random}`, { force: true });
      cy.get('[data-qa="deal-group-form--sf-id"]').focus().type(salesforceId, { force: true });
      cy.get('[data-qa="deal-group-form--target-spend"]').focus({force: true}).type(targetSpend, { force: true });
      cy.get('[data-qa="deal-group-form--closed-look"]').click({force: true});
      cy.get('[data-qa="deal-group-form--closed-look--1"]').click({force: true});
      cy.get('[data-qa="deal-group-add-edit--submit"]').click({force: true});
      cy.get('[data-qa="modal--confirm"]').click({force: true});
    });
  });
});
