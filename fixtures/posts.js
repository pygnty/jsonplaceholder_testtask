import { faker } from '@faker-js/faker';

export const buildPost = (overrides = {}) => ({
  userId: faker.number.int({ min: 1, max: 10 }),
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(2),
  ...overrides,
});

export const buildPostWithCustomFields = () =>
  buildPost({
    tags: faker.helpers.multiple(() => faker.word.noun(), { count: 3 }),
    meta: { draft: faker.datatype.boolean(), views: faker.number.int({ max: 1000 }) },
  });
