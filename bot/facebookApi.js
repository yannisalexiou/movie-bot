const request = require('request');

function sendMessage(senderPsid, response) {
  console.log('sendMessage');

  // Construct the message body
  let requestBody = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": requestBody
  }, (err, res, body) => {
    if (!err) {
      return true;
    } else {
      return err;
    }
  });
}

function getUserName(senderId) {
  // Get user's first name from the User Profile API
  // and include it in the greeting
  request({
    url: "https://graph.facebook.com/v2.6/" + senderId,
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, function(err, res, body) {
    var greeting = "";
    if (!err) {
      var bodyObj = JSON.parse(body);
      name = bodyObj.first_name;
      return name;
    } else {
      console.log(".::getUserName::. Error geting User Name: " + err);
      return false;
    }
  });
}

module.exports = {
  sendMessage,
  getUserName
}
