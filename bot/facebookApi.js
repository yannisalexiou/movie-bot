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
    if (!err) {
      var bodyObj = JSON.parse(body);
      name = bodyObj.first_name;
      var greeting = "Hi " + name + ". ";
      var message = greeting + "My name is Première. I can tell you various details regarding movies. What movie would you like to know about? 🧐";
      var response = {text: message}
      sendMessage(senderId, response);
    } else {
      console.log(".::getUserName::. Error geting User Name: " + err);
      var greeting = "Hello Stranger. ";
      var message = greeting + "My name is Première. I can tell you various details regarding movies. What movie would you like to know about? 🧐";
      var response = {text: message}
      sendMessage(senderId, response);
    }
  });
}

module.exports = {
  sendMessage,
  getUserName
}
