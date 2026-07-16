const serverless = require('serverless-http');
const { createApp } = require('../backend/dist/main');

let cachedHandler;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  return handler(req, res);
};
