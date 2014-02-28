describe("pdio suite", function() {
  it("Initialization", function() {
    expect(predictionio('app_key')).not.toBeNull();
    expect(function() {
      predictionio();
      }).toThrowError();
    expect(predictionio('app_key', {'host': 'localhost'})).not.toBeNull();
  });

  it("Add user", function() {
    client = predictionio('app_key');
    expect(function() {
      client.add_user({'pio_uid': 'user_id'});
      }).not.toThrow();
  });

  it("Get user", function() {
    client = predictionio('app_key');
    expect(function() {
      client.get_user('user_id');
      }).not.toThrow();
  });

  it("Delete user", function() {
    client = predictionio('app_key');
    expect(function() {
      client.delete_user('user_id');
      }).not.toThrow();
  });

});
