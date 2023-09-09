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

/**
 * Name: sqlCompanyFilter
 * description: Sql filter creater for injecting into company sql queries
 * @param {object} filters query received from the router
 * @returns {setCols, values} WHERE clause params and an array of values required for the sql filter
 * example:
 * { minEmployees: '300', maxEmployees: '700', nameLike: 'an' }
 * => {
 *      setCols: "WHEREnum_employees >= $1  AND num_employees <= $2 AND Lower(name) LIKE '%' || Lower($3) || '%'",
 *      values: [ '300', '700', 'an' ]
 *    }
 */
function sqlCompanyFilter(filters) {
  console.log(filters);
  const keys = Object.keys(filters);
  const values = Object.values(filters);
  if (keys.length === 0) throw new BadRequestError('No filter');
  if (
    filters['minEmployees'] &&
    filters['maxEmployees'] &&
    Number(filters['minEmployees']) >= Number(filters['maxEmployees'])
  ) {
    console.log(filters['minEmployees']);
    throw new BadRequestError('Filter minEmployees > maxEmployees');
  }
  const cols = keys.map((filter, idx) => {
    // case insensitive name search search
    if (filter === 'nameLike') return `Lower(name) LIKE '%' || Lower($${idx + 1}) || '%'`; 
    // min employees search
    else if (filter === 'minEmployees') return `num_employees >= $${idx + 1} `;
    // max employees search
    else return `num_employees <= $${idx + 1}`;
  });
  return {
    setCols: 'WHERE ' + cols.join(' AND '),
    values,
  };
}

module.exports = { sqlForPartialUpdate, sqlCompanyFilter };
