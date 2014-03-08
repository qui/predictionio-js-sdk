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
    HOST = 'http://localhost:8000/',
    USERS_ENDPOINT = 'users',
    ITEMS_ENDPOINT = 'items',
    ACTIONS_ENDPOINT = 'actions',
    ITEMREC_ENDPOINT = 'engines/itemrec',
    ITEMSIM_ENDPOINT = 'engines/itemsim';

  if (!app_key) {
      throw new Error('An app key is required to use the API.');
  }
  APP_KEY = app_key;
  if ( (typeof options !== 'undefined') && (typeof options.host !== 'undefined') ) {
    HOST = options.host; // Check if their provided host ends in a slash
  }

  // Makes an AJAX request to the specified endpoint, with the given method and data,
  // and then calls the callback on the server's response.
  var make_request = function (url, method, data, callback) {

    var encode_data = function (obj) {
      var str = [];
      for(var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      str.push("pio_appkey=" + APP_KEY);
      return str.join("&");
    };

    var request = new XMLHttpRequest();

    if (typeof callback !== 'undefined') {
      request.onreadystatechange = function () {
        if(request.readyState == 4 && Math.floor(request.status/100) == 2) {
          var response_obj = JSON.parse(request.responseText);
          callback(response_obj);
        }
        // Better way to check for success?
      };
    };

    if (method === "GET" || method === "DELETE") {
      var final_url = HOST.concat(url, "?", encode_data(data));
      request.open(method, final_url);
      request.send();
    }
    else if (method === "POST" || method === "PUT") {
      request.open(method, HOST.concat(url));
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      request.send(encode_data(data));
    }
    else {
      throw new Error("Invalid HTTP method: ".concat(method));
    }
  };

  // Helper function that throws an error unless all the required params in the given array are
  // defined in the given object.
  var check_required_params = function (object, required_params, method_name) {
    var missing_params = [];
    for (var i = 0; i < required_params.length; i++) {
      if (typeof object[required_params[i]] === 'undefined') {
        missing_params.push(required_params[i]);
      }
    }
    if (missing_params.length > 0) {
      var missing_string = missing_params.join(', ');
      throw new Error("The following required parameters for ".concat(method_name, " are missing: ", missing_string));
    }
  };

  // Adds a user, specified by the user_info JSON object, then calls the callback
  // function on the server's response.
  pub.add_user = function (user_info, callback) {
    check_required_params(user_info, ['pio_uid'], 'add_user');
    // Check the user_info for illegal keys, etc?
    make_request(USERS_ENDPOINT.concat('.json'), 'POST', user_info, callback);
  };

  // Gets a user.
  pub.get_user = function (pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'GET', {}, callback);
  };

  // Deletes a user.
  pub.delete_user = function (pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'DELETE', {}, callback);
  };

  // Adds an item, specified by the item_info JSON object, then calls the callback
  // function on the server's response.
  pub.add_item = function (item_info, callback) {
    check_required_params(item_info, ['pio_iid', 'pio_itypes'], 'add_item');
    make_request(ITEMS_ENDPOINT.concat('.json'), 'POST', item_info, callback);
  };

  // Gets an item.
  pub.get_item = function (pio_iid, callback) {
    var endpoint = ITEMS_ENDPOINT.concat('/', pio_iid, '.json');
    make_request(endpoint, 'GET', {}, callback);
  };

  // Deletes an item.
  pub.delete_item = function (pio_iid, callback) {
    var endpoint = ITEMS_ENDPOINT.concat('/', pio_iid, '.json');
    make_request(endpoint, 'DELETE', {}, callback)
  };

  // Record a user-to-item action.
  pub.record = function (action_info) {
    check_required_params(action_info, ['pio_uid', 'pio_iid', 'pio_action'], 'record');
    if (action_info.pio_action === "rate") {
      throw new Error("For record, if pio_action is rate, pio_rate is required.");
    }
    make_request(ACTIONS_ENDPOINT.concat('/u2i.json'), 'POST', action_info);
  };

  // Get top N recommendations for a user, from a recommendation engine.
  pub.item_recommendations = function (engine_name, query, callback) {
    check_required_params(query, ['pio_uid', 'pio_n'], 'item_recommendations');
    var endpoint = ITEMREC_ENDPOINT.concat('/', engine_name, '/topn.json');
    make_request(endpoint, 'GET', query, callback);
  };

  // Get top N similar items to the given item, from a similarity engine.
  pub.similar_items = function (engine_name, query, callback) {
    check_required_params(query, ['pio_iid', 'pio_n'], 'similar_items');
    var endpoint = ITEMSIM_ENDPOINT.concat('/', engine_name, '/topn.json');
    make_request(endpoint, 'GET', query, callback);
  };

  return pub;
}
