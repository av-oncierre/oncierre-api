var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var cors = require('cors')
var app = express();
var dotenv = require( "dotenv" );
dotenv.config();
app.use(cors())
app.use(bodyParser.json());
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./routes/db.config')
const UserTaskList = require('./routes/usertasklist')
const UserTaskDao = require('./models/userTaskDao')
const cosmosClient = new CosmosClient({
  endpoint: config.endpoint,
  key: config.key
})

const userTaskDao = new UserTaskDao(cosmosClient, config.database.id, config.database.containerID)
const userTaskList = new UserTaskList(userTaskDao)
userTaskDao
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error(
      'Shutting down because there was an error settinig up the database.'
    )
    process.exit(1)
  })

app.post('/api/invite', (req, res, next) => userTaskList.addUserDetails(req, res).catch(next))
app.post('/api/forgotpassword', (req, res, next) => userTaskList.forgotPassword(req, res).catch(next))
app.post('/api/resetpassword', (req, res, next) => userTaskList.resetPassword(req, res).catch(next))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
app.use('/', indexRouter);

var oauthRouter = require('./routes/oauth');
app.use('/oauth', oauthRouter);

var companiesRouter = require('./routes/companies');
app.use('/companies', companiesRouter);

var centersRouter = require('./routes/centers');
app.use('/centers', centersRouter);

var apartmentsRouter = require('./routes/apartments');
app.use('/apartments', apartmentsRouter);

var centerRouter = require('./routes/center');
app.use('/center', centerRouter);

var companyRouter = require('./routes/company');
app.use('/company', companyRouter);

var apartmentRouter = require('./routes/apartment');
app.use('/apartment', apartmentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.json('error');
  res.json({
    message: err.message,
    error: err
  })
});

module.exports = app;
