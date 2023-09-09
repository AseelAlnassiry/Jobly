const { BadRequestError } = require('../expressError');

/**
 * Name: sqlForPartialUpdate
 * Description: Partial SQL updater where selective params can be used
 * @param {field: value, field2: value2} dataToUpdate data that needs to be updated
 * @param {field: value, field2: value2} jsToSql data needed for the query to filter
 * @returns {setCols, values} update params and values array needed for query string interpolation
 * example:
 * { firstName: 'feller', lastName: 'keller' }, { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
 * => {"first_name"=$1, "last_name"=$2, [ 'feller', 'keller' ]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');
  const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);
  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
