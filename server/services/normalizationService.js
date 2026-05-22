const pool = require('../config/db');

const normalizeValue = async (tableName, extractedValue) => {
  if (!extractedValue) return null;

  const query = `
    SELECT our_name
    FROM ${tableName}
    WHERE LOWER(customer_name) = LOWER($1)
    LIMIT 1
  `;

  const result = await pool.query(query, [extractedValue]);

  if (result.rows.length > 0) {
    return result.rows[0].our_name;
  }

  return extractedValue;
};

module.exports = {
  normalizeValue,
};