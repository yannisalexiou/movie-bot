const facebookApi = require('./../bot/facebookApi');
const messageTemplate = require('./../bot/messageTemplates');
const omdb = require('./../api/omdb');

function handleMessage(event) {
  //This callback will occur when a message has been sent by your page
  //e.x. the first message when user hit get start
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    // You may get a text or attachment but not both
    if (message.text) {
      var formattedMsg = message.text.toLowerCase().trim();

      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding movie detail.
      // Otherwise, search for new movie.
      switch (formattedMsg) {
        case "plot":
        case "date":
        case "runtime":
        case "director":
        case "cast":
        case "rating":
          omdb.getMovieDetail(senderId, formattedMsg);
          break;

        default:
          omdb.findMovie(senderId, formattedMsg);
      }
    } else if (message.attachments) {
      facebookApi.sendMessage(senderId, messageTemplate.badRequest());
    }
  }
}

function handlePostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    facebookApi.getStarted(senderId);
  }  else if (payload === "Correct") {
    facebookApi.sendMessage(senderId, messageTemplate.correctMovie());
  } else if (payload === "Incorrect") {
    facebookApi.sendMessage(senderId, messageTemplate.incorrectMovie());
  }
}

module.exports = {
  handleMessage,
  handlePostback
}
