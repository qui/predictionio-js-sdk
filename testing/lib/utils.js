var utils = (function () {

  var pub = {};

  pub.decode_params = function (param_string) {
    var decoded_obj = {};
    var key_values = param_string.split("&");
    for (var i = 0; i < key_values.length; i++) {
      var kv_split = key_values[i].split("=");
      if (kv_split.length !== 2) {
        throw new Error("Decoding unsuccessful. Check formatting of input string.");
      }
      decoded_obj[decodeURIComponent(kv_split[0])] = decodeURIComponent(kv_split[1]);
    }
    return decoded_obj;
  }

  pub.decode_url_params = function (url) {
    return pub.decode_params(url.split("?")[1]);
  }

  return pub;

}());
