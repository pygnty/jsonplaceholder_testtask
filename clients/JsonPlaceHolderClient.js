import { config } from '../config/index.js';
import { BaseClient } from './BaseClient.js';

export class JsonPlaceHolderClient extends BaseClient {
  constructor(options = {}) {
    super({ baseURL: config.services.jsonPlaceHolder.baseUrl, ...options });
  }

  createPost(body, requestConfig = {}) {
    return this.http.post('/posts', body, requestConfig);
  }

  getPost(id, requestConfig = {}) {
    return this.http.get(`/posts/${id}`, requestConfig);
  }

  replacePost(id, body, requestConfig = {}) {
    return this.http.put(`/posts/${id}`, body, requestConfig);
  }
}
