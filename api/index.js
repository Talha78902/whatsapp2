require('reflect-metadata');
const serverless = require('serverless-http');
const { createApp } = require('../backend/dist/main');

let cachedHandler;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = serverless(app.getHttpAdapter().getInstance());
  }
  return cachedHandler(req, res);
};
