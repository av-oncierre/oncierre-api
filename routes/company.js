var express = require('express');
var router = express.Router();

const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./db.config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const databaseID = config.database.id;

const containerID = 'org';

//Get Company Details Using Unique Id

router.get('/', async function(req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  const querySpec = {
    query: "SELECT * FROM root r WHERE r.type='company' and r.id=@id",
    parameters: [
      {
        name: "@id",
        value: req.query.id
      }
    ]
  }
  const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
});

module.exports = router;
