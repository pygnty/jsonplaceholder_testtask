import _ from 'lodash';
import { JsonPlaceHolderClient } from '../../clients/JsonPlaceHolderClient.js';
import { buildPost, buildPostWithCustomFields } from '../../fixtures/posts.js';
import { validateSchema } from '../../utils/schemaValidator.js';

const FIRST_POST_ID = 1;
const LAST_POST_ID = 100;

describe('PUT /posts/{id}', () => {
  const jsonPlaceHolder = new JsonPlaceHolderClient();

  test.each([FIRST_POST_ID, LAST_POST_ID])('Replace post %i and check response', async (id) => {
    const post = buildPost();

    const res = await jsonPlaceHolder.replacePost(id, post);

    const { errors } = validateSchema('create-post-response.yaml', res.data);

    expect(res.status).toBe(200);
    expect(errors).toEqual([]);
    expect(res.data).toEqual({ ...post, id });
  });

  test('Replace post with partial body drops omitted fields', async () => {
    const { data: original } = await jsonPlaceHolder.getPost(FIRST_POST_ID);
    const partialPost = _.pick(buildPost(), ['title']);

    const res = await jsonPlaceHolder.replacePost(FIRST_POST_ID, partialPost);

    expect(original).toHaveProperty('body');
    expect(original).toHaveProperty('userId');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ...partialPost, id: FIRST_POST_ID });
  });

  test('Replace same post twice with identical body', async () => {
    const post = buildPostWithCustomFields();

    const first = await jsonPlaceHolder.replacePost(FIRST_POST_ID, post);
    const second = await jsonPlaceHolder.replacePost(FIRST_POST_ID, post);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.data).toEqual(first.data);
  });

  test('Replace post keeps id from path when body contains another id', async () => {
    const post = buildPost({ id: LAST_POST_ID });

    const res = await jsonPlaceHolder.replacePost(FIRST_POST_ID, post);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ...post, id: FIRST_POST_ID });
  });

  test.each([0, -1, LAST_POST_ID + 1, 9999, 'abc'])('Reject replacing non-existent post %p', async (id) => {
    const res = await jsonPlaceHolder.replacePost(id, buildPost());

    expect(res.status).toBe(404);
  });
});
