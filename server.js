var restify = require('restify'),
  Promise = require('promise'),
  DataCatalog = require('./data-catalog');

// Load environment variables from .env
require('dotenv').load();

// Initialize Data Catalog
var dataCatalog = new DataCatalog(process.env.KNACK_APPLICATION_ID, process.env.KNACK_API_KEY);

// Initialize server
var server = restify.createServer({
  name: 'Catalog Pusher'
});

// Create route for pushing to CKAN
server.post('/ckan/:id', function(req, res, next) {
  /*// Debug
    var req = {params: {id: '5596c0d6de644f2c0e307f96'}},
    res = {send: console.log},
    next = function(){};*/

  var datasetId = req.params.id,
    sourcePromises = [];

  // Fetch datasets & resources
  sourcePromises.push(
    dataCatalog.datasets(datasetId),
    dataCatalog.resources(datasetId)
  );

  // When all fetches are finished
  Promise.all(sourcePromises).then(function(sources) {
    var dataset = dataCatalog.groupResources(sources[0], sources[1]);

    res.send(dataset);
    next();
  }, function(err) {
    res.send({error: err});
  });
});

// Run server
server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
