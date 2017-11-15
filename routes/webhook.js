const express = require('express');
const router = express.Router();

//handler functions
const facebookApi = require('./../api/facebook');

// Facebook Webhook
// Used for verification
router.get('/', (req, res) => {

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// All callbacks for Messenger will be POST-ed here
router.post('/', (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {

    // Iterate over each entry
    // There may be multiple entries if batched
    body.entry.forEach(function(entry) {

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {

        if (event.message) {
          console.log("message event");
        }
        if (event.postback) {
          console.log("postback event");
          facebookApi.handlePostback(event);
        }
      });
    });

    res.sendStatus(200);
  }
});


module.exports = router;
