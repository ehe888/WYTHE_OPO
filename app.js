var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var urlencode = require('urlencode');
var crypto = require('crypto');
var url = require('url');
var sleep = require('sleep');
var util = require("util");


var config = require("./config")();
var conString = config.dbConStr;

var pg = require('pg');
//set connection pool size to 20
pg.defaults.poolSize = 20;

var rollback = function(client, done) {
  client.query('ROLLBACK', function(err) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    console.error("ROLLBACK error: " + err);
    return done(err);
  });
};

var routes = require('./routes/index');
var app = express();

app.use(express.static(path.join(__dirname, config.debug ? 'static' : 'release')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

/*
app.use(bodyParser.urlencoded({ extended: false }));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("MKGM-WYTHE-OPO-5703"));

app.get('/', function(req, res, next) {
    console.log("access website root");
    res.sendFile(path.join(__dirname, config.debug ? './static' : './release', 'home.html'));
});

app.post('/play', function(req, res, next){

    var input = JSON.parse(JSON.stringify(req.body));
    
    console.log(req.body);
    
    /*
     *  insert mobile number into the lottery record table, if success then send sms of 25元   
    */
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return next(err);
        }
        client.query('BEGIN', function(err) {
            if(err) {
                rollback(client, done);
                return next(err);
            }

            process.nextTick(function() {
                var text = "INSERT INTO play_count(foobar)" 
                    + "VALUES('')";
                client.query(text, [ ], 
                    function(err, result) {
                        console.error(err);
                        if(err) {
                            rollback(client, done);
                            return res.json({
                                success: false,
                                data: "INTERNAL_ERROR"
                            });
                        }
                        client.query('COMMIT', done);
                        
                        return res.json({
                            success: true,
                            data: result
                        });
                });
            });
        });
    });
   
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;


