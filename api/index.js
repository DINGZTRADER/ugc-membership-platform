// Vercel Serverless Catch-All API Handler
// All requests to /api/* are forwarded to this file by vercel.json
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const app = require('../backend/app');

module.exports = (req, res) => {
  // Trigger rebuild for deployment update
  if (req.headers['x-matched-path']) {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.url = req.headers['x-matched-path'] + reqUrl.search;
  }
  return app(req, res);
};
