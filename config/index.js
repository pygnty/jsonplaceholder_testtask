import 'dotenv/config';

export const config = {
  services: {
    jsonPlaceHolder: { baseUrl: process.env.JSON_PLACE_HOLDER_BASE_URL || 'https://jsonplaceholder.typicode.com' },
    dummyJson: { baseUrl: process.env.DUMMY_JSON_BASE_URL || 'https://dummyjson.com' },
  },
  credentials: {
    dummyJson: {
      username: process.env.DUMMY_JSON_USERNAME,
      password: process.env.DUMMY_JSON_PASSWORD,
      expiresInMins: Number(process.env.DUMMY_JSON_EXPIRES_IN_MINS) || 30,
    },
  },
  http: { timeout: Number(process.env.HTTP_TIMEOUT) || 15000 },
};
