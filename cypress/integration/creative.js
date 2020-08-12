const dealgroupJson = require('../../fixtures/deal-group');
const creativeJson = require('../../fixtures/creative');
const { generateName, generateRandomNum } = require('../../helpers/name-helper');

const { clone, extend } = Cypress._;

const requestOptions = (options = {}) => {
  const defaultOptions = {
    auth: {
      bearer: Cypress.env('authToken'),
    },
    url: '/api/v1/creative',
  };
  return extend(defaultOptions, options);
};

context('Creatives', () => {
  describe('Creatives API', () => {
    it('Using a created deal-group || creating new one ', () => {
      const dealGroupRecentlyCreated = Cypress.moment().format('YY.MM.DD');
      const dealGroupSearchReq = requestOptions({
        url: `/api/v1/deal-group?search=${dealGroupRecentlyCreated}`,
      });

      cy.request(dealGroupSearchReq).then((searchResponse) => {
        const dealGroupRow = searchResponse.body.rows[0];

        if (dealGroupRow) {
          const dmDealGroupId = dealGroupRow.id;
          cy.task('log', `Eligible deal-Group Id found & being used as Parent: ${dmDealGroupId}`);
        } else {
          cy.task('log', 'Deal Group being created as a Parent');

          const dealgroupReqBody = clone(dealgroupJson);
          dealgroupJson.salesforce_id = Cypress.moment().format('[api]YYYYMMMDDhhmmss');
          dealgroupJson.name = generateName('API-deal-group_created');
          dealgroupJson.target_spend = generateRandomNum(1000);

          const dmdealGroupRequestOptions = requestOptions({
            method: 'POST',
            body: dealgroupReqBody,
            url: '/api/v1/deal-group',
          });

          cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
            dealgroupJson.id = dmdealGroupResponse.body.id;
            assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value ');
            cy.task('log', `dealGroup id: ${dealgroupJson.id}`);
          });
        }
      });
    });

    it('Create a creative', () => {
      creativeJson.name = generateName('API-Creative_created');
      creativeJson.deal_group_id = dealgroupJson.id;
      const creativeReqBody = clone(creativeJson);
      const creativeReqOpts = requestOptions({
        method: 'POST',
        body: creativeReqBody,
        url: '/api/v1/creative',
      });

      cy.request(creativeReqOpts).then((creativeResponse) => {
        creativeJson.id = creativeResponse.body.id;

        assert.equal(creativeResponse.status, 200, 'creativeResponseonse status value ');
        assert.isAbove(creativeResponse.body.id, 0, 'id is greater than 0 ');
      });
    });

    it('Verify created creative', () => {
      const creativeReqOptns = requestOptions();
      creativeReqOptns.url = `/api/v1/creative/${creativeJson.id}`;

      cy.request(creativeReqOptns).then((creativeResp) => {
        const creativePayload = creativeResp.body;
        cy.log(creativePayload);
        assert.equal(creativeResp.status, 200, 'Response status value :');
        assert.equal(creativePayload.id, creativeJson.id, 'Creative ID :');
        assert.equal(creativePayload.deal_group_id, creativeJson.deal_group_id, 'Deal-Group ID :');
        assert.equal(creativePayload.name, creativeJson.name, 'Creative Name :');
        assert.equal(creativePayload.is_archived, false, 'Creative Archive status :');
      });
    });

    it('Update a creative', () => {
      creativeJson.name = generateName('API-Creative_Updated');
      const creativeReqBody = clone(creativeJson);
      const creativeReqOpts = requestOptions({
        method: 'PATCH',
        body: creativeReqBody,
        url: `/api/v1/creative/${creativeJson.id}`,
      });

      cy.request(creativeReqOpts).then((creativeResponse) => {
        creativeJson.id = creativeResponse.body.id;

        assert.equal(creativeResponse.status, 200, 'creativeResponseonse status value ');
        assert.isAbove(creativeResponse.body.id, 0, 'id is greater than 0 ');
      });
    });

    it('Verify updated creative', () => {
      const creativeReqOptns = requestOptions();
      creativeReqOptns.url = `/api/v1/creative/${creativeJson.id}`;

      cy.request(creativeReqOptns).then((creativeResp) => {
        const creativePayload = creativeResp.body;
        cy.log(creativePayload);
        assert.equal(creativeResp.status, 200, 'Response status value :');
        assert.equal(creativePayload.id, creativeJson.id, 'Creative ID :');
        assert.equal(creativePayload.deal_group_id, creativeJson.deal_group_id, 'Deal-Group ID :');
        assert.equal(creativePayload.name, creativeJson.name, 'Creative Name :');
        assert.equal(creativePayload.is_archived, false, 'Creative Archive status :');
      });
    });

    it('Archiving a creative', () => {
      const creativeReqOpts = requestOptions({
        method: 'DELETE',
        url: `/api/v1/creative/${creativeJson.id}`,
      });

      cy.request(creativeReqOpts).then((creativeResponse) => {
        assert.equal(creativeResponse.status, 200, 'creativeResponseonse status value ');
        assert.equal(creativeResponse.body, 'Model deleted', 'id is greater than 0 ');
      });
    });

    it('Unarchiving a creative', () => {
      const creativeReqOpts = requestOptions({
        method: 'PUT',
        url: `/api/v1/creative/${creativeJson.id}/unarchive`,
      });

      cy.request(creativeReqOpts).then((creativeResponse) => {
        assert.equal(creativeResponse.status, 200, 'creativeResponseonse status value ');
        assert.isAbove(creativeResponse.body.id, 0, 'id is greater than 0 ');
      });
    });
  });
});
