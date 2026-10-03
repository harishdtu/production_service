const winston = require('winston');
const config = require('./config');

const isProduction = config.env === 'production';

const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: {
    service: config.serviceName,
    environment: config.env,
  },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} ${level}: ${message} ${extra}`.trim();
            }),
          ),
    }),
  ],
});

module.exports = logger;
