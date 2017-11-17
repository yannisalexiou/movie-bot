//An app from
//https://www.sitepoint.com/building-facebook-chat-bot-node-heroku/

const express = require('express');
const bodyParser = require('body-parser');

require('./config/config');

var {mongoose} = require('./db/mongoose');

// Load Models
require('./models/Movie');

// Load Routes
const index = require('./routes/index');
const webhook = require('./routes/webhook');

const app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

const port = process.env.PORT || 3000;

// Use Routes
app.use('/', index);
app.use('/webhook', webhook);

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
