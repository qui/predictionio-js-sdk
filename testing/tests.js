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
    var req_info = {'pio_uid': 'user_id', 'age': '23', 'pio_active': 'true'}
    client.add_user(req_info, callback);
    req_info["pio_appkey"] = "app_key";
    expect(utils.decode_params(server.requests[0].requestBody)).toEqual(req_info);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });

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
    var req_info = {'pio_iid': 'item_id', 'pio_itypes': 'type1,type2'};
    client.add_item(req_info, callback);
    req_info["pio_appkey"] = "app_key";
    expect(utils.decode_params(server.requests[0].requestBody)).toEqual(req_info);
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

  it("Record action", function () {
    var req_info = {'pio_uid': 'user', 'pio_iid': 'item', 'pio_action': 'like', 'pio_t': '2013-09-10T03:06:12Z'};
    client.record(req_info);
    req_info["pio_appkey"] = "app_key";
    expect(utils.decode_params(server.requests[0].requestBody)).toEqual(req_info);
  });

});

describe("Engine API tests", function() {

  var client = predictionio("app_key", {"host": ""}),
      server,
      callback;

  beforeEach(function() {
    server = sinon.fakeServer.create();
    server.respondWith("GET", /^engines\/itemrec\/[^\t,]+\/topn\.json\?.+/, '{"pio_iids": ["item1"]}');
    server.respondWith("GET", /^engines\/itemsim\/[^\t,]+\/topn\.json\?.+/, '{"pio_iids": ["item1"]}');
    callback = sinon.spy();
  });

  afterEach(function() {
    server.restore();
    callback.reset();
  });

  it("Get top n recommendations", function() {
    var query = {'pio_uid': 'user', 'pio_n': '4'};
    var recs = client.item_recommendations('engine2', query, callback);
    query["pio_appkey"] = "app_key";
    expect(utils.decode_url_params(server.requests[0].url)).toEqual(query);
    server.respond();
    expect(callback.calledOnce).toBe(true);
    // How to check that engine2 is in url properly?
  });

  it("Get top n recommendations, missing param(s)", function() {
    expect(function () {
      client.item_recommendations('engine', {'other_key': 'value'}, callback);
    }).toThrowError();
    expect(function () {
      client.item_recommendations('engine', {'pio_uid': 'user'}, callback);
    }).toThrowError();
    expect(function () {
      client.item_recommendations('engine', {'pio_n': '5'}, callback);
    }).toThrowError();
  });

  it("Get top n similar items", function() {
    var query = {'pio_iid': 'item', 'pio_n': '10'};
    var recs = client.similar_items('engine', query, callback);
    query["pio_appkey"] = "app_key";
    expect(utils.decode_url_params(server.requests[0].url)).toEqual(query);
    server.respond();
    expect(callback.calledOnce).toBe(true);
  });

  it("Get top n similar items, missing param(s)", function() {
    expect(function () {
      client.similar_items('engine', {'other_key': 'value'}, callback);
    }).toThrowError();
    expect(function () {
      client.similar_items('engine', {'pio_iid': 'item'}, callback);
    }).toThrowError();
    expect(function () {
      client.similar_items('engine', {'pio_n': '5'}, callback);
    }).toThrowError();
  });

});



