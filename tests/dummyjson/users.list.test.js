import { DummyJsonClient } from '../../clients/DummyJsonClient.js';
import { validateSchema } from '../../utils/schemaValidator.js';

const DEFAULT_PAGE_SIZE = 30;
const INVALID_LIMIT = "Invalid 'limit' - should be a positive number";
const INVALID_SKIP = "Invalid 'skip' - should be a positive number";
const INVALID_ORDER = "Invalid 'order' - should be either 'asc' or 'desc'";

describe('GET /users', () => {
  const dummyJson = new DummyJsonClient();
  let totalUsers;

  beforeAll(async () => {
    const res = await dummyJson.users.getUsers({ limit: 1, select: 'id' });
    totalUsers = res.data.total;
  });

  test('Get users with default pagination and check response', async () => {
    const res = await dummyJson.users.getUsers();

    const { errors } = validateSchema('users-list-response.yaml', res.data);

    expect(res.status).toBe(200);
    expect(errors).toEqual([]);
    expect(res.data).toMatchObject({ skip: 0, limit: DEFAULT_PAGE_SIZE, total: totalUsers });
    expect(res.data.users).toHaveLength(DEFAULT_PAGE_SIZE);
  });

  test('Get users with all query options combined', async () => {
    const query = { sortBy: 'lastName', order: 'asc', select: 'lastName,age' };
    const page = { limit: 5, skip: 10 };

    const { data: all } = await dummyJson.users.getUsers({ ...query, limit: 0 });
    const res = await dummyJson.users.getUsers({ ...query, ...page });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(page);
    expect(res.data.users).toEqual(all.users.slice(page.skip, page.skip + page.limit));
    for (const user of res.data.users) {
      expect(Object.keys(user).sort()).toEqual(['age', 'id', 'lastName']);
    }
  });

  test('Check all peges for gaps or duplicates', async () => {
    const pageSize = 50;
    const ids = [];

    for (let skip = 0; skip < totalUsers; skip += pageSize) {
      const res = await dummyJson.users.getUsers({ limit: pageSize, skip, select: 'id' });

      expect(res.status).toBe(200);

      for (const user of res.data.users) {
        ids.push(user.id);
      }
    }

    expect(ids).toHaveLength(totalUsers);
    expect(new Set(ids).size).toBe(totalUsers);
  });

  test.each([
    { case: 'last partial page', fromEnd: 3, limit: 10, expectedCount: 3 },
    { case: 'skip equal to total', fromEnd: 0, limit: 10, expectedCount: 0 },
  ])('Get users at pagination boundary: $case', async ({ fromEnd, limit, expectedCount }) => {
    const res = await dummyJson.users.getUsers({ limit, skip: totalUsers - fromEnd, select: 'id' });

    expect(res.status).toBe(200);
    expect(res.data.users).toHaveLength(expectedCount);
    expect(res.data.total).toBe(totalUsers);
  });

  test.each([
    [{ limit: -1 }, INVALID_LIMIT],
    [{ limit: 'abc' }, INVALID_LIMIT],
    [{ skip: -1 }, INVALID_SKIP],
    [{ sortBy: 'age', order: 'up' }, INVALID_ORDER],
  ])('Reject invalid query %o', async (params, message) => {
    const res = await dummyJson.users.getUsers(params);

    const { errors } = validateSchema('error-response.yaml', res.data);

    expect(res.status).toBe(400);
    expect(errors).toEqual([]);
    expect(res.data.message).toBe(message);
  });
});
