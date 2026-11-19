import { faker } from '@faker-js/faker';
import { config } from '../config/index.js';

export const validCredentials = () => {
  const { username, password, expiresInMins } = config.credentials.dummyJson;
  if (!username || !password) {
    throw new Error('DUMMY_JSON_USERNAME and DUMMY_JSON_PASSWORD should be set in .env');
  }
  return { username, password, expiresInMins };
};

export const buildInvalidCredentials = () => ({
  ...validCredentials(),
  password: faker.internet.password({ length: 16 }),
});

export const buildUnknownUserCredentials = () => ({
  username: `unknown_${faker.string.alphanumeric(12)}`,
  password: faker.internet.password({ length: 16 }),
});
