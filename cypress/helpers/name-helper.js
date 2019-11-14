// Generates a unique name with the current timestamp and a suffix
// You should pass in the entity name like 'Bidder'
exports.generateName = (suffix) => {
  const name = `${Cypress.moment().format('YY.MM.DD_hh:mm:ss')}-Automated_${suffix}`;
  return name;
};
