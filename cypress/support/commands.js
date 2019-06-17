// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("httpPost", (url, reqBody) => {
    let postOptions = {
    url: url,
    method: 'POST',
    headers : {    
    'Content-Type': "application/json",
    'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJxYS5zdGFnaW5nLmthcmdvLmNvbSIsImlzcyI6InFhLnN0YWdpbmcua2FyZ28uY29tIiwiZXhwIjo0OTY5NTY5NjAwLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiYXBwTmFtZSI6InFhIiwiY2lkIjoiYmE1NmVmMWQwY2ZlMGEyNjVkMmQ4YzZlMjNlYzY1MmJiNDdlZWViMyIsImF1ZCI6ImthcmdvIiwianRpIjoiZTA5YmEwNmYtYWFmYS00Y2E2LWE1YzgtZTRlZWQzNWIzOWU4IiwiaXNzdWVkIjoxNTEzNjM1NTQ1LCJpYXQiOjE1MTM2MzU1NDUsIm5idCI6MTUxMzYzNTU0NX0.XyLn97a7Awiy0bD2kLLkqiWSERYrYo4XdfqG_A2Wz5ldKOGVwdv5VxUQrcsMpoMBd-Qs63EVv1MpMeMGeLsqMhILYkfaHXmFA92GdRqpBozvpo2MTKJc_rowF_0t5ipS6uxGaCdeSjdq16SXArkdtLWFRXZG9sUjqauT1psJbsjPI4F2ccGOhTYPjvJt3vsjtcA-Jw61fLMBhA1pMW10MemhLqcomGrUdDAK3bpfmMgOuPZH4oEqABFtUj2c6gd3JpB4PUJCnQtZbBjPA4iT6Bcpn0huJ0f4pyLwALqtzBM-Hw4N8Wl7KjDoRCCyXjP0iq-zWW5vERptvOzyUnv7NA"
  },
    json: reqBody
  }
    cy.request(postOptions)        
})


Cypress.Commands.add("httpGet", (url) => {
  let Options = {
  url: url,
  method: 'GET',
  headers : {    
  'Content-Type': "application/json",
  'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJxYS5zdGFnaW5nLmthcmdvLmNvbSIsImlzcyI6InFhLnN0YWdpbmcua2FyZ28uY29tIiwiZXhwIjo0OTY5NTY5NjAwLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiYXBwTmFtZSI6InFhIiwiY2lkIjoiYmE1NmVmMWQwY2ZlMGEyNjVkMmQ4YzZlMjNlYzY1MmJiNDdlZWViMyIsImF1ZCI6ImthcmdvIiwianRpIjoiZTA5YmEwNmYtYWFmYS00Y2E2LWE1YzgtZTRlZWQzNWIzOWU4IiwiaXNzdWVkIjoxNTEzNjM1NTQ1LCJpYXQiOjE1MTM2MzU1NDUsIm5idCI6MTUxMzYzNTU0NX0.XyLn97a7Awiy0bD2kLLkqiWSERYrYo4XdfqG_A2Wz5ldKOGVwdv5VxUQrcsMpoMBd-Qs63EVv1MpMeMGeLsqMhILYkfaHXmFA92GdRqpBozvpo2MTKJc_rowF_0t5ipS6uxGaCdeSjdq16SXArkdtLWFRXZG9sUjqauT1psJbsjPI4F2ccGOhTYPjvJt3vsjtcA-Jw61fLMBhA1pMW10MemhLqcomGrUdDAK3bpfmMgOuPZH4oEqABFtUj2c6gd3JpB4PUJCnQtZbBjPA4iT6Bcpn0huJ0f4pyLwALqtzBM-Hw4N8Wl7KjDoRCCyXjP0iq-zWW5vERptvOzyUnv7NA"
},
}
  cy.request(Options)        
})


Cypress.Commands.add("login", (url,email, password) => {
  cy.visit(url),
      cy.get('input[name="username"]').type(email),
      cy.get('input[name="password"]').type(password),
      cy.get('button[type="submit"]').wait(200).click(),
      cy.get('.u-outerContainer').should('be.visible')
})