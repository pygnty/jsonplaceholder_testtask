import axios from 'axios';
import { config } from '../config/index.js';

export class BaseClient {
  constructor({ baseURL, headers = {}, timeout = config.http.timeout } = {}) {
    this.http = axios.create({
      baseURL,
      timeout,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
      validateStatus: () => true,
    });
  }
}
