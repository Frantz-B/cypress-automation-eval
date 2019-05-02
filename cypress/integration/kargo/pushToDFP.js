
import 'cypress-file-upload';
const moment = require('moment')
const getMainConfig = require('../../configuration/ApiKargo.json')
const posthttp=require('../../src/https/post')
const gethttp=require('../../src/https/get')
const puthttp=require('../../src/https/put')
const placemnetBody = require('../../configuration/placementPayload.json')
const sitelistBody = require('../../configuration/sitelistPayload.json')
const sitelistupdateBody = require('../../configuration/sitelistUpdatePayload.json')
var campName = 'Automation_test' + moment().format('YY.MM.DD_hh:mm:ss');
var rand_number = Math.floor((Math.random() * 90000000000000000) + 100000000000000000);
const fileName = 'image.png';

placemnetBody.name = 'Automation_test_Placement' + moment().format('YY.MM.DD_hh:mm:ss');
placemnetBody.flight_date_start = moment().format('YYYY-MM-DD')
placemnetBody.goals[0].flight_date_start = moment().format('YYYY-MM-DD')
placemnetBody.flight_date_end = moment().add(1, 'months').format('YYYY-MM-DD')
placemnetBody.goals[0].flight_date_end = moment().add(1, 'months').format('YYYY-MM-DD')

const baseKMUrl = getMainConfig.baseUrl
const searchEndPoint = getMainConfig.campSearch

sitelistBody.name = campName;
sitelistupdateBody.name = campName;



