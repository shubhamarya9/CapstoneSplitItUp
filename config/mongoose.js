const mongoose = require('mongoose');
const config = require('config');

// Connected to Mongolab sandbox server
const dbURI = config.get('mongo.url');

// Create the database connection
mongoose.Promise = global.Promise;
mongoose.connect(dbURI);

// CONNECTION EVENTS

// When successfully connected
mongoose.connection.on('connected', () => {
  /* eslint no-console: 0 */
  console.log(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

module.exports = mongoose;