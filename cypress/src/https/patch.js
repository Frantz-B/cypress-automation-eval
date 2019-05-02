
function apiPatch (apiUrl, reqBody, success) {
  cy.request({
    'method': 'PATCH',
   'url': apiUrl,
   'headers': {
    'Content-Type': "application/json",
    'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJxYS5zdGFnaW5nLmthcmdvLmNvbSIsImlzcyI6InFhLnN0YWdpbmcua2FyZ28uY29tIiwiZXhwIjo0OTY5NTY5NjAwLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiYXBwTmFtZSI6InFhIiwiY2lkIjoiYmE1NmVmMWQwY2ZlMGEyNjVkMmQ4YzZlMjNlYzY1MmJiNDdlZWViMyIsImF1ZCI6ImthcmdvIiwianRpIjoiZTA5YmEwNmYtYWFmYS00Y2E2LWE1YzgtZTRlZWQzNWIzOWU4IiwiaXNzdWVkIjoxNTEzNjM1NTQ1LCJpYXQiOjE1MTM2MzU1NDUsIm5idCI6MTUxMzYzNTU0NX0.XyLn97a7Awiy0bD2kLLkqiWSERYrYo4XdfqG_A2Wz5ldKOGVwdv5VxUQrcsMpoMBd-Qs63EVv1MpMeMGeLsqMhILYkfaHXmFA92GdRqpBozvpo2MTKJc_rowF_0t5ipS6uxGaCdeSjdq16SXArkdtLWFRXZG9sUjqauT1psJbsjPI4F2ccGOhTYPjvJt3vsjtcA-Jw61fLMBhA1pMW10MemhLqcomGrUdDAK3bpfmMgOuPZH4oEqABFtUj2c6gd3JpB4PUJCnQtZbBjPA4iT6Bcpn0huJ0f4pyLwALqtzBM-Hw4N8Wl7KjDoRCCyXjP0iq-zWW5vERptvOzyUnv7NA"
  }, 
  json: reqBody,
  }).then(function (response,error){
    if(error){
      console.log(error)
      return
    }else{
      success(response)
    }

  })
  

}


module.exports = apiPatch