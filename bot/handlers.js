const request = require('request');

const mongoose = require('mongoose');
const Movies = mongoose.model('movies');

const facebookApi = require('./../bot/facebookApi');
const messageTemplate = require('./../bot/messageTemplates')

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

function getMovieDetail(userId, field) {
  Movies.findOne({
    user_id: userId
  })
  .then(movie => {
    facebookApi.sendMessage(userId, {text: movie[field]});
  })
  .catch((e) => {
    facebookApi.sendMessage(userId, messageTemplate.wentWrong());
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
        Movies.findOneAndUpdate(query, update, options, function(err, mov) {
          if (err) {
            console.log("Database error: " + err);
          } else {
            var title = movieObj.Title
            var subtitle = "Is this the movie you are looking for?";
            var imageUrl = movieObj.Poster === "N/A" ? "http://placehold.it/350x150" : movieObj.Poster;
            var correctPayload = "Correct";
            var incorrectPayload = "Incorrect";
            facebookApi.sendMessage(userId, messageTemplate.movieCard(title, subtitle, imageUrl, correctPayload, incorrectPayload));
          }
        });
      } else {
          console.log(movieObj.Error);
          facebookApi.sendMessage(userId, {text: movieObj.Error});
      }
    } else {
      facebookApi.sendMessage(userId, messageTemplate.wentWrong());
    }
  });
}

module.exports = {
  handleMessage,
  handlePostback
}
