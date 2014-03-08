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

describe("User API and general tests", function() {

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

  it("Add user without uid", function() {
    expect(function () {
      client.add_user({'other_key': 'value'}, callback);
    }).toThrowError();
  });

  it("Verify default host", function() {
    var client_with_default = predictionio("app_key");
    client_with_default.add_user({'pio_uid': 'user_id'});
    expect(server.requests[0].url).toBe("http://localhost:8000/users.json");
    server.respond();
  });

  it("Works if user does not specify callback", function () {
    expect(function () {
      client.add_user({'pio_uid': 'user_id'});
      server.respond();
    }).not.toThrowError();
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

describe("Item API tests", function() {

  var client = predictionio("app_key", {"host": ""}),
      server,
      callback;

  beforeEach(function() {
    server = sinon.fakeServer.create();
    server.respondWith("POST", "items.json", [201, {}, '{"message": "Item created."}']);
    server.respondWith("GET", /^items\/([^\t,]+)\.json\?pio_appkey\=app_key$/, function(xhr, iid) {
      xhr.respond(200, {}, JSON.stringify({"pio_iid": iid}));
    });
    server.respondWith("DELETE", /^items\/([^\t,]+)\.json\?pio_appkey\=app_key$/, '{"message": "Item deleted."}');
      // need to check what status code is returned by the actual server
    callback = sinon.spy();
  });

  afterEach(function() {
    server.restore();
    callback.reset();
  });

  it("Add item", function() {
    client.add_item({'pio_iid': 'item_id', 'pio_itypes': 'type1,type2'}, callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });

  it("Add item, missing item_iid or itypes", function() {
    expect(function () {
      client.add_item({'other_key': 'value'}, callback);
    }).toThrowError();

    expect(function () {
      client.add_item({'item_iid': 'item_id'}, callback);
    }).toThrowError();
  });

  it("Get item", function() {
    client.get_item("item200", callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
    expect(callback.firstCall.args.length).toBe(1);
    expect(callback.firstCall.args[0].pio_iid).toBeDefined();
    expect(callback.firstCall.args[0].pio_iid).toBe("item200");
  });

  it("Delete item", function() {
    client.delete_item({'pio_iid': 'item_id'}, callback);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });

});

describe("Action API tests", function () {

  var client = predictionio("app_key", {"host": ""}),
      server,
      callback;

  beforeEach(function() {
    server = sinon.fakeServer.create();
    callback = sinon.spy();
  });

  afterEach(function() {
    server.restore();
    callback.reset();
  });

  it("Record action, missing param(s)", function () {
    expect(function () {
      client.record({'pio_uid': 'uid', 'pio_iid': 'id'});
    }).toThrowError();
    expect(function () {
      client.record({'pio_uid': 'uid', 'pio_action': 'like'});
    }).toThrowError();
    expect(function () {
      client.record({'pio_action': 'dislike', 'pio_iid': 'id'});
    }).toThrowError();
    expect(function () {
      client.record({'pio_uid': 'uid', 'pio_iid': 'id', 'pio_action': 'rate'});
    }).toThrowError();
  });

});


