//const { clone, extend } = require('lodash');
//require('../../support');
const main =require('../../configuration/mainURLs.json')
const body = require('../../configuration/brandPayload.json')
const putbody = require('../../configuration/brandEditPayload.json')
const post=require('../../src/https/post.js')
const get=require('../../src/https/get.js')
const patch=require('../../src/https/patch.js')

const moment = require('moment');

let url = main.MainUrl + main.BrandEndPoint;
let reqBody = body;
let editBody = putbody;
reqBody.name = "Md_Cyprss_API_Automation_Add_Brand_" + moment().format('YY.MM.DD_hh:mm:ss');
editBody.name = "Md_Cyprss_API_Automation_Update_Brand_" + moment().format('YY.MM.DD_hh:mm:ss');
let id

describe('Adding a Brand in Deal Manager', function() {
it('Adding a Brand - API', function(){
   post(url, reqBody,function(response){
    expect(response.status).to.eq(200)
    assert.equal(response.status, 200, 'Adding complete successfully')
    id = response.body.id
})              
}),

it('Updaing a Brand - API', function(){
  patch(url + id, editBody,function(response){
   expect(response.status).to.eq(200)
   assert.equal(response.status, 200, 'Updating complete successfully')

})              
}),

it('Retrieving a Brand - API', function(){
  get(url + id,function(response){
   expect(response.status).to.eq(200)
   expect(response.body.is_pmp_allowed).to.eq(true)

})             
})
})