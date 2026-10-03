const config = require('./config');
const { startServer } = require('./app');

startServer(config.port);
