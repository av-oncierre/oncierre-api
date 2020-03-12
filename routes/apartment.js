var express = require('express');
var router = express.Router();

const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./db.config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const databaseID = config.database.id;

const containerID = 'org';

//Get Apartment Details Using Unique Id

router.get('/', async function(req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  const querySpec = {
    query: "SELECT * FROM root r WHERE r.type='apartment' and r.id=@id",
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

//Create Apartment Using Request Body

router.post("/", async function(req, res, next) {

  const newItem =  {
    "name": req.body.name,
    "hubID" : req.body.hubID,
    "companyID" : req.body.companyID,
    "centerId" : req.body.centerId,
    "type" : "apartment"
  }

  const { container } = await client
    .database(databaseID)
    .containers.createIfNotExists(
    { id: containerID }
  )
  const { resource: createdItem } = await container.items.create(newItem);
  if(res.statusCode == 200){
  console.log(`\r\nCreated new Apartment Id: ${createdItem.id} Apartment Name:  ${createdItem.name} Hub Id : ${createdItem.hubID} 
  Company Id : ${createdItem.companyID} Center Id : ${createdItem.centerId}\r\n`);
  res.end();
  } else{
    console.log("Error! Creating Apartment");
  }
});

//Update Apartment Using Request Body

router.put("/", async function (req, res, next) {

  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='apartment' and r.id=@id",
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
        "companyID" : `${item.companyID}`,
        "centerID" : `${item.centerID}`,
        "hubID" : `${item.hubID}`
      }
    });
    const update = newItem;
    update.type = 'apartment';
    const { resource: updatedItem } = await container
    .item(req.body.id)
    .replace(newItem);
    if(res.statusCode == 200){
    console.log(`Updated Apartment Id: ${updatedItem.id} Name: ${updatedItem.name} , HubId : ${updatedItem.hubID}`);
    res.end();
    } else{
      console.log("Error! Updating Apartment");
    }
  } catch (err) {
    console.log(err.message);
  }
});

//Delete Apartment

router.delete("/", async function (req, res, next) {
  const { container } = await client
    .database(databaseID)
      .containers.createIfNotExists(
        { id: containerID }
  )
  try {
    const { resource: deleteItem } = await container
    .item(req.query.id, 'apartment')
    .delete();
    if(res.statusCode == 200){
    console.log(`Apartment Deleted!!`);
    res.end();
    } else{
      console.log("Error! Deleting Apartment");
      res.end();
    }
  } catch (err) {
    console.log(err.message);
  }
});
 

module.exports = router;
