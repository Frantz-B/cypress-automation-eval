# deal-manager-automation
Automated test suite for Deal Manager


## Getting Started
- `npm install`

## Running Tests
To run the entire test suite, simply run `npm run test`. You can also run individual tests via CLI or via a UI runner.
i.e. to run a specific test case, simply run `npm test testSeat` 

Note: testSeat is a key where "testSeat": "cypress run --spec 'cypress/integration/ui/seats.js’” ,
you can add, edit and delete these keys from package.json page
Please See the Cypress documentation for more information.

You can run `npm run ui` to see the UI Runner, which is pretty self explanatory.

## Writing Tests

To add new tests, simply add test cases under cypress/integrations. See existing tests or Cypress documentation for more information.

## CI

This repository is hooked up to run automatically in Travis when there are changes to the master branch. By default, the baseUrl in `cypress.json` will be used as the base deal-maanger URL for all API requests, but this can be overriden via environment variables by setting `CYPRESS_baseUrl` to whatever you want.

The default base URL is:
`https://deal-manager.dev.kargo.com`


## JIRA

In future we will use JIRA Issue tracker it would like to integrate GitHub with JIRA, In order to track commits and associate them with open tickets and then hooked up the GitHub side to provide notification when new commits or changes are made to the code base. 
