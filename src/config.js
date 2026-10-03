const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parsePort = (value) => {
  if (value === undefined || value === '') return 3000;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error('Invalid PORT configuration. Set PORT to an integer between 1 and 65535.');
  }
  return parsed;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  logLevel: process.env.LOG_LEVEL || 'info',
  serviceName: process.env.SERVICE_NAME || 'production-service',
  simulateFailure: process.env.SIMULATE_FAILURE === 'true',
};

if (!config.serviceName.trim()) {
  throw new Error('SERVICE_NAME must be set to a non-empty value.');
}

module.exports = config;
