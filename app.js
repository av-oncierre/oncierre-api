var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var app = express();
app.use(cors())

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

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
