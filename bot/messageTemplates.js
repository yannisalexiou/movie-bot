

function badRequest() {
  var badRequest = {
    text: "Sorry, I don't understand your request."
  }

  return badRequest;
}

function correctMovie() {
  var correctMovie = {
    text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."
  }

  return correctMovie;
}

function incorrectMovie() {
  var incorrectMovie = {
    text: "Oops! Sorry about that. Try using the exact title of the movie"
  }

  return incorrectMovie;
}

module.exports = {
  badRequest,
  correctMovie,
  incorrectMovie
}
