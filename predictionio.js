/**
JavaScript library for interacting with the PredictionIO API.
Returns a PredictionIO API client object for an app.

@param {string} app_key - The app key for the PredictionIO application.
@param {Object} options - Key-value pairs for options.
                          Currently only supports the 'host' key (the address of the API server).
                          Default for 'host' is 'http://localhost:8000/'.
@returns {Object} client - Client object that can be used to interact with the API server.
*/
var predictionio = function (app_key, options) {

  /**
  @namespace client
  @desc
  {@link client.add_item add_item(item_info, callback)} </br>
  {@link client.add_user add_user(user_info, callback)} </br>
  {@link client.delete_item delete_item(pio_iid, callback)} </br>
  {@link client.delete_user delete_user(pio_uid, callback)} </br>
  {@link client.get_item get_item(pio_iid, callback)} </br>
  {@link client.get_user get_user(pio_uid, callback)} </br>
  {@link client.item_recommendations item_recommendations(engine_name, query, callback)} </br>
  {@link client.record record(action_info)} </br>
  {@link client.similar_items similar_items(engine_name, query, callback)} </br>
  */

  var client = {}, // All public methods will be available from the returned client object.
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
    HOST = options.host; // TODO: Provided host must end in a slash
  }

  /**
  (Helper) Makes an AJAX request to the specified endpoint, with the given method and data,
  and then calls the callback on the server's response if the request was successful.

  @private
  */
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

  /**
  (Helper) Throws an error unless all the required params in the given array are
  defined in the given object.

  @private
  */
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

  /**
  Attempts to add a user, specified by the user_info JSON object, to the PredictionIO
  database, then calls a callback function on the server's response if the request
  is successful.

  @method add_user
  @memberof client

  @param {Object} user_info - Key-value information about the user to be added. </br>
      Requires: </br>
      - pio_uid: the id of the user to be added. Should be unique. If this id is already
        in use, the old record will be overwritten. </br> </br>

      Optional: </br>
      - pio_latlng: Latitude and longitude for action in comma-separated doubles, e.g. 12.34,5.67. </br>
      - pio_inactive: status of item, 'true' or 'false'. </br>
      Other keys without the prefix 'pio' will be stored with the user. </br>
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.add_user = function (user_info, callback) {
    check_required_params(user_info, ['pio_uid'], 'add_user');
    // Check the user_info for illegal keys, etc?
    make_request(USERS_ENDPOINT.concat('.json'), 'POST', user_info, callback);
  };

  /**
  Attempts to get information about a user from the PredictionIO database,
  then calls a callback function on the response if the request
  is successful.

  @method get_user
  @memberof client

  @param {string} pio_uid - PredictionIO userid of the user to get.
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.get_user = function (pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'GET', {}, callback);
  };

  /**
  Attempts to delete a user from the PredictionIO database, then calls a callback
  function on the response if the request is successful.

  @method delete_user
  @memberof client

  @param {string} pio_uid - PredictionIO userid of the user to delete.
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.delete_user = function (pio_uid, callback) {
    var endpoint = USERS_ENDPOINT.concat('/', pio_uid, '.json');
    make_request(endpoint, 'DELETE', {}, callback);
  };

  /**
  Attempts to add an item, specified by the item_info JSON object, to the PredictionIO
  database, then calls a callback function on the server's response if the request
  is successful.

  @method add_item
  @memberof client

  @param {Object} item_info - Key-value information about the item to be added. </br>
      Requires: </br>
      - pio_iid: the id of the item to be added. Should be unique. If this id is already
        in use, the old record will be overwritten. </br>
      - pio_itypes: item types that the item belongs to, as a comma-separated string. </br> </br>

      Optional: </br>
      - pio_latlng: Latitude and longitude for action in comma-separated doubles, e.g. 12.34,5.67. </br>
      - pio_inactive: status of item, 'true' or 'false'. </br>
      - pio_startT: start time that item becomes available, in ISO 8601 format or milliseconds since the epoch. </br>
      - pio_endT: expiration time that the itme becomes unavailable. </br>
      - pio_price: price of item. </br>
      - pio_profit: profit from item when it is sold. </br>
      Other keys without the prefix 'pio' will be stored with the item. </br>
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.add_item = function (item_info, callback) {
    check_required_params(item_info, ['pio_iid', 'pio_itypes'], 'add_item');
    make_request(ITEMS_ENDPOINT.concat('.json'), 'POST', item_info, callback);
  };

  /**
  Attempts to get information about an item from the PredictionIO database,
  then calls a callback function on the response if the request
  is successful.

  @method get_item
  @memberof client

  @param {string} pio_iid - PredictionIO item id of the item to get.
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.get_item = function (pio_iid, callback) {
    var endpoint = ITEMS_ENDPOINT.concat('/', pio_iid, '.json');
    make_request(endpoint, 'GET', {}, callback);
  };

  /**
  Attempts to delete an item from the PredictionIO database, then calls a callback
  function on the response if the request is successful.

  @method delete_item
  @memberof client

  @param {string} pio_iid - PredictionIO item id of the item to delete.
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.delete_item = function (pio_iid, callback) {
    var endpoint = ITEMS_ENDPOINT.concat('/', pio_iid, '.json');
    make_request(endpoint, 'DELETE', {}, callback)
  };

  /**
  Record a user-to-item action in the PredictionIO database.

  @method record
  @memberof client

  @param {Object} action_info - Key-value information about the action. </br>
      Requires: </br>
      - pio_uid: the id of the user that took the action. </br>
      - pio_iid: the id of the item that the user took action on. </br>
      - pio_action: the type of action, from 'rate', 'like', 'dislike', 'view', and 'conversion'. </br>
      If pio_action is 'rate', then 'pio_rate' is also required (an integer 1-5). </br> </br>

      Optional: </br>
      - pio_latlng: Latitude and longitude for action in comma-separated doubles, e.g. 12.34,5.67. </br>
      - pio_t: Time of action, in ISO 8601 format or milliseconds since the epoch. </br>
  */
  client.record = function (action_info) {
    check_required_params(action_info, ['pio_uid', 'pio_iid', 'pio_action'], 'record');
    if (action_info.pio_action === "rate") {
      throw new Error("For record, if pio_action is rate, pio_rate is required.");
    }
    make_request(ACTIONS_ENDPOINT.concat('/u2i.json'), 'POST', action_info);
  };

  /**
  Attempts to get top N item recommendations for a user, from a recommendation engine, then
  call a callback function on the server's response if the request is successful.

  @method item_recommendations
  @memberof client

  @param {String} engine_name - the name of the engine to query.
  @param {Object} query - Key-value pairs specifying the query. </br>
      Requires: </br>
      - pio_uid: id of user to get recommendations for. </br>
      - pio_n: max number of item recommendations returned. </br> </br>

      Optional: </br>
      - pio_itypes: types(s) of items to be recommended, comma-separated. </br>
      - pio_latlng: Geo search point with latitude and longitude. </br>
      - pio_within: bounding distance from geo serach point. </br>
      - pio_unit: unit of pio_within, 'km' or 'mi'. </br>
      - pio_attributes: custom attributes to be returned. </br>
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.item_recommendations = function (engine_name, query, callback) {
    check_required_params(query, ['pio_uid', 'pio_n'], 'item_recommendations');
    var endpoint = ITEMREC_ENDPOINT.concat('/', engine_name, '/topn.json');
    make_request(endpoint, 'GET', query, callback);
  };

 /**
  Attempts to get top N similar items to a given item, from a recommendation engine, then
  call a callback function on the server's response if the request is successful.

  @method similar_items
  @memberof client

  @param {String} engine_name - the name of the engine to query.
  @param {Object} query - Key-value pairs specifying the query. </br>
      Requires: </br>
      - pio_iid: id of item to get recommendations for. </br>
      - pio_n: max number of item recommendations returned. </br> </br>

      Optional: </br>
      - pio_itypes: types(s) of items to be recommended, comma-separated. </br>
      - pio_latlng: Geo search point with latitude and longitude. </br>
      - pio_within: bounding distance from geo serach point. </br>
      - pio_unit: unit of pio_within, 'km' or 'mi'. </br>
      - pio_attributes: custom attributes to be returned. </br>
  @param {function} callback - Callback function to be called when server's response
      is received. Response is a plain object with properties.
  */
  client.similar_items = function (engine_name, query, callback) {
    check_required_params(query, ['pio_iid', 'pio_n'], 'similar_items');
    var endpoint = ITEMSIM_ENDPOINT.concat('/', engine_name, '/topn.json');
    make_request(endpoint, 'GET', query, callback);
  };

  return client;
}
