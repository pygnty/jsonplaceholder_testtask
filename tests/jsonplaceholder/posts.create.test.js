import { faker } from '@faker-js/faker';
import { JsonPlaceHolderClient } from '../../clients/JsonPlaceHolderClient.js';
import { buildPost, buildPostWithCustomFields } from '../../fixtures/posts.js';
import { withRawBody } from '../../utils/requestOptions.js';
import { validateSchema } from '../../utils/schemaValidator.js';

describe('POST /posts', () => {
  const jsonPlaceHolder = new JsonPlaceHolderClient();

  test('Create post and check response', async () => {
    const post = buildPost();

    const res = await jsonPlaceHolder.createPost(post);

    const { errors } = validateSchema('create-post-response.yaml', res.data);

    expect(res.status).toBe(201);
    expect(errors).toEqual([]);
    expect(res.data).toEqual({ ...post, id: expect.any(Number) });
    expect(res.headers['content-type']).toMatch(new RegExp('application/json'));
    expect(res.headers.location).toMatch(new RegExp(`/posts/${res.data.id}$`));
  });

  test('Create post with all standard and custom fields', async () => {
    const post = buildPostWithCustomFields();

    const res = await jsonPlaceHolder.createPost(post);

    expect(res.status).toBe(201);
    expect(res.data).toEqual({ ...post, id: expect.any(Number) });
  });

  test('Create two identical posts', async () => {
    const post = buildPost();

    const [first, second] = await Promise.all([
      jsonPlaceHolder.createPost(post),
      jsonPlaceHolder.createPost(post),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.data).toEqual(first.data);
  });

  test.each([
    { case: 'empty strings', post: buildPost({ title: '', body: '' }) },
    { case: 'very long text', post: buildPost({ title: faker.string.alpha(10_000) }) },
    { case: 'non-existent userId', post: buildPost({ userId: 999_999 }) },
  ])('Create post with $case', async ({ post }) => {
    const res = await jsonPlaceHolder.createPost(post);

    expect(res.status).toBe(201);
    expect(res.data).toEqual({ ...post, id: expect.any(Number) });
  });

  test.each([
    { case: 'truncated JSON', body: '{"title": ' },
    { case: 'JSON null', body: 'null' },
  ])('Reject malformed body $case', async ({ body }) => {
    const res = await jsonPlaceHolder.createPost(body, withRawBody());

    expect(res.status).toBe(500);
  });
});
