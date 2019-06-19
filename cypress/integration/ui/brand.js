const brandName = Cypress.moment().format('YY.MM.DD_hh:mm:ss') + '-UI_automation-Brand_created';


context('Brand UI', () => {
    describe('Add a Brand - UI', () => {
        beforeEach(() =>{
            cy.setCookie('kauth_access', Cypress.env('authToken'));
            cy.visit('');
        });
        
        it('Add a Brand', () => {
            cy.get('[data-qa="nav-bar--buyers"]').click({ force: true }).then(() =>{
                cy.url().should('include', 'buyers-dashboard/brands');
            });

            cy.get('[ng-reflect-router-link="create"]').click({ force: true }); // clicking on Add Brand button      
            cy.get('[name="brandName"]').focus().type(brandName, { force: true });  
            cy.get('[name="tagsInput"]').focus().type(brandName, { force: true }).type('{enter}');  // Entering Domain url
            cy.get('[ng-reflect-klass="button button--primary button-"]').click({ force: true });  // Clicking on 'Save' Button
            cy.get('[class="u-flex u-centerXY u-maxX t-caps"]').click({ force: true });  // Clicking on 'Save Brand' Button (popup)
            
            //After Brand is successfully created, UI should navigate Brands page
            cy.get('data-row:nth-child(2) > h6').should('contain', brandName);  // would verify newly created Brand is at the top of the list

            
        });
    });
} );