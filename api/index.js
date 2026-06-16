// Vercel Serverless Catch-All API Handler
// All requests to /api/* are forwarded to this file by vercel.json
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const app = require('../backend/app');

module.exports = app;
