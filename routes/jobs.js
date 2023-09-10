'use strict';

const express = require('express');
const { BadRequestError, ExpressError } = require('../expressError');
const { ensureAdmin } = require('../middleware/auth');
const { sanitizeJobsFilter } = require('../middleware/sanitizeFilter');
const Job = require('../models/job');

const router = express.Router();

/** POST / { job } => { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post('/', ensureAdmin, async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(new ExpressError('bad request', 400));
  }
});

/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - equity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get('/', sanitizeJobsFilter, async (req, res, next) => {
  try {
    const q = req.query;
    if (q.minSalary) q.minSalary = Number(q.minSalary);
    if (q.equity && Boolean(q.equity) !== true) delete q.equity;
    const jobs = await Job.findAll(q);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[jobId] => { job }
 *
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch('/:id', ensureAdmin, async (req, res, next) => {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(new ExpressError('bad request', 400));
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete('/:id', ensureAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
