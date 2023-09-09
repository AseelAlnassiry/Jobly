const { ExpressError } = require('../expressError');

/**
 * name: sanitizedFilter
 * description: Middleware that ensures only approperiate filters are used
 * @param {request} req incoming request
 * @param {response} res outgoing response, not used
 * @param {next function} next next function down the middleware stack
 * @returns next: continues to the next middleware if no issue with the filters, otherwise raises an unauthorized error
 */
function sanitizeFilter(req, res, next) {
  try {
    const acceptable = new Set(['minEmployees', 'maxEmployees', 'nameLike']);
    const filters = Object.keys(req.query);
    for (let filter of filters) {
      if (!acceptable.has(filter)) throw new ExpressError('Inapproperiate Filter', 401);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { sanitizeFilter };
