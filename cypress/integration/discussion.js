const { login } = require('../../helpers/login-helper');
const nameHelper = require('../../helpers/name-helper');

context('Discussions UI', () => {
  describe('Creating/ updating discussions - UI', () => {
    let userSessionToken;
    let dealGroupId;

    before(async () => {
      userSessionToken = await login('kargoqa@gmail.com', 'K@rgo123!');
    });

    beforeEach(() => {
      cy.setCookie('kauth_access', userSessionToken);
    });
    const discussion = {};

    it('Creating a discussion', () => {
      const recentlyCreatedDealGroup = Cypress.moment().format('YY.MM.DD');
      discussion.discussionTitle = nameHelper.generateName('discussion_created');
      discussion.paragraph = 'Paragraph testing';

      cy.server();
      cy.route(`/api/v1/deal-group?limit=25&page=1&search=${recentlyCreatedDealGroup}&is_archived=false&exclude_tests=true&by_user=false`).as('searchAPI');
      cy.route('/api/v1/deal-group/*?with=deals.dealBuyer.bidder,kpi,siteList.siteListProperty,dealGroupBuyer.bidder,dealGroupBuyer.seat,dealGroupAdvertiser&with_detail=true').as('dealgroupInfo');
      cy.route('/api/v1/km-proxy/open-discussions?with=comments,participants&reference_id=*').as('discussions');
      cy.route('/api/v1/km-proxy/advertisers?limit=5000&is_active=true&sort=name&ids=60').as('advertiser');
      cy.route('/api/v1/deal?page=1&limit=25&is_archived=false&exclude_tests=false&with=dealGroup&deal_group_id=*').as('dealInfo');

      cy.visit('');
      cy.get('[placeholder="Search"]', { timeout: 8000 }).type(recentlyCreatedDealGroup).wait('@searchAPI');
      cy.get('[data-qa="deal-group-dashboard--select-deal-group"]', { timeout: 8000 }).first().click().wait(3000);
      cy.url().should('include', 'deal-dashboard/deal-groups');
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupId = urlPathName.split('/').pop();
      });

      cy.get('[data-qa="deal-group-detail--deal_group_discussion"]').click()
        .wait('@dealgroupInfo')
        .wait('@discussions')
        .wait('@dealInfo');

      cy.get('[data-qa="discussion-add--create"]').click().wait(1000);
      cy.get('[data-qa="discussion-add--name"]').type(discussion.discussionTitle);
      cy.get('div.ck.ck-editor__main div').type(discussion.paragraph);
      cy.get('add-discussion discussion-participants div:nth-child(1) > div > div').click();
      cy.get('add-discussion discussion-participants div.tags.input-wrapper--typeahead div:nth-child(2) div div').click();
      cy.get('add-discussion button-group > button.button.button--primary').click()
        .wait('@discussions')
        .wait('@dealgroupInfo')
        .wait('@dealInfo');
    });

    it('verfiy the discussion', () => {
      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupId = urlPathName.split('/').pop();
      });
      cy.log(dealGroupId);
      cy.get('discussion-dashboard data-row div h3').first().click();

      cy.get('discussion-detail header h3').should('contain', discussion.discussionTitle);
      cy.get('discussion-detail div:nth-child(1) p2 p').should('contain', discussion.paragraph);
    });

    it('Updating a discussion', () => {
      discussion.participant = 'Akarsh Gupta';
      discussion.paragraphUpdated = 'Paragraph testing Updated';
      discussion.comment = nameHelper.generateName('comment-testing');

      cy.get('discussion-detail discussion-participants input').type(discussion.participant).first().type('{enter}');
      cy.get('discussion-detail div.header-row.u-flex.u-spaceBetweenX button').click();
      cy.get('discussion-editor div.ck.ck-editor__main div').clear().type(discussion.paragraphUpdated);
      cy.get('discussion-dashboard > discussion-detail discussion-editor button.button.button--primary.button--small').click();
      cy.get('[data-qa="discussion-comment--create"]').click();
      cy.get('discussion-detail add-edit-comment div.ck.ck-editor__main div').type(discussion.comment);
      cy.get('[data-qa="discussion-comment--create"]').click();
    });

    it('verfiy a discussion after editing mode', () => {
      cy.get('discussion-detail header h3').should('contain', discussion.discussionTitle);
      cy.get('discussion-detail div:nth-child(1) p2 p').should('contain', discussion.paragraphUpdated);

      cy.location().then((currentLocation) => {
        const urlPathName = currentLocation.pathname;
        dealGroupId = urlPathName.split('/').pop();
      });
      cy.log(dealGroupId);
    });

    it('Deleting a discussion', () => {
      cy.get('discussion-detail header button').click();
      cy.get('discussion-detail > message-modal > div > div.modal-dialog.message-modal div div.modal-footer.button-group button.button.button--primary').click({ force: true });
    });

    it('Verifying deleting discussion', () => {
      cy.server();
      cy.route('/api/v1/km-proxy/open-discussions?with=comments,participants&reference_id=*').as('discussion-list');
      cy.route('/api/v1/km-proxy/users?company_type_id=71422&limit=9999&page=1&sort=name&sort_direction=ASC&with=groups&deleted_users=true').as('deal-group');
      cy.get('discussion-dashboard search-bar div input').type(discussion.discussionTitle)
        .wait('@deal-group')
        .wait('@discussion-list');
      cy.get('discussion-dashboard div div h2').should('contain', 'No Results Found');
    });
  });
});
