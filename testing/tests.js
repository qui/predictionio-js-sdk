describe("Basic initialization tests", function() {

  it("App key required", function() {
    expect(function() {
      predictionio();
    }).toThrowError();
  });

  it("Valid initializations", function() {
    expect(predictionio("app_key")).not.toBeNull();
    expect(predictionio("app_key", {"host": "localhost"})).not.toBeNull();
  });
});

describe("User API tests", function() {

  var client = predictionio("app_key", {"host": ""}),
      server,
      callback;

  beforeEach(function() {
    server = sinon.fakeServer.create();
    server.respondWith("POST", "users.json", [201, {}, '{"message": "User created."}']);
    server.respondWith("GET", /^users\/([^\t,]+)\.json\?pio_appkey\=app_key$/, function(xhr, uid) {
      xhr.respond(200, {}, JSON.stringify({"pio_uid": uid}));
    });
    server.respondWith("DELETE", /^users\/([^\t,]+)\.json\?pio_appkey\=app_key$/, '{"message": "User deleted."}');
      // need to check what status code is returned by the actual server
    callback = sinon.spy();
  });

  afterEach(function() {
    server.restore();
    callback.reset();
  });

  it("Add user", function() {
    client.add_user({'pio_uid': 'user_id'}, callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });
  // How to check that POST body is being sent properly?

  it("Verify default host", function() {
    var client_with_default = predictionio("app_key");
    client_with_default.add_user({'pio_uid': 'user_id'});
    expect(server.requests[0].url).toBe("http://localhost:8000/users.json");
    server.respond();
  });

  it("Get user", function() {
    client.get_user("user_10", callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
    expect(callback.firstCall.args.length).toBe(1);
    expect(callback.firstCall.args[0].pio_uid).toBeDefined();
    expect(callback.firstCall.args[0].pio_uid).toBe("user_10");
  });

  it("Delete user", function() {
    client.delete_user({'pio_uid': 'user_id'}, callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });

});

