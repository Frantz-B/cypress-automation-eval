const {clone, extend} = require('lodash');
const nameHelper = require('../../helpers/name-helper');
const publisherName = nameHelper.generateName('IN-HUB_publisher');
const propertyName = nameHelper.generateName('IN-HUB_property');
const adSlotName = nameHelper.generateName('IN-HUB_adSlot');
var pubID;
var propertyID;
var adSlotID;
var krakenAdSlotID;
var ad_tag_Id;
var regular_ad_tag_Id;
 const getRequest = (options = {}) => {
     const defaultOptions = {
         auth: {
            bearer: Cypress.env('authToken'),
        }
     };
     return extend(defaultOptions, options);
 };
context('checking adFormat in IN-hub/Kraken',() => {
     describe('checking adFormat in IN-HUB',() => {
         it('creating publisher',() => {
             cy.fixture('publisher.json').then((publisher) => {
                 const reqBody = clone(publisher);
                 reqBody.name = publisherName;
                 const requestOptions = getRequest({
                    method: 'POST',
                    body: reqBody,
                    url:`${Cypress.env('km')}/publishers`,
                 });                
                 cy.request(requestOptions).then((resp) => {
                    pubID = resp.body.id;
                    assert.equal(resp.status, 201, 'response status value ');
                    assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ');
                    cy.log(pubID);
                  });
                });
              });
              it('Creating property', () => {
                  cy.fixture('property.json').then((property) => {
                      const reqBody = clone(property);
                      reqBody.publisher_id = pubID;                    
                      reqBody.name = propertyName;
                      const requestOptions = getRequest({
                          method: 'POST',
                          body: reqBody,
                          url:`${Cypress.env('km')}/properties`,
                      });
                      cy.request(requestOptions).then((resp) => {
                        propertyID = resp.body.id;
                         assert.equal(resp.status, 201, 'response status value ');
                         assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ');  
                         cy.log(propertyID);                                            
                    });                  
                  });
               });
              it('creating regular adSlot',() => {
                  cy.fixture('adSlot.json').then((adSlot) => {
                      const reqBody = clone(adSlot);
                      reqBody.property_id = propertyID;                    
                      reqBody.display_name = adSlotName;
                      const requestOptions = getRequest({
                        method: 'POST',
                        body: reqBody,
                        url:`${Cypress.env('km')}/ad-slots`,
                    });
                    cy.request(requestOptions).then((resp) => {
                        adSlotID = resp.body.id;
                         assert.equal(resp.status, 200, 'response status value ');
                         assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ');  
                         cy.log(adSlotID);                                            
                    });                  
                  });
              });
              it('Getting regular adSlot adTag id',() =>{
                const requestOptions = getRequest({
                  method:'GET',
                  url:`${Cypress.env('km')}/ad-slots/${adSlotID}`
                })
                cy.request(requestOptions).then((resp)=>{
                  regular_ad_tag_Id= resp.body.ad_tag_kargo_id;
                  assert.equal(resp.body.ad_tag_kargo_id, regular_ad_tag_Id, 'Id is greater than 0 '); 
                  cy.log(regular_ad_tag_Id)


                });

              });
              it('Checking adSlots in IN-HUB', () => {
                  const requestOptions = getRequest({
                      method:'GET',
                      url: `${Cypress.env('inhub')}/api/ad-slots?km_id=${adSlotID}`,
                    });  
                    cy.request(requestOptions).then((resp) => {
                        assert.equal(resp.status,200,'response status value ');
                        assert.equal(resp.body.count, 1, 'count value ');
                    });
                  });
                  it('creating kraken adSlot',() => {
                    cy.fixture('adSlot.json').then((adSlot) => {
                        const reqBody = clone(adSlot);
                        reqBody.property_id = propertyID;                    
                        reqBody.display_name = adSlotName;
                        reqBody.is_kraken= true;
                        const requestOptions = getRequest({
                          method: 'POST',
                          body: reqBody,
                          url:`${Cypress.env('km')}/ad-slots`,
                          
                      });
                      cy.request(requestOptions).then((resp) => {
                          krakenAdSlotID = resp.body.id;
                           assert.equal(resp.status, 200, 'response status value ');
                           assert.isAbove(resp.body.id, 0, 'Id is greater than 0 ');  
                           cy.log(krakenAdSlotID);                                            
                      });                  
                    });
                });
                it('Getting adSlot adTag id',() =>{
                  const requestOptions = getRequest({
                    method:'GET',
                    url:`${Cypress.env('km')}/ad-slots/${krakenAdSlotID}`
                  })
                  cy.request(requestOptions).then((resp)=>{
                    ad_tag_Id= resp.body.ad_tag_kargo_id;
                    assert.equal(resp.body.ad_tag_kargo_id, ad_tag_Id, 'Id is greater than 0 '); 
                    cy.log(ad_tag_Id)
  
  
                  });
  
                });
                it('Checking kraken adSlots in IN-HUB', () => {
                    const requestOptions = getRequest({
                        method:'GET',
                        url: `${Cypress.env('inhub')}/api/ad-slots?km_id=${krakenAdSlotID}`,
                       
                      });  
                      cy.request(requestOptions).then((resp) => {
                          assert.equal(resp.status,200,'response status value ');
                          assert.equal(resp.body.count, 1, 'count value ');
                      });
                    });
                    it('Checking kraken adSlots in kraken side', () =>{
                        const requestOptions = getRequest({
                            method:'GET',
                            url: `${Cypress.env('kraken')}/unfiltered/ad-slot?id=${ad_tag_Id}`  
                            
                          }); 

                          cy.request(requestOptions).then((resp) => {
                         assert.equal(resp.status,200,'response status value ');
                         assert.equal(String(resp.body.data.adSlots[0].adFormatsApprovedForDirect) , '', 'ad format approved for direct');
                         assert.equal(String(resp.body.data.adSlots[0].adFormatsApprovedForPmp) , '', 'ad format approved for pmp');   
                         assert.equal(resp.body.data.adSlots[0].ampEnabled , false, 'amp enabled');  
                         assert.equal(resp.body.data.adSlots[0].active , true, 'ad slot active '); 
                         assert.equal(String(resp.body.data.adSlots[0].adFormats) , '', 'ad Format '); 
                         assert.equal(resp.body.data.adSlots[0].adSlotType , "", 'ad slot active ');
                         assert.equal(resp.body.data.adSlots[0].sspSizes[0].primary , true, 'ssp size primary '); 
                         assert.equal(resp.body.data.adSlots[0].sspSizes[0].width , 320, 'ssp size primary ');
                         assert.equal(resp.body.data.adSlots[0].sspSizes[0].height , 50, 'ssp size primary ');
                          
                       });
                     });
                    it('Creating adFormat', () => {
                        cy.fixture('adFormat.json').then((adFormat) => {
                            const reqBody = clone(adFormat);                                          
                            const requestOptions = getRequest({
                              method: 'PUT',
                              body: reqBody,
                              url:`${Cypress.env('km')}/ad-slot-format-approval/${adSlotID}`,                            
                          });
                          cy.request(requestOptions).then((resp) => {
                            assert.equal(resp.status,200,'response status value ');
                        });   
                      });
                    });

                    it('Creating adFormat for kraken adSlot', () => {
                        cy.fixture('adFormat.json').then((adFormat) => {
                            const reqBody = clone(adFormat);                                                             
                            const requestOptions = getRequest({
                              method: 'PUT',
                              body: reqBody,
                              url:`${Cypress.env('km')}/ad-slot-format-approval/${krakenAdSlotID}`,                            
                          });
                          cy.request(requestOptions).then((resp) => {
                            assert.equal(resp.status,200,'response status value ');    
                    });       
                  });
                });

                it('Checking kraken adSlots in kraken side', () =>{
                    const requestOptions = getRequest({
                        method:'GET',
                        url: `${Cypress.env('kraken')}/unfiltered/ad-slot?id=${ad_tag_Id}`  
                        
                      });  
                      cy.request(requestOptions).then((resp) => {
                     assert.equal(resp.status,200,'response status value ');
                     assert.equal(resp.body.data.adSlots[0].adFormatsApprovedForDirect , 8, 'ad format approved for direct');
                     assert.equal(resp.body.data.adSlots[0].adFormatsApprovedForPmp , 8, 'ad format approved for pmp');  
                     assert.equal(resp.body.data.adSlots[0].ampEnabled , false, 'amp enabled');  
                     assert.equal(resp.body.data.adSlots[0].active , true, 'ad slot active '); 
                     assert.equal(resp.body.data.adSlots[0].adFormats , 8, 'ad Format '); 
                     assert.equal(resp.body.data.adSlots[0].adSlotType , "", 'ad slot active ');
                   });


              });
             });
            })
