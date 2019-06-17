const moment = require('moment')
const file = require('cypress-file-upload');

var Name = 'Md_Cyprss_UI_Automation_Add_Brand_' + moment().format('YY.MM.DD_hh:mm:ss');

describe('Adding a Brand in Deal Manager', function() {
    it('Adding a Brand - UI', function() {
        cy.visit('https://deal-manager.dev.kargo.com/')  
        cy.get('input[name="username"]').type('kargoqa@gmail.com')
        cy.get('input[name="password"]').type('K@rgo123!')
        cy.get('button[type="submit"]').wait(200).click()
        cy.get('section').should('be.visible')
        cy.get('div a[class="nav-item t-caps"] span').click().wait(3000)
        //cy.get('brands-dashboard > section > div.table > data-row:nth-child(2) > h6')
       // .should('be.visible')
        cy.get('brands-dashboard section div.layout--search-filter.u-grid div.u-fillRemaining.u-pullRight button')
        .wait(1500).click()              
        cy.get('input[placeholder="Name your brand"]').type(Name)
        cy.get('form > div.u-flex.u-spaceBetweenX > div:nth-child(1) > toggle-tabs > section > div > div:nth-child(1)')
        .click().wait(1500)              
        cy.get('form > div.u-flex.u-spaceBetweenX > div:nth-child(2) > toggle-tabs > section > div > div:nth-child(1)')
        .click()              
        cy.get(' input[placeholder="+ Add Domain"]').type('https://kargo.com {enter}').wait(2000)
        cy.get('button[class="button button--primary button--long"]').click()
        cy.get('button[class="button button--primary QA-modalYes"]').click().wait(2000)     
    })

  })