import _ from 'lodash';
import { DummyJsonClient } from '../../clients/DummyJsonClient.js';
import { buildInvalidCredentials, buildUnknownUserCredentials, validCredentials } from '../../fixtures/credentials.js';
import { decodeJwtPayload } from '../../utils/jwt.js';
import { withBearer } from '../../utils/requestOptions.js';
import { validateSchema } from '../../utils/schemaValidator.js';

const MAX_TOKEN_LIFETIME_MINS = 43_200;

describe('POST /auth/login', () => {
  const dummyJson = new DummyJsonClient();

  test('Login with valid credentials and check response', async () => {
    const credentials = validCredentials();

    const res = await dummyJson.auth.login(credentials);

    const { errors } = validateSchema('login-response.yaml', res.data);
    const tokenPayload = decodeJwtPayload(res.data.accessToken);

    expect(res.status).toBe(200);
    expect(errors).toEqual([]);
    expect(res.data.username).toBe(credentials.username);
    expect(tokenPayload).toMatchObject({ id: res.data.id, username: res.data.username });
  });

  test.each([1, MAX_TOKEN_LIFETIME_MINS])('Login with token lifetime %i minutes', async (expiresInMins) => {
    const res = await dummyJson.auth.login({ ...validCredentials(), expiresInMins });

    const { iat, exp } = decodeJwtPayload(res.data.accessToken);

    expect(res.status).toBe(200);
    expect(exp - iat).toBe(expiresInMins * 60);
  });

  test.each([
    { case: 'negative', expiresInMins: -5 },
    { case: 'above maximum', expiresInMins: MAX_TOKEN_LIFETIME_MINS + 1 },
    { case: 'not a number', expiresInMins: 'abc' },
  ])('Reject login with $case token lifetime', async ({ expiresInMins }) => {
    const res = await dummyJson.auth.login({ ...validCredentials(), expiresInMins });

    expect(res.status).toBe(400);
  });

  test('Login twice and use both sessions', async () => {
    const { data: firstSession } = await dummyJson.auth.login(validCredentials());
    const { data: secondSession } = await dummyJson.auth.login(validCredentials());

    const [first, second] = await Promise.all([
      dummyJson.auth.me(withBearer(firstSession.accessToken)),
      dummyJson.auth.me(withBearer(secondSession.accessToken)),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.data.id).toBe(first.data.id);
  });

  test('Login, refresh session and use new access token', async () => {
    const { data: session } = await dummyJson.auth.login(validCredentials());

    const refreshed = await dummyJson.auth.refresh({ refreshToken: session.refreshToken });
    const me = await dummyJson.auth.me(withBearer(refreshed.data.accessToken));

    expect(refreshed.status).toBe(200);
    expect(me.status).toBe(200);
    expect(me.data).toMatchObject({ id: session.id, username: session.username });
  });

  test('Reject refresh token used as access token', async () => {
    const { data: session } = await dummyJson.auth.login(validCredentials());

    const res = await dummyJson.auth.me(withBearer(session.refreshToken));

    expect(res.status).toBe(401);
  });

  test.each([
    { case: 'wrong password', body: buildInvalidCredentials(), message: 'Invalid credentials' },
    { case: 'unknown user', body: buildUnknownUserCredentials(), message: 'Invalid credentials' },
    { case: 'missing username', body: _.omit(validCredentials(), 'username'), message: 'Username and password required' },
    { case: 'missing password', body: _.omit(validCredentials(), 'password'), message: 'Username and password required' },
    { case: 'empty strings', body: { username: '', password: '' }, message: 'Username and password required' },
    { case: 'non-string username', body: { username: 123, password: 'secret' }, message: 'Username is not valid' },
  ])('Reject login with $case', async ({ body, message }) => {
    const res = await dummyJson.auth.login(body);

    const { errors } = validateSchema('error-response.yaml', res.data);

    expect(res.status).toBe(400);
    expect(errors).toEqual([]);
    expect(res.data.message).toBe(message);
  });
});
