const { sqlForPartialUpdate } = require('./sql');

describe('sqlForPartialUpdate', () => {
  test('should work with one item', () => {
    const results = sqlForPartialUpdate(
      { firstName: 'feller'},
      { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
    );
    expect(results).toEqual({"setCols": "\"first_name\"=$1", "values": ["feller"]})
  });
  test('should work with two item', () => {
    const results = sqlForPartialUpdate(
      { firstName: 'feller', lastName: 'keller' },
      { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
    );
    expect(results).toEqual({"setCols": "\"first_name\"=$1, \"last_name\"=$2", "values": ["feller", "keller"]})
  });
});
