var jwt = require('jsonwebtoken'); 
//var config = require('../config'); // get our config file

function verifyToken(req, res, next) {

    var token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, 'somesecretshit'/* config.secret */, function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        
        req.userId = decoded.id;
        req.role = decoded.role;
        req.companyID = decoded.role === 'companyadmin' ? decoded.companyID : null;
        req.centerID = decoded.role === 'centeradmin' ? decoded.centerID : null;
        req.apartmentID = decoded.role === 'staff' ? decoded.apartmentID : null;
        req.hubs = decoded.role === 'staff' ? decoded.hubs : null;
        next();
    });

}

module.exports = verifyToken;