describe('to create campaign', () => {
      
    // it('log in',()=>{
    //     cy.login("kargoqa@gmail.com","K@rgo123!")   
    //     })
   
        it('create campaign',()=>{
    //  cy.login('https://sso.staging.kargo.com/?redirect=https://marketplace.staging.kargo.com',"kargoqa@gmail.com","K@rgo123!")   
            
            
            
            cy.visit('https://sso.dev.kargo.com/?redirect=https://marketplace.dev.kargo.com')
            cy.get('input[name="username"]').type("kargoqa@gmail.com")
            cy.get('input[name="password"]').type("K@rgo123!")
            cy.get('button[type="submit"]').wait(200).click()
            cy.get('.u-outerContainer').should('be.visible')
            
            cy.wait(3000)
            cy.get('[data-ng-if="header.isAuthorizedModule(menuItem) && !menuItem.disabled"][style=""] > .cpHeader-navLink')
            .click().wait(3000)     
            cy.get('.button--primary').click()
            cy.get('.is-active.ng-invalid > :nth-child(2) > :nth-child(1) > .prettyInput').type(`${campName}`) 
            cy.get(':nth-child(2) > .prettyCheckbox').click()
            cy.get('div[data-cp-pretty-select-options*="ctrl.getClosedLoopTypes()"]').click()
            cy.get('div.prettySelect-dropdown--modal:not([class*="is-hidden"]) li.prettySelect-dropdownItem:nth-child(2)').click();
            cy.get('input[placeholder="Salesforce ID"]').type(`${rand_number}`)
            cy.get('input[placeholder="Add advertiser here"]').type('Kargo Test')
            cy.get('krg-typeahead[data-krg-placeholder="Add advertiser here"] li:nth-child(1)').click().wait(3000)
            cy.get('input[placeholder="Add brand here"]').type('Kargo').wait(3000)
            cy.get('krg-typeahead[data-krg-placeholder="Add brand here"] li:nth-child(1)').click().wait(3000)
            cy.get('div[data-ng-model="ctrl.getSetSaleSourceId"]').click().wait(3000)
            cy.get('div:not([class*="is-hidden"])[class*="prettySelect-dropdown prettySelect-dropdown--bordered"] li:nth-child(1)').click().wait(3000)
            cy.get('input[placeholder*="Add Campaign Manager"]').type('henry coupet').wait(3000)
            cy.get('tags-input[name="campaignManagers"] li:nth-child(1)').click().wait(3000)
            cy.get('input[placeholder*="Sales Leads"]').type('{downarrow}').wait(3000)
            cy.get('tags-input[placeholder*="Sales Leads"] li:nth-child(1)').click().wait(3000)
            cy.get('tags-input[placeholder*="Client Service Manager"] input').type('henry coupet').wait(3000)
            cy.get('tags-input[placeholder*="Client Service Manager"] li:nth-child(1) p3').click().wait(3000)
            cy.get('input[placeholder="Add Client Development Manager"]').type('Emma Lehmann').wait(3000)
            cy.get('input[placeholder="Add Client Development Manager"]+div+ul li:nth-child(1)').click().wait(3000)
            cy.get('input[placeholder="Add Global Client Lead"]').type('{downarrow}').wait(3000)
            cy.get('div > fieldset > label > input[data-ng-model="campaign.io_number"]').type('123456789').wait(3000)   
            cy.fixture(fileName).then(fileContent => {
             cy.get('article.cpDropAreaBox input.js-fileInput').upload(
             { fileContent, fileName, mimeType: 'image/png' },
             { subjectType: 'drag-n-drop' },
            );
           });
            cy.get('.u-centerXY:not([class*="ng-hide"]) .loader-track').should('not.exist')
            cy.get('div > fieldset > label > input[data-ng-model="campaign.billing_contact"]').type('650-555-1212')
            cy.get('div > fieldset > label >input[data-ng-model="campaign.billing_phone"]').type('1-541-754-3010')
            cy.get('div > fieldset > label > input[data-ng-model="campaign.billing_email"]').type('kargoqaTestEmail@gmail.com')
            cy.get('input[placeholder="+ Target Location"]').type('United States')
            cy.get('auto-complete[source="ctrl.getGeoLocations($query,1)"] li:nth-child(1)').click()
            cy.get('input[placeholder="+ Anti-Target Location"]').type('New York')
            cy.get('auto-complete[source*="getGeoLocations"] li:nth-child(1)').click()
            cy.get('input[data-ng-model="$ctrl.entity.kpi_information.optimizable_kpi_performance"]').scrollIntoView()
            cy.get('fieldset.cpCreationPage-formSection.ng-pristine.ng-valid-pattern.ng-valid-maxlength.ng-invalid.ng-invalid-required > kc-add-edit-kpi-information > div:nth-child(1) > label:nth-child(1) > div').click().wait(3000)
            cy.get('div:not([class*="is-hidden"])[class*="prettySelect-dropdown--bordered"] li:nth-child(1)').click()
            cy.get('fieldset.cpCreationPage-formSection.ng-valid-pattern.ng-valid-maxlength.ng-invalid.ng-invalid-required.ng-dirty.ng-valid-parse > kc-add-edit-kpi-information > div:nth-child(1) > label:nth-child(2) > div').click().wait(3000)
            cy.get('div:not([class*="is-hidden"])[class*="prettySelect-dropdown--bordered"] li:nth-child(1)').click()
            cy.get('input[data-ng-model="$ctrl.entity.kpi_information.outcome_kpi_performance"]').scrollIntoView()
            cy.get('fieldset.cpCreationPage-formSection.ng-valid-pattern.ng-valid-maxlength.ng-invalid.ng-invalid-required.ng-dirty.ng-valid-parse > kc-add-edit-kpi-information > div:nth-child(3) > label:nth-child(1) > div').click().wait(3000)
            cy.get('div:not([class*="is-hidden"])[class*="prettySelect-dropdown--bordered"] li:nth-child(1)').click().wait(3000)
            cy.get('fieldset.cpCreationPage-formSection.ng-valid-pattern.ng-valid-maxlength.ng-invalid.ng-invalid-required.ng-dirty.ng-valid-parse > kc-add-edit-kpi-information > div:nth-child(3) > label:nth-child(2) > div').click().wait(3000)
            cy.get('div:not([class*="is-hidden"])[class*="prettySelect-dropdown--bordered"] li:nth-child(1)').click().wait(3000)
            cy.get('input[data-ng-model="campaign.dropbox_url"]').type('https://www.google.com').wait(3000)
            cy.get('button+button[data-ng-click="modal.getDelegate().submit()"]').click().wait(3000) 
            cy.wait(5000)   
            })

            it('get campaign id',()=>{
                gethttp(baseKMUrl+searchEndPoint+campName,function(response){

            
                    placemnetBody.campaign_id = response.body.data[0].id;
                    sitelistBody.campaign_id = response.body.data[0].id;
                })              
            })

            it('TC 003- Add a placeement (API): ',()=>{
                posthttp(baseKMUrl + getMainConfig.placements, placemnetBody,function(response){

                    assert.equal(response.status, 201, 'complete successfully')
                    assert.equal(response.body.message, "Placement created")
                }) 
            })

            
            it('TC 004- Add a site list (API):',()=>{
                posthttp(baseKMUrl + getMainConfig.sitelists, sitelistBody,function(response){
                    assert.equal(response.status, 201, 'complete successfully')
                    assert.equal(response.body.message, "SiteList was created")
                    siteListId = response.body.id;
                }) 
            })

            it('TC 005- Add properties to the site list (API):',()=>{
                puthttp(baseKMUrl + getMainConfig.sitelists + siteListId,sitelistupdateBody,function(response){
                    assert.equal(respones.status, 201, 'complete successfully')
                    assert.equal(response.body.message, "Site List updated")
                })
            })

            it('TC 001- Submitting to media and pushing to ad server (UI):',()=>{
                cy.visit('https://sso.dev.kargo.com/?redirect=https://marketplace.dev.kargo.com')
                cy.get('input[name="username"]').type("kargoqa@gmail.com")
                cy.get('input[name="password"]').type("K@rgo123!")
                cy.get('button[type="submit"]').wait(200).click()
                cy.get('.u-outerContainer').should('be.visible')
                cy.wait(2000)
                cy.get('li[class="cpHeader-navItem"]:nth-child(1)').click().wait(2000)
                cy.get('h2[data-ng-hide="table.config.hideTitle"]').should('be.visible');
                cy.get('kc-checkbox[data-ng-model="table.excludeTests"]').click
                cy.get('input[type="search"]').type(`${campName}`)
                cy.get('krg-campaigns-table > table > tbody > tr > td:nth-child(1) > div > div > h5 > a').click();
                cy.get('div h1.headerTitle').should('be.visible');
                cy.get('div h1.headerTitle').should('equle',`${campName}`)
                cy.get('button[data-cp-title="\'Submit For Media Plan\'"]').click();
                cy.get('button[class="button--secondary button--onLightColor detailsRail-item--button u-maxX button"]').should('be.visibl');
                cy.get('button[class="button--secondary button--onLightColor detailsRail-item--button u-maxX button"]').click();
                cy.get('h2[class="h2--cpModalDialog"]').should('be.visible');
                cy.get('button[data-ng-if="config.yesButton"]').click()
                cy.get('div header[class="cpTile--paneTile cpTile--success"] div div.u-centerY').should('be.visible');
                cy.get('div header[class="cpTile--paneTile cpTile--success"] div div.u-centerY').should('equal', '1 line item was successfully pushed to the Ad Server')

            });
    
}) 