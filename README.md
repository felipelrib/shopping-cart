# Shopping Cart

This project is a simple implementation of a single-instance cart where different products can be added or removed through a RESTful API. In the end, the cart can be closed and the final value will be calculated. For this project, there's a promotional campaign where customers get 3 products for the price of 2, always giving the 3n-th product for free, from the cheapest to the most expensive. Calling the endpoint to close a cart will finish that instance and start another one right away, making it available to start again.

## Design

For this project, the Express library was used to work as a server to receive the POST requests. The functionality was divided into routes, controllers, services and models, each having its own responsibility following the single-responsibility principle. The routes only define which endpoints are available and point them to methods on controllers. The controllers are only responsible for an initial validation on the required parameters and its types and calls the services. The services contain all business logic needed to process the requests, while also calling the models to manage any data that needs to be persisted elsewhere.

Using classes from JavaScript, a dependency injection design was implemented to allow different models to be used freely, increasing the flexibility if another database/storage approach is desired. Initially, for this, a model was created based on the MongoDB In-Memory Server package to allow a NoSQL DB approach without having to configure external authentication or secrets.

Also a domain driven design (DDD) approach was used to group the files from the same domain. Even though the only domain present right now would be the shopping cart itself, there is a possibility to expand this project and continue using this design. Also some ubiquitous/misc files were grouped into their own "domain".

## Installation

### Requirements

- NodeJS: 14.20+

### Running

With NodeJS and NPM installed, just run the command `npm install` in the project. There are two commands available:

- `npm start` to start the project at localhost (default port 3000, but can be configured by the running environment).
- `npm test` to run the unit and e2e tests and retrieve the code coverage.

Some examples of the available endpoints can be seen in the `examples.http` file.

### Known issues

Some Linux distros might get some problems while trying to run the MongoDB In-Memory Server dependency. A solution for it can be seen [here, in their docs](https://github.com/nodkz/mongodb-memory-server/#requirements).
