const mongoose = require('mongoose');

// Map global promises
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

module.exports = {mongoose}; 
