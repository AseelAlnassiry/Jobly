'use strict';

const { ExpressError } = require('../expressError');
const { sanitizeFilter } = require('./sanitizeFilter');

describe('sanitizeFilter', function () {
  test('works with no filters', function () {
    expect.assertions(1);
    const req = { query: {} };
    const res = {};
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    sanitizeFilter(req, res, next);
  });

  test('works with filters', function () {
    expect.assertions(1);
    const req = { query: { minEmployees: 300, maxEmployees: 500, nameLike: 'tesla' } };
    const res = {};
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    sanitizeFilter(req, res, next);
  });

  test('stops inapproperiate filters', function () {
    expect.assertions(1);
    const req = { query: { evilFilter: 300, maxEmployees: 500, nameLike: 'tesla' } };
    const res = {};
    const next = function (err) {
      expect(err instanceof ExpressError).toBeTruthy();
    };
    sanitizeFilter(req, res, next);
  });
});
