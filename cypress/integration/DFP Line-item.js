const {clone, extend} = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const campName = nameHelper.generateName('DFP_Campaign-created');
const placementName = nameHelper.generateName('DFP_placement-created');
let creativeName = nameHelper.generateName('automated_Creative');
var salesForce = Math.floor((Math.random() * 90000000000000000) + 100000000000000000);
var startDate = Cypress.moment().format('YYYY-MM-DD');
var endDate = Cypress.moment().add(1, 'months').format('YYYY-MM-DD');
var endDateRegular = Cypress.moment().add(1, 'months').subtract(2, 'days').format('YYYY-MM-DD');
var campId;
var mediaPlanId;
var regLineItemId_KM;
var krakenId_KM;
var placementID;
var creativeID;
var Lineitem_ID;

const getRequest = (options = {}) => {
    const defaultOptions = {
        auth: {
            bearer: Cypress.env('authToken'),
        },
        headers:{
          cookie: "MP_DEV=l3in162879ffnpufq6qu030qtl",
          "XSRF-TOKEN": "b78b10e4c4eda7e4d5fcf0223356ec0f9b7161441716d9b16275a2d0126335b",
          "content-type":" application/json"
        }
    };
    return extend(defaultOptions, options);
};

context('Checking line items in DFP', () => {
    describe('Checking created line-items in DFP', () => {
        it('Create a campaign', () => {
            cy.fixture('campaigns.json').then((camp) => {
              const reqBody = clone(camp);
              reqBody.name = campName;
              reqBody.sale_date = startDate
              reqBody.salesforce_id = salesForce;
              const requestOptions = getRequest({
                method: 'POST',
                body: reqBody,
                url: `${Cypress.env('km')}/campaigns`
              });
      
              cy.request(requestOptions).then((resp) => {
                campId = resp.body.id;
                assert.equal(resp.status, 201, 'response status value ');
                assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ')
              });
            });
          });
        it('Create a placement', () => {
            cy.fixture('placement.json').then((placement) => {
              const reqBody = clone(placement);
              reqBody.campaign_id = campId;
              reqBody.name = placementName;
              reqBody.flight_date_start = startDate;
              reqBody.flight_date_end = endDate;
              reqBody.goals[0].flight_date_start = startDate;
              reqBody.goals[0].flight_date_end = endDate;
              const requestOptions = getRequest({
                method: 'POST',
                body: reqBody,
                url: `${Cypress.env('km')}/placements`
              });
      
              cy.request(requestOptions).then((resp) => {
                assert.equal(resp.status, 201, 'response status value ');
                assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ');
                placementID = resp.body.id;
                cy.log(placementID)
              });
            });
          });  
          it('Create a site list', () => {
            cy.fixture('siteList.json').then((siteList) => {
              const reqBody = clone(siteList);
              reqBody.name = campName;
              reqBody.campaign_id = campId;
              const requestOptions = getRequest({
                method: 'POST',
                body: reqBody,
                url: `${Cypress.env('km')}/site-lists`
              });
        
              cy.request(requestOptions).then((resp) => {
              assert.equal(resp.status, 201, 'response status value ');
              assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ')
              
              });
            });
          });
          it('Creating Creative for placement',() => {
            cy.fixture('creative.json').then((Creative)=>{
              const reqBody = clone(Creative);
               reqBody.name = creativeName;
               reqBody.placement_id = placementID;
              const requestOptions = getRequest({
                method: 'POST',
                body: reqBody,
                url: `https://marketplace.dev.kargo.com/api/v1/creatives`
              });
              cy.request(requestOptions).then((resp) => {
                assert.equal(resp.status, 201, 'response status value ');
                assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ')
                creativeID=resp.body.id;
                creativeName=resp.body.name;
                cy.log(creativeID);
                });

            });

          });
          
    it('Submitting Media Plan and assigning the line items IDs', () => {
        cy.fixture('mediaPlan.json').then((mediaPlan) => {
          const reqBody = clone(mediaPlan);
          reqBody.campaign_id = campId;
          
          const requestOptions = getRequest({
            method: 'POST',
            body: reqBody,
            url: `${Cypress.env('km')}/media-plans`
          });
    
          cy.request(requestOptions).then((resp) => {   
            assert.equal(resp.status, 200, 'response status value ');
            assert.include(resp.body.message, 'Media plan', 'The submitted media plan contains "Media plan" ');
            assert.include(resp.body.message, 'created', 'The submitted media plan contains "created" ');
            mediaPlanId = resp.body.media_plan.id;
            krakenId_KM = resp.body.media_plan.campaign.placements[0].line_items[1].id
            regLineItemId_KM = resp.body.media_plan.campaign.placements[0].line_items[0].id
            
            cy.log(`kraken line item id = ${krakenId_KM}`)    
            cy.log(`Regular line item id = ${regLineItemId_KM}`) 
          });
        });
      });
      it('Adding Targeting to Kraken line item', () => {
        cy.fixture('lineItemTargeting.json').then((targeting) => {
          const reqBody = clone(targeting);
          const requestOptions = getRequest({
            method: 'PUT',
            body: reqBody,
            url: `${Cypress.env('km')}/line-items/${krakenId_KM}`
          });
      
          cy.request(requestOptions).then((resp) => {   
            assert.equal(resp.status, 200, 'response status value ');
            assert.include(resp.body.message, 'LineItem updated', 'The updated line item contains "lineItem updated" ');
            Lineitem_ID = resp.body.id
          });
          });
        });
  
      it('Updating Kraken line item setting', () => {
        cy.fixture('kraken-lineitem-setting.json').then((krakenSetting) => {
          const reqBody = clone(krakenSetting);
          reqBody.name_suffix = `${krakenId_KM}`
          reqBody.dfp_flight_date_start = startDate
          reqBody.dfp_flight_date_end = endDate
          const requestOptions = getRequest({
            method: 'PUT',
            body: reqBody,
            url: `${Cypress.env('km')}/line-items/${krakenId_KM}`
          });
        
          cy.request(requestOptions).then((resp) => {   
            assert.equal(resp.status, 200, 'response status value ');
            assert.include(resp.body.message, 'LineItem updated', 'The updated line item contains "lineItem updated" ');
              });
            });
            
          });

  
      it('Pushing to Ad Server', () => {
        const requestOptions = getRequest({
          method: 'POST',
          url: `${Cypress.env('km')}/media-plans/${mediaPlanId}/push`
        });  
            cy.request(requestOptions).then((resp) => {
            assert.equal(resp.status, 200, 'response status value ')
            assert.equal(resp.body.media_plan_id, mediaPlanId, 'Media Plan ID value ')
            assert.equal(resp.body.campaign_id, campId, 'campaign ID value ')
  
            });  
        cy.log('A line item needs 10 - 15 sec to be pushed properly').wait(15000) // It takes between 10 - 15 sec to line item to be pushed properly         
        });
        //fjxrgs
        it('associating kraken LI',()=>{
          cy.fixture('associating_KrakenCreative.json').then((resp) => {
            const reqBody = clone(resp);
           reqBody.creatives=[creativeID] ;
            const requestOptions = getRequest({
              method: 'PUT',
              body: reqBody,
              url: `https://marketplace.dev.kargo.com/api/v1/line-item-creative-association/${Lineitem_ID}`
            });
            cy.request(requestOptions).then((resp) => {   
              assert.equal(resp.status, 200, 'response status value ');
             
              });


        });
      });
      /////////////////////////////////
      it('associating regular LI',()=>{
        cy.fixture('associating_KrakenCreative.json').then((resp) => {
          const reqBody = clone(resp);
         reqBody.creatives=[creativeID] ;
          const requestOptions = getRequest({
            method: 'PUT',
            body: reqBody,
            url: `https://marketplace.dev.kargo.com/api/v1/line-item-creative-association/${regLineItemId_KM}`
          });
          cy.request(requestOptions).then((resp) => {   
            assert.equal(resp.status, 200, 'response status value ');
         
            });


      });
    });

            it('approving Campaign',()=>{
              cy.fixture('approvingCampaign.json').then((resp) => {
                const reqBody = clone(resp);
                const requestOptions = getRequest({
                  method: 'PUT',
                  body: reqBody,
                  url: `https://marketplace.dev.kargo.com/api/v1/campaign-integrations/${campId}`
                });
                cy.request(requestOptions).then((resp) => {   
                  assert.equal(resp.status, 200, 'response status value ');
                  });

              });

            });
            it('checking  kraken line item DFP ', () => {
              const requestOptions = getRequest({
                method: 'GET',
                url: `https://marketplace.dev.kargo.com/api/v1/line-item-integrations/dfp?ids=${Lineitem_ID}&report=true`
                });  
              cy.request(requestOptions).then((resp) => {
                assert.equal(resp.status, 200, 'response status value ');
                assert.equal(resp.body.data[0].status,'READY','Line item status ');
                assert.equal(resp.body.data[0].start_date,startDate,'start date ');
                assert.equal(resp.body.data[0].end_date,endDate,'end date ');
                assert.equal(resp.body.data[0].impression_goal,100,'impression goal ');
                });       
              });
              it('checking  regular line item DFP ', () => {
                const requestOptions = getRequest({
                  method: 'GET',
                  url: `https://marketplace.dev.kargo.com/api/v1/line-item-integrations/dfp?ids=${regLineItemId_KM}&report=true`
                  });  
                cy.request(requestOptions).then((resp) => {
                  assert.equal(resp.status, 200, 'response status value ');
                  assert.equal(resp.body.data[0].status,'READY','Line item status ');
                  assert.equal(resp.body.data[0].start_date,startDate,'start date ');
                  assert.equal(resp.body.data[0].end_date,endDateRegular,'end date ');
                  assert.equal(resp.body.data[0].impression_goal,1053,'impression goal ');
                  });       
                });
  

      
   });
});