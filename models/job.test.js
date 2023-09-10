'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError.js');

const Job = require('./job.js');

const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds } = require('./_testCommon.js');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe('create', () => {
  const newJob = {
    title: 'TestMCTest',
    companyHandle: 'c2',
    salary: 500000,
    equity: '0.59',
  };
  test('should work', async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual({ ...newJob, id: expect.any(Number) });
  });
});

/************************************** findAll */
describe('findAll', () => {
  test('should work with no filter', async () => {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j1',
        salary: 57000,
        equity: '0.3',
        companyHandle: 'c1',
      },
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 120000,
        equity: '0.02',
        companyHandle: 'c1',
      },
      {
        id: expect.any(Number),
        title: 'j3',
        salary: 50,
        equity: '0',
        companyHandle: 'c1',
      },
      {
        id: expect.any(Number),
        title: 'j4',
        salary: null,
        equity: null,
        companyHandle: 'c1',
      },
    ]);
  });

  test('should work with title', async () => {
    let jobs = await Job.findAll({ title: 'j1' });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j1',
        salary: 57000,
        equity: '0.3',
        companyHandle: 'c1',
      },
    ]);
  });

  test('should work with minSalary', async () => {
    let jobs = await Job.findAll({ minSalary: 100000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 120000,
        equity: '0.02',
        companyHandle: 'c1',
      },
    ]);
  });

  test('should work with equity', async () => {
    let jobs = await Job.findAll({ equity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j1',
        salary: 57000,
        equity: '0.3',
        companyHandle: 'c1',
      },
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 120000,
        equity: '0.02',
        companyHandle: 'c1',
      },
    ]);
  });

  test('works with minSalary & equity', async () => {
    let jobs = await Job.findAll({ minSalary: 10, equity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j1',
        salary: 57000,
        equity: '0.3',
        companyHandle: 'c1',
      },
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 120000,
        equity: '0.02',
        companyHandle: 'c1',
      },
    ]);
  });

  test('works with minSalary & equity & title', async () => {
    let jobs = await Job.findAll({ title: '2', minSalary: 10, equity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j2',
        salary: 120000,
        equity: '0.02',
        companyHandle: 'c1',
      },
    ]);
  });
});

/************************************** get */

describe('get', function () {
  test('works', async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: expect.any(Number),
      title: 'j1',
      salary: 57000,
      equity: '0.3',
      companyHandle: 'c1',
    });
  });

  test('not found if no such job', async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe('update', () => {
  let updateData = {
    title: 'testdouble',
    salary: 30000000,
    equity: '0.5',
  };
  test('works', async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: 'c1',
      ...updateData,
    });
  });

  test('not found if no such job', async () => {
    try {
      await Job.update(0, {
        title: 'test',
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('bad request with no data', async () => {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', () => {
  test('works', async () => {
    await Job.remove(testJobIds[0]);
    const res = await db.query('SELECT id FROM jobs WHERE id=$1', [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test('not found if no such job', async () => {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
