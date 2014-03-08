var utils = (function () {

  var pub = {};

  pub.decode_body = function (body) {
    var decoded_obj = {};
    var key_values = body.split("&");
    for (var i = 0; i < key_values.length; i++) {
      var kv_split = key_values[i].split("=");
      if (kv_split.length !== 2) {
        throw new Error("Decoding unsuccessful. Check formatting of input string.");
      }
      decoded_obj[decodeURIComponent(kv_split[0])] = decodeURIComponent(kv_split[1]);
    }
    return decoded_obj;
  }

  return pub;

}());
