# PredictionIO JavaScript SDK
JavaScript SDK for interacting with the [PredictionIO API](http://docs.prediction.io/current/apis/index.html).

Source code on [GitHub](https://github.com/qui/predictionio-js-sdk).

## Getting Started
1. Include the predictionio.js file in the page.
2. Call the predictionio function with the app id of your PredictionIO application, which returns a client object. (See the [documentation](http://qui.github.io/predictionio-js-sdk/global.html#predictionio) for more initialization options.)
3. Call methods on the object to access the PredictionIO API. The following methods are available ([documentation](http://qui.github.io/predictionio-js-sdk/client.html)):
    * add_item
    * add_user
    * delete_item
    * delete_user
    * get_item
    * get_user
    * item_recommendations
    * record
    * similar_items

## Acknowledgements
Uses Jasmine 2.0 (https://github.com/pivotal/jasmine) and Sinon 1.9.0 (http://sinon.org) for testing.
