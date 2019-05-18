// Bring Mongoose into the app 
var mongoose = module.exports = require('mongoose');

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

// Build the connection string 
var dbURI = process.env.DB_URI;

// Create the database connection 
mongoose.connect(dbURI, { useNewUrlParser: true });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
   console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
   console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
   console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function () {
   mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
      throw new Error(0)
   });
}); 
