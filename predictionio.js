// JavaScript library for interacting with the PredictionIO API.
// Author: Qui Nguyen

// Returns a PredictionIO API client object for an app.
//
// Takes the app_key, and an optional JSON object with options.
// Current options available:
// - host: the address of the API server.
var predictionio = function (app_key, options) {

  var pub = {},
    APP_KEY,
    HOST = '',
    USERS_ENDPOINT = 'users';

  if (!app_key) {
      throw new Error('An app key is required to use the API.');
  }
  APP_KEY = app_key;
  if ( (typeof options !== 'undefined') && (typeof options.host !== 'undefined') ) {
    HOST = options.host;
  }

  // Makes an AJAX request to the specified endpoint, with the given method and data,
  // and then calls the callback on the server's response.
  var make_request = function (endpoint, method, data, callback) {
    // TODO
    return true;
  };

  // Adds a user, specified by the user_info JSON object, then calls the callback
  // function on the server's response.
  pub.add_user = function (user_info, callback) {
    if (typeof user_info.pio_uid === 'undefined') {
      throw new Error('To add a user, you must specify the user\'s pio_uid.');
      // pio_uid cannot contain \t or ,. How much error checking to do?
    }

    // Check the user_info for illegal keys, etc?
    make_request(USERS_ENDPOINT.concat('.json'), 'POST', user_info, callback);
  }

  // Gets a user.
  pub.get_user = function(pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'GET', callback);
  }

  // Deletes a user.
  pub.delete_user = function(pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'DELETE', callback);
  }

  return pub;
}
