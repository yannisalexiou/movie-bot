const mongoose = require('mongoose');
const Movies = mongoose.model('movies');

const request = require('request');

const facebookApi = require('./../bot/facebookApi');
const messageTemplate = require('./../bot/messageTemplates');

function findMovie(userId, movieTitle) {
  request("http://www.omdbapi.com/?type=movie&t=" + movieTitle + "&apikey=" + process.env.OMBD_API_KEY, function (error, response, body) {
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

module.exports = {
  findMovie,
  getMovieDetail
}
