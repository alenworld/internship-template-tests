require('dotenv').config();
const mongoose = require('mongoose');

const { MONGODB_URI, NODE_ENV } = process.env;

const MONGODB_DB_MAIN = NODE_ENV === 'test' ? 'users-test' : 'users';
const MONGO_URI = `${MONGODB_URI}${MONGODB_DB_MAIN}`;

const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = mongoose.createConnection(MONGO_URI, connectOptions);
