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
      query: "SELECT * FROM root r WHERE r.type='company'"
    }
    const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
  } else if (req.role === 'companyadmin') {
    
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='company' and r.id=@id",
      parameters: [
        {
          name: "@id",
          value: req.companyID
        }
      ]
    }
    const { resources } = await container.items.query(querySpec).fetchAll()
    res.json(resources)
  } else {
    res.status(403).send({ message: 'Access Denied' });
  }
});

//Create Company Using Request Body

router.post("/", async function(req, res, next) {

  const newItem =  {
    "name":  req.body.name,
    "type" : req.body.type
  }

  const { container } = await client
    .database(databaseID)
    .containers.createIfNotExists(
    { id: containerID }
  )
  const { resource: createdItem } = await container.items.create(newItem);
  if(res.statusCode == 200){
    console.log(`\r\nCreated new Company Id: ${createdItem.id} Name: ${createdItem.name}\r\n`);
  } else{
    console.log("Error! Creating Company");
  }
});

//Update Company Using Request Body 

router.put("/", async function (req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const update = req.body;
    update.type = 'company';
    const { resource: updatedItem } = await container
    .item(req.body.id)
    .replace(req.body);
    if(res.statusCode == 200){
      console.log(`Updated Company Id: ${updatedItem.id} Name : ${updatedItem.name}`);
      res.end();
    } else{
      console.log("Error! Updating Company");
    }
  } catch (err) {
    console.log(err.message);
  }
});

//Delete Company

router.delete("/", async function (req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const { resource: deleteItem } = await container
    .item(req.query.id, 'company')
    .delete();
    if(res.statusCode == 200){
    console.log(`Company Deleted!!`);
    res.end();
    } else{
      console.log("Error! Deleting Company");
      res.end();
    }
  } catch (err) {
    console.log(err.message);
  }
});



module.exports = router;
