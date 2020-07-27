const dealgroupJson = require('../../fixtures/deal-group');
const { generateName, generateRandomNum } = require('../../helpers/name-helper');

const { clone, extend } = Cypress._; // _ using lodash built-in library;

context('Deal-group ', () => {
  describe('Deal-group  API', () => {
    const requestOptions = (options = {}) => {
      const defaultOptions = {
        auth: {
          bearer: Cypress.env('authToken'),
        },
        url: '/api/v1/deal-group',
      };
      return extend(defaultOptions, options);
    };

    it('Create dealGroups in DM', () => {
      dealgroupJson.salesforce_id = Cypress.moment().format('[api]YYYYMMMDDhhmm');
      dealgroupJson.target_spend = generateRandomNum(1000);
      dealgroupJson.name = generateName('API-deal-group_created');
      const dealgroupReqBody = clone(dealgroupJson);

      const dmdealGroupRequestOptions = requestOptions({
        method: 'POST',
        body: dealgroupReqBody,
      });

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        dealgroupJson.id = dmdealGroupResponse.body.id;
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value ');
        cy.task('log', `dealGroup id: ${dealgroupJson.id}`);
      });
    });

    it('Verify Created dealGroup on DM', () => {
      const dmdealGroupRequestOptions = requestOptions();
      dmdealGroupRequestOptions.url += `/${dealgroupJson.id}?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true`;
      // Using this url due to it gives all info about created deal-group

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        const dmdealGroupPayload = dmdealGroupResponse.body;
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value ');
        assert.equal(dmdealGroupPayload.name, dealgroupJson.name, 'dealGroup Name ');
        assert.equal(dmdealGroupPayload.id, dealgroupJson.id, 'dealGroup ID in DM ');
        assert.equal(dmdealGroupPayload.kpi.outcome_kpi, dealgroupJson.kpi.outcome_kpi, 'outcome kpi');
        assert.equal(dmdealGroupPayload.kpi.optimizable_kpi, dealgroupJson.kpi.optimizable_kpi, 'optimizable kpi ');
        assert.equal(dmdealGroupPayload.dealGroupBuyer.bidder_id, dealgroupJson.dealGroupBuyer.bidder_id, 'bidder id ');
        assert.equal(dmdealGroupPayload.dealGroupAdvertiser[0].km_advertiser_id, dealgroupJson.advertisers[0], 'advertiser ');
        assert.equal(dmdealGroupPayload.team.campaign_managers[0].name, dealgroupJson.team.campaign_managers[0].name, 'campagin manager name ');
        assert.equal(dmdealGroupPayload.team.agency_sales_lead[0].name, dealgroupJson.team.agency_sales_lead[0].name, 'agency sales lead name ');
        assert.equal(dmdealGroupPayload.team.client_service_managers[0].name, dealgroupJson.team.client_service_managers[0].name, 'client service manager name ');
        assert.equal(dmdealGroupPayload.kpi.outcome_kpi_measurement_partner, dealgroupJson.kpi.outcome_kpi_measurement_partner, 'outcome kpi measurement partner');
        assert.equal(dmdealGroupPayload.kpi.optimizable_kpi_measurement_partner, dealgroupJson.kpi.optimizable_kpi_measurement_partner, 'optimizable kpi measurement partner ');
      });
    });

    it('Update dealGroup in DM', () => {
      dealgroupJson.name += '-updated';
      dealgroupJson.kpi.optimizable_kpi = 'CPM';
      dealgroupJson.kpi.outcome_kpi = 'Cost Per';
      dealgroupJson.closed_loop_report = 'merkle';
      dealgroupJson.target_spend = generateRandomNum(1000);
      dealgroupJson.kpi.optimizable_kpi_measurement_partner = 'Kargo';
      dealgroupJson.kpi.outcome_kpi_measurement_partner = 'Floodlight';
      dealgroupJson.salesforce_id = Cypress.moment().format('[api]YYYYMMMDDhhmm');

      const dealgroupReqBody = clone(dealgroupJson);

      const dmdealGroupRequestOptions = requestOptions({
        method: 'PATCH',
        body: dealgroupReqBody,
        url: `/api/v1/deal-group/${dealgroupJson.id}`,
      });

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value :');
      });
    });

    it('Verify Created dealGroup on DM', () => {
      const dmdealGroupRequestOptions = requestOptions();
      dmdealGroupRequestOptions.url += `/${dealgroupJson.id}?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true`;
      // Using this url due to it gives all info about created deal-group

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        const dmdealGroupPayload = dmdealGroupResponse.body;
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value ');
        assert.equal(dmdealGroupPayload.name, dealgroupJson.name, 'dealGroup Name ');
        assert.equal(dmdealGroupPayload.id, dealgroupJson.id, 'dealGroup ID in DM ');
        assert.equal(dmdealGroupPayload.kpi.outcome_kpi, dealgroupJson.kpi.outcome_kpi, 'outcome kpi');
        assert.equal(dmdealGroupPayload.kpi.optimizable_kpi, dealgroupJson.kpi.optimizable_kpi, 'optimizable kpi ');
        assert.equal(dmdealGroupPayload.dealGroupBuyer.bidder_id, dealgroupJson.dealGroupBuyer.bidder_id, 'bidder id ');
        assert.equal(dmdealGroupPayload.dealGroupAdvertiser[0].km_advertiser_id, dealgroupJson.advertisers[0], 'advertiser ');
        assert.equal(dmdealGroupPayload.team.campaign_managers[0].name, dealgroupJson.team.campaign_managers[0].name, 'campagin manager name ');
        assert.equal(dmdealGroupPayload.team.agency_sales_lead[0].name, dealgroupJson.team.agency_sales_lead[0].name, 'agency sales lead name ');
        assert.equal(dmdealGroupPayload.team.client_service_managers[0].name, dealgroupJson.team.client_service_managers[0].name, 'client service manager name ');
        assert.equal(dmdealGroupPayload.kpi.outcome_kpi_measurement_partner, dealgroupJson.kpi.outcome_kpi_measurement_partner, 'outcome kpi measurement partner');
        assert.equal(dmdealGroupPayload.kpi.optimizable_kpi_measurement_partner, dealgroupJson.kpi.optimizable_kpi_measurement_partner, 'optimizable kpi measurement partner ');
      });
    });

    it('Archiving created dealGroup', () => {
      const dmdealGroupRequestOptions = requestOptions({
        method: 'DELETE',
        url: `/api/v1/deal-group/${dealgroupJson.id}`,
      });

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value ');
        assert.equal(dmdealGroupResponse.body, 'Model deleted', 'messsage ');
      });
    });

    it('Unarchiving dealGroup', () => {
      const dealgroupReqBody = clone(dealgroupJson);
      const dmdealGroupRequestOptions = requestOptions({
        method: 'PUT',
        body: dealgroupReqBody,
        url: `/api/v1/deal-group/${dealgroupJson.id}/unarchive`,
      });

      cy.request(dmdealGroupRequestOptions).then((dmdealGroupResponse) => {
        cy.task('log', `deal-group is archived? : ${dmdealGroupResponse.body.is_archived}`);
        assert.equal(dmdealGroupResponse.status, 200, 'Response Status Value :');
      });
    });
  });
});
