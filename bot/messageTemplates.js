

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

function wentWrong() {
  var wentWrong = {
    text: "Something went wrong. Try again"
  }

  return wentWrong;
}

function movieCard(title, subtitle, imageUrl, correctPayload, incorrectPayload) {
  var movieCard = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: title,
          subtitle: subtitle,
          image_url: imageUrl,
          buttons: [{
            type: "postback",
            title: "Yes",
            payload: correctPayload
          }, {
            type: "postback",
            title: "No",
            payload: incorrectPayload
          }]
        }]
      }
    }
  };

  return movieCard;
}

module.exports = {
  badRequest,
  correctMovie,
  incorrectMovie,
  wentWrong,
  movieCard
}
