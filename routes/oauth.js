var express = require('express');
var router = express.Router();

const CosmosClient = require('@azure/cosmos').CosmosClient;
var jwt = require('jsonwebtoken'); 
var bcrypt = require('bcryptjs');

const config = require('./db.config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const databaseID = config.database.id;

const containerID = 'org';

router.post('/', async function(req, res, next) {
    const { container } = await client
        .database(databaseID)
        .containers.createIfNotExists(
        { id: containerID }
        )
    if(req.body.username && req.body.password) {
      const querySpec = {
        query: "SELECT * FROM root r WHERE r.type='user' and r.email=@id",
        parameters: [
          {
            name: "@id",
            value: req.body.username
          }
        ]
      }
      const { resources } = await container.items.query(querySpec).fetchAll()

      if(resources.length > 0) {
        const user = resources[0]
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) res.status(401).send({ auth: false, token: null });
    
        var token = jwt.sign({ 
          id: user.id, 
          role: user.role,
          companyID: user.role === 'companyadmin' ? user.companyID : null,
          centerID: user.role === 'centeradmin' ? user.centerID : null,
          apartmentID: user.role === 'staff' ? user.apartmentID : null,
          hubs: user.role === 'staff' ? user.hubs : null 
        }, 'somesecretshit'/* config.secret */, {
          expiresIn: 3600
        });
    
        res.status(200).send({ ...resources[0], token: token });
      } else {
        res.status(404).send('No user found.');
      }
    }
});

module.exports = router;
