const { sqlForPartialUpdate, sqlCompanyFilter } = require('./sql');

describe('sqlForPartialUpdate', () => {
  test('should work with one item', () => {
    const results = sqlForPartialUpdate(
      { firstName: 'feller' },
      { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
    );
    expect(results).toEqual({ setCols: '"first_name"=$1', values: ['feller'] });
  });
  test('should work with two item', () => {
    const results = sqlForPartialUpdate(
      { firstName: 'feller', lastName: 'keller' },
      { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
    );
    expect(results).toEqual({ setCols: '"first_name"=$1, "last_name"=$2', values: ['feller', 'keller'] });
  });
});

describe('sqlCompanyFilter', () => {
  test('should work with only nameLike', () => {
    const results = sqlCompanyFilter({ nameLike: 'tesla' });
    expect(results).toEqual({
      setCols: "WHERE Lower(name) LIKE '%' || Lower($1) || '%'",
      values: ['tesla'],
    });
  });

  test('should work with only nameLike, minEmployees', () => {
    const results = sqlCompanyFilter({ nameLike: 'tesla', minEmployees: '48' });
    expect(results).toEqual({
      setCols: "WHERE Lower(name) LIKE '%' || Lower($1) || '%' AND num_employees >= $2 ",
      values: ['tesla', '48'],
    });
  });

  test('should work with nameLike, minEmployees, maxEmployees', () => {
    const results = sqlCompanyFilter({ nameLike: 'tesla', minEmployees: '48', maxEmployees: '300' });
    expect(results).toEqual({
      setCols: "WHERE Lower(name) LIKE '%' || Lower($1) || '%' AND num_employees >= $2  AND num_employees <= $3",
      values: ['tesla', '48', '300'],
    });
  });

  test('should work with only minEmployees', () => {
    const results = sqlCompanyFilter({ minEmployees: '48' });
    expect(results).toEqual({
      setCols: 'WHERE num_employees >= $1 ',
      values: ['48'],
    });
  });
  test('should work with only maxEmployees', () => {
    const results = sqlCompanyFilter({ maxEmployees: '228' });
    expect(results).toEqual({
      setCols: 'WHERE num_employees <= $1',
      values: ['228'],
    });
  });
});
