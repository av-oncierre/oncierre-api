var express = require('express');
var router = express.Router();

const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./db.config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const databaseID = config.database.id;

const containerID = 'org';

var VerifyToken = require('./verifyToken');

router.get('/', VerifyToken, async function (req, res, next) {

  const { container } = await client
    .database(databaseID)
    .containers.createIfNotExists(
      { id: containerID }
    )
  if (req.role === 'superadmin') {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='apartment'"
    }
    const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
  } else if (req.role === 'companyadmin') {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='apartment' and r.companyID=@id",
      parameters: [
        {
          name: "@id",
          value: req.companyID
        }
      ]
    }
    const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
  } else if (req.role === 'centeradmin') {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='apartment' and r.centerID=@id",
      parameters: [
        {
          name: "@id",
          value: req.centerID
        }
      ]
    }
    const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
  } else {
    const querySpec = {
      query: `SELECT * FROM root r WHERE r.type='apartment' and r.id in (${req.apartmentID.map(a => "'" + a + "'")})`
    }
    const {resources} = await container.items.query(querySpec).fetchAll() 
    res.json(resources)
  }
});

module.exports = router;
