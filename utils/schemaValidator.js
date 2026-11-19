import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { load as loadYaml } from 'js-yaml';

const SCHEMAS_DIR = path.join(import.meta.dirname, '../schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const cache = new Map();

export const loadSchema = (name) => {
  if (!cache.has(name)) {
    const file = path.join(SCHEMAS_DIR, name);
    const schema = loadYaml(fs.readFileSync(file, 'utf8'));
    cache.set(name, ajv.compile(schema));
  }
  return cache.get(name);
};

export const validateSchema = (name, data) => {
  const validate = loadSchema(name);
  const valid = validate(data);
  return { valid, errors: valid ? [] : validate.errors };
};
