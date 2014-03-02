describe("pdio suite", function() {

  var check_response = function(expected) {
    var func = function(response) {
      expect(response).toEqual(expected);
    };
    return func;
  };

  it("Initialization", function() {
    expect(predictionio('app_key')).not.toBeNull();
    expect(function() {
      predictionio();
      }).toThrowError();
    expect(predictionio('app_key', {'host': 'localhost'})).not.toBeNull();
  });

  it("Add user", function() {
    var client = predictionio('app_key');
    var expected = {url: "http://localhost:8000/users.json", header: "x-www-form-urlencoded",
                    data: "pio_uid=user_id&pio_appkey=app_key", method: "POST"};
    client.add_user({'pio_uid': 'user_id'}, check_response(expected));
  });

  it("Get user", function() {
    var client = predictionio('app_key');
    var expected = {url: "http://localhost:8000/users/user_id.json?pio_appkey=app_key", method: "GET"};
    client.get_user('user_id', check_response(expected));
  });

  it("Delete user", function() {
    client = predictionio('app_key');
    var expected = {url: "http://localhost:8000/users/user_id.json?pio_appkey=app_key", method: "DELETE"};
    client.delete_user('user_id', check_response(expected));
  });

});

