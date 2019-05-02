const { clone, extend } = require('lodash');
//require('../../support/commands.js');
const moment = require('moment');

let url, reqBody,id;

describe('Adding a Brand in Deal Manager', function() {
it('Adding a Brand - API', function(){
cy.fixture('brandPayload.json').then((brandPayload) =>{
reqBody = brandPayload;
reqBody.name = "Md_Cyprss_API_Automation_Add_Brand_" + moment().format('YY.MM.DD_hh:mm:ss');
url = "brand/"

cy.httpPost(url, reqBody).then((response) =>  
{
  expect(response.status).to.eq(200);
  id = response.body.id;
})
})
}),

it('returning a Brand - API', function(){
  console.log('reqBody.name = ' + reqBody.name)
  cy.httpGet(url + id).then((response) =>  
  {
    expect(response.status).to.eq(200);
  })
})
}) 