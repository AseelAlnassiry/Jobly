'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, sqlJobFilter } = require('../helpers/sql');

class Job {
  /**
   * Creates a new job
   * @param {title, salary, equity, companyHandle} required parameters for a new job
   * @returns {id, title, salary, equity, companyHandle} new job created
   */
  static async create({ title, salary, equity, companyHandle }) {
    const results = await db.query(
      `
        INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"
      `,
      [title, salary, equity, companyHandle]
    );

    const job = results.rows[0];
    return job;
  }

  /**
   * Find jobs based with optional filters
   * - minSalary
   * - equity (true returns only jobs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   * @param {title: value, minSalary: value2, equity: true/false} filters optional filters to be taken to sqlJobFilter
   * @returns {Promise<[{id, title, salary, equity, companyHandle}]>} job search results array
   */
  static async findAll(filters) {
    let jobsRes;
    if (filters && Object.keys(filters).length > 0) {
      const { setCols, values } = sqlJobFilter(filters);
      jobsRes = await db.query(
        `
          SELECT id, title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
          ${setCols}
        `,
        values
      );
    } else {
      jobsRes = await db.query(
        `
          SELECT id ,title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
        `
      );
    }
    return jobsRes.rows;
  }

  /**
   * Find job based on id
   * @param {id} required id for job search
   * @returns {id, title, salary, equity, companyHandle} job search result
   * if no job is found, a NotFoundError is raised
   */
  static async get(id) {
    const jobRes = await db.query(
      `
        SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1
      `,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /**
   * Updates job from id, data based on optional parameters
   * @param {id} id required for the update
   * @param { title: value1, salary: value2, equity: value3 } data to be updated, sent to sqlForPartialUpdate
   * @returns { id, title, salary, equity, companyHandle } 
   * if no job is found, a NotFoundError is raised
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = '$' + (values.length + 1);
    const querySql = `
      UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id, title, salary, equity, company_handle AS "companyHandle"
    `;
    const jobRes = await db.query(querySql, [...values, id]);
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /**
   * Removes job based on id
   * @param {id} id required for the removal
   * @returns {} no return
   * if no job is found, a NotFoundError is raised
   */
  static async remove(id) {
    const jobRes = await db.query(
      `
        DELETE FROM jobs
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
