const request = require('request');

const mongoose = require('mongoose');
const Movies = mongoose.model('movies');

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
          getMovieDetail(senderId, formattedMsg);
          break;

        default:
          findMovie(senderId, formattedMsg);
      }
    } else if (message.attachments) {
      sendMessage(senderId, {text: "Sorry, I don't understand your request."});
    }
  }
}

function handlePostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hi " + name + ". ";
      }
      var message = greeting + "My name is Première. I can tell you various details regarding movies. What movie would you like to know about? 🧐";
      var response = {text: message}
      callSendAPI(senderId, response);
    });
  }  else if (payload === "Correct") {
    sendMessage(senderId, {text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."});
  } else if (payload === "Incorrect") {
    sendMessage(senderId, {text: "Oops! Sorry about that. Try using the exact title of the movie"});
  }
}

function callSendAPI(senderPsid, response) {
  console.log('callSendAPI');

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
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function getMovieDetail(userId, field) {
  Movies.findOne({
    user_id: userId
  })
  .then(movie => {
    callSendAPI(userId, {text: movie[field]});
  })
  .catch((e) => {
    callSendAPI(userId, {text: "Something went wrong. Try again"});
  })
}

function findMovie(userId, movieTitle) {
  request("http://www.omdbapi.com/?type=movie&t=" + movieTitle + "&apikey=6deb93e6", function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var movieObj = JSON.parse(body);
      if (movieObj.Response === "True") {
        var query = {user_id: userId};
        var update = {
          user_id: userId,
          title: movieObj.Title,
          plot: movieObj.Plot,
          date: movieObj.Released,
          runtime: movieObj.Runtime,
          director: movieObj.Director,
          cast: movieObj.Actors,
          rating: movieObj.imdbRating,
          poster_url:movieObj.Poster
        };
        var options = {upsert: true};
        Movie.findOneAndUpdate(query, update, options, function(err, mov) {
          if (err) {
            console.log("Database error: " + err);
          } else {
            message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                    title: movieObj.Title,
                    subtitle: "Is this the movie you are looking for?",
                    image_url: movieObj.Poster === "N/A" ? "http://placehold.it/350x150" : movieObj.Poster,
                    buttons: [{
                      type: "postback",
                      title: "Yes",
                      payload: "Correct"
                    }, {
                      type: "postback",
                      title: "No",
                      payload: "Incorrect"
                    }]
                  }]
                }
              }
            };
            callSendAPI(userId, message);
          }
        });
      } else {
          console.log(movieObj.Error);
          callSendAPI(userId, {text: movieObj.Error});
      }
    } else {
      callSendAPI(userId, {text: "Something went wrong. Try again."});
    }
  });
}

module.exports = {
  handleMessage,
  handlePostback,
  callSendAPI
}
