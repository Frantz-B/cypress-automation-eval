const { extend, clone } = require('lodash');
const nameHelper = require('../../helpers/name-helper');

const getRequest = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '',
    Cookie: 'XSRF-TOKEN=46ee9e14257bdc34588db0563ca2e34682462144966ce4d9c1e60e13015fe5ad',
  };
  return extend(defaultOptions, options);
};

context('Verify the ability of updating users', () => {
  describe('Updating users', () => {
    let userId;
    let userCount;
    const random = Math.floor(Math.random() * 200);

    it('Creating user in KM site', () => {
      cy.fixture('KM-user.json').then((user) => {
        const reqBody = clone(user);
        reqBody.firstname = nameHelper.generateName('user');
        reqBody.lastname = ('created by cypress');
        reqBody.username = `AutomatedUser${random}@kargo.com`;
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: 'https://marketplace.dev.kargo.com/api/v1/users',
        });
        cy.request(requestOptions)
          .then((resp) => {
            userId = resp.body.id;
            cy.log(userId);
            cy.log(reqBody);

            assert.equal(resp.status, 201, 'response status ');
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          });
      });
    });
    it('retrieve users before adding new user', () => {
      const requestOptions = getRequest();
      requestOptions.url = 'https://deal-manager.dev.kargo.com/api/v1/users';
      cy.request(requestOptions)
        .then((resp) => {
          userCount = resp.body.count;
          assert.equal(resp.body.count, userCount, 'user count');
        });
    });
    it('adding users', () => {
      cy.fixture('addUser.json').then((user) => {
        const reqBody = clone(user);
        reqBody.id = userId;
        const requestOptions = getRequest({
          method: 'POST',
          body: reqBody,
          url: 'https://deal-manager.dev.kargo.com/api/v1/users',
        });
        cy.request(requestOptions)
          .then((resp) => {
            userId = resp.body.id;
            cy.log(userId);
            cy.log(reqBody);

            assert.equal(resp.status, 200, 'response status ');
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
          });
      });
    });

    it('add new role to user', () => {
      cy.fixture('addRole.json').then((user) => {
        const reqBody = clone(user);
        const requestOptions = getRequest({
          method: 'PATCH',
          body: reqBody,
          url: `https://deal-manager.dev.kargo.com/api/v1/users/${userId}`,
        });
        cy.request(requestOptions)
          .then((resp) => {
            userId = resp.body.id;
            cy.log(userId);
            cy.log(reqBody);

            assert.equal(resp.status, 200, 'response status ');
            assert.isAbove(resp.body.id, 0, ['id is greater than 0 ']);
            assert.equal(resp.body.company_id, 2, 'company ID');
          });
      });
    });
    it('check if the user was added with new role', () => {
      const requestOptions = getRequest();
      requestOptions.url = `https://deal-manager.dev.kargo.com/api/v1/users/${userId}?with=roles`;

      cy.request(requestOptions)
        .then((resp) => {
          cy.log(userId);
          assert.equal(resp.body.roles[1].UserRole.role_id, 4, 'role id');
          assert.equal(resp.body.id, userId, 'user id');
          assert.equal(resp.body.roles[1].description, 'Can do everything on seats (within bidders)', 'description ');
          assert.equal(resp.body.company_id, 2, 'company ID');
        });
    });
    it('retrieve users after adding new user', () => {
      const requestOptions = getRequest();
      requestOptions.url = 'https://deal-manager.dev.kargo.com/api/v1/users';
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.count, (userCount + 1), 'user count');
        });
    });

    it('Delete the created user', () => {
      const requestOptions = getRequest({
        method: 'DELETE',
        url: `https://deal-manager.dev.kargo.com/api/v1/users/${userId}`,
      });
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.status, 200, 'response status ');
          assert.equal(resp.body, 'Model deleted', 'deleting message');
        });
    });
    it('retrieve users count after deleting the created user', () => {
      const requestOptions = getRequest();
      requestOptions.url = 'https://deal-manager.dev.kargo.com/api/v1/users';
      cy.request(requestOptions)
        .then((resp) => {
          assert.equal(resp.body.count, userCount, 'user count');
        });
    });
  });
});
