# deal-manager-automation
Automated test suite for Deal Manager

This testing framework is a WIP, built using [Cypress](https://www.cypress.io).

## Getting Started
- `yarn install`

## Running Tests
To run the entire test suite, simply run `yarn test`. You can also run individual tests via CLI or via a UI runner.
Please See the Cypress documentation for more information about how to run individual tests.

You can run `yarn ui` to see the UI Runner, which is pretty self explanatory.

## Writing Tests

To add new tests, simply add test cases under cypress/integrations. See existing tests or Cypress documentation for more information.

## CI

This repository is hooked up to run automatically in Travis when there are changes to the master branch. By default, the baseUrl in `cypress.json` will be used as the base deal-maanger URL for all API requests, but this can be overriden via environment variables by setting `CYPRESS_baseUrl` to whatever you want.

The default base URL is:
`https://deal-manager.dev.kargo.com`