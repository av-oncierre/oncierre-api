var express = require('express');
var router = express.Router();

const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./db.config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const databaseID = config.database.id;

const containerID = 'org';

//Get Center Details Using Unique Id

router.get('/', async function(req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  const querySpec = {
    query: "SELECT * FROM root r WHERE r.type='center' and r.id=@id",
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

//Create Center Using Request Body

router.post("/", async function(req, res, next) {

  const newItem =  {
  "name": req.body.name,
  "companyID": req.body.companyID,
  "type" : req.body.type
  }

  const { container } = await client
    .database(databaseID)
    .containers.createIfNotExists(
    { id: containerID }
  )
  const { resource: createdItem } = await container.items.create(newItem);
  if(res.statusCode == 200){
  console.log(`\r\nCreated new Center Id: ${createdItem.id} Name: ${createdItem.name}\r\n`);
  res.end();
  }else{
    console.log("Error! Creating Center");
  }
});

//Update Center Using Request Body

router.put("/", async function (req, res, next) {

  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='center' and r.id=@id",
      parameters: [
        {
          name: "@id",
          value: req.body.id
        }
      ]
    }
    const { resources} = await container.items.query(querySpec).fetchAll();
    resources.forEach(item => {
      global.newItem =  {
        "id": req.body.id,
        "name" : req.body.name,
        "companyID" : `${item.companyID}`
      }
    });
    const update = newItem;
    update.type = 'center';
    const { resource: updatedItem } = await container
    .item(req.body.id)
    .replace(newItem);
    if(res.statusCode == 200){
    console.log(`Updated Center Id: ${updatedItem.id} Name: ${updatedItem.name}`);
    res.end();
    } else{
      console.log("Error! Updating Center");
    }
  } catch (err) {
    console.log(err.message);
  }
});

//Delete Center

router.delete("/", async function (req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const { resource: deleteItem } = await container
    .item(req.query.id, 'center')
    .delete();
    if(res.statusCode == 200){
    console.log(`Center Deleted!!`);
    res.end();
    } else{
      console.log("Error! Deleting Center");
      res.end();
    }
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
