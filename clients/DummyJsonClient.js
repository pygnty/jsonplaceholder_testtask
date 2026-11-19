import { config } from '../config/index.js';
import { BaseClient } from './BaseClient.js';

class DummyJsonAuth {
  constructor(http) {
    this.http = http;
  }

  login(body, requestConfig = {}) {
    return this.http.post('/auth/login', body, requestConfig);
  }

  me(requestConfig = {}) {
    return this.http.get('/auth/me', requestConfig);
  }

  refresh(body, requestConfig = {}) {
    return this.http.post('/auth/refresh', body, requestConfig);
  }
}

class DummyJsonUsers {
  constructor(http) {
    this.http = http;
  }

  getUsers(params = {}, requestConfig = {}) {
    return this.http.get('/users', { params, ...requestConfig });
  }
}

export class DummyJsonClient extends BaseClient {
  constructor(options = {}) {
    super({ baseURL: config.services.dummyJson.baseUrl, ...options });
    this.auth = new DummyJsonAuth(this.http);
    this.users = new DummyJsonUsers(this.http);
  }
}
