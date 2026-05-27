/**
 * Programmatically constructs custom parameterized search queries based on active database schema definitions.
 * @param {string} tableName - Whitelisted target sheet.
 * @param {Object} filterParams - Active URL search arguments (date, client, product_name).
 * @param {Array<string>} activeColumns - Live column list extracted via information_schema discovery.
 * @returns {Object} Structured baseQueryString and sqlArguments payload arrays.
 */
const buildWorkbookSearchQuery = (tableName, filterParams, activeColumns) => {
  const { date, client, product_name } = filterParams;
  let baseQueryString = `SELECT * FROM ${tableName}`;
  let filterClauses = [];
  let sqlArguments = [];
  let argCounter = 1;

  if (date && activeColumns.includes('date')) {
    filterClauses.push(`date = $${argCounter++}`);
    sqlArguments.push(date);
  }
  if (client && activeColumns.includes('client')) {
    filterClauses.push(`client ILIKE $${argCounter++}`);
    sqlArguments.push(`%${client}%`);
  }
  if (product_name && activeColumns.includes('product_name')) {
    filterClauses.push(`product_name ILIKE $${argCounter++}`);
    sqlArguments.push(`%${product_name}%`);
  }

  if (filterClauses.length > 0) {
    baseQueryString += ` WHERE ` + filterClauses.join(" AND ");
  }

  return { baseQueryString, sqlArguments };
};

module.exports = { buildWorkbookSearchQuery };