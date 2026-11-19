# API Test Framework

REST API tests for [JSONPlaceholder](https://jsonplaceholder.typicode.com) (`POST /posts`, `PUT /posts/{id}`) and [DummyJSON](https://dummyjson.com) (`POST /auth/login`, `GET /users`).

## Setup

Requires Node.js 20.11+.

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm test
npm test -- tests/dummyjson/auth.login.test.js
npm run lint
```

## Summary

The structure follows a common layout for API test frameworks that I found while researching the topic.

### Structure

- `clients/`: one class per service. Clients only wrap HTTP calls and return raw axios response.
- `fixtures/`: test data built with faker.
- `schemas/`: OpenAPI YAML schemas, one file per response.
- `utils/`: schema validation and request helpers.
- `tests/`: one file per endpoint.

Dependencies are passed through constructors.

### Decisions and tradeoffs

- **Wrong API behavior is pinned as it is.** Malformed JSON returns 500 instead of 400. If the API gets fixed, the test would fail.
- **Schemas are hardcoded and validation ignores additional fields in nested objects** Missed field fails validation, but additional field in a nested profile does not.
- **Jest runs with `--experimental-vm-modules`.** The assignment requires Jest with plain ESM impor/export and Jest supports native ESM only behind this Node flag. This keeps the code as native ESM without a Babel transform.
- **No polling via `awaitDelivery`.** I noticed this requirement only after the tests were written and chose not to rewrite them. The Part 1 endpoints respond synchronously, so the tests use plain `async`/`await`.

Defects found:
- `/auth/me` accepts a refresh token as an access token.
- `/auth/login` returns 500 when `expiresInMins` is out of range.

The tests for those defects are failing on purpose to highlight bugs


### Scaling to 100+ tests

- The suite can grow in two directions: more scenarios for the endpoints already covered, and tests for new endpoints
- Tests don't share state, so Jest can run files in parallel
