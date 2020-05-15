const userTaskDao = require("../models/userTaskDao");
const utils = require('./utils/utils');
const bcrypt = require('bcryptjs');
const template = require('./template/emailtemplate');
const jwt =  require('jwt-simple');

class UserTaskList {
  /**
  * Handles the various APIs for displaying and managing tasks
  * @param {UserTaskDao} userTaskDao
  */
  constructor(userTaskDao) {
    this.userTaskDao = userTaskDao;
  }

  async forgotPassword(req, res) {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='user' and r.email=@email",
      parameters: [
        {
          name: "@email",
          value: req.body.email
        }
      ]
    };

    const items = await this.userTaskDao.find(querySpec);
    if(items != false){
      const user = items[0]
      var randomNumber = utils.generateRandomNumber();
      var userEmail = user.email;
      //Can also be implemented with password hash
      var payload = {email: userEmail, secureNumber: randomNumber};
      var secret = process.env.PASSWORD_SECRET;
      var token = jwt.encode(payload, secret);
      let userResponse = {
        "token":token
      }
      var emailTemplate = template.forgotPasswordEmailTemplate(randomNumber);
      utils.sendForgotPasswordMail(userEmail, emailTemplate);
      res.status(200).send({success: 'true',message: userResponse});
    } else{
      res.status(404).send({ success: 'false', message:'Email not found' });
    }
  }

  async addUserDetails(req, res) {
    const item = req.body;
    const userEmail = req.body.email;
    const password = utils.generatePassword();
    const hashPassword = bcrypt.hashSync(password, 10);
    const newData = '1';
    await this.userTaskDao.addUserItem(item, hashPassword, newData);
    var emailTemplate = template.registrationEmailTemplate(userEmail, password);
    utils.sendMailToUser(userEmail, emailTemplate);
    //res.status(200).send('User Added');
  }

  async resetPassword(req, res) {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.type='user' and r.email=@email",
      parameters: [
        {
          name: "@email",
          value: req.body.email
        }
      ]
    };
    const items = await this.userTaskDao.find(querySpec);
    var JWT_BASE64_URL_TOKEN = utils.validateToken(req.body.token);
    var startTime = JWT_BASE64_URL_TOKEN.iat;
    var endTime = JWT_BASE64_URL_TOKEN.exp;
    var now = new Date();
    var secondsSinceEpoch = Math.round(now.getTime() / 1000)  
    if(secondsSinceEpoch >  endTime){
      res.status(403).send({ success: 'false', message:'Token expired'});
    }
    else if(items != false){ 
      const user = items[0]
      var secret = process.env.PASSWORD_SECRET;
      const resetToken = req.body.token;
      var payload = jwt.decode(resetToken, secret);
      if(req.body.email != payload.email){
        res.status(401).send({ success: 'false', message: 'Not valid token' });
      } else if(req.body.secret != payload.secureNumber){
        res.status(401).send({ success: 'false', message: 'Not valid OTP' });
      }else{
        let hashPassword = bcrypt.hashSync(req.body.password, 10);
        items.forEach(item => {
          global.newItem =  {
            "type":user.type,
            "firstName":user.firstName,
            "lastName":user.lastName,
            "role":user.role,
            "email":user.email,
            "password":hashPassword,
            "id":user.id
          }
        });
        await this.userTaskDao.updateData(newItem, user.id);
        res.status(200).send({ success: 'true', message: 'Password updated' });
      } 
    } else{
      res.status(404).send({ success: 'false', message:'User Not Found'});
    }
  }
}

module.exports = UserTaskList;