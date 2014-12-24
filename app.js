var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  ,posts = db.get('posts'),objects = db.get('objects');
// POSTS and OBJECTS BELONGS TO MALESHIN PROJECT DELETE WHEN PUSHING TOPANDVIEWS TO PRODUCTION
var fs = require('fs-extra');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(require('connect').bodyParser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/',function(req,res){
	res.redner('index');
});

app.get('/redact',function(req,res){
	res.render('admin');
});

app.post('/actions',function(req,res){
	var q = req.body.actions;
	switch (q){
      case('newpost'):
        var vtitle = req.body.vtitle;
        var imgnum = req.body.imgnum;
      break;
      case('updatepost'):
        var pid = req.body.pid;
        var vtitle =req.body.vtitle;
        var imgnum = req.body.imgnum;
      break;
      case('delete post'):
        var pid = req.body.pid;
      break;
      case('addroute'):
      break;
      case('removeroute'):
      break;
      case('addphoto'):
        var vtitle= req.body.vtitle;
        var aid = req.body.aid;
        var country = req.body.country; 
      break;
      case('updatephoto'):
      break;
      case('addalbum'):
      break;
      case('addvideo'):
      break;
      case('updatealbum'):
      break;
      case('removealbum'):
      break;
      case('removephoto'):
      break;
      case('removevideo'):
      break;
      case('updatecontacts'):
      break;
      case('updateabout'):
      break;
	}
});

function upload(filepath,imageid,fieldid){
     //req.files.images["+i+"].path
     var oldPath = filepath;
     console.log('UPLOAD 1 step, oldPath:'+ oldPath);
     var newPath = __dirname +"/public/images/places/" +vplacename+"/"+ imageid;
     console.log('UPLOAD 2 step, newPath:' + newPath );
     fs.readFile(oldPath , function(err, data) {
       fs.writeFile(newPath, data, function(err) {
                      fs.unlink(oldPath, function(){
                          if(err) throw err;
                          res.send('UPLOAD '+imageid+"file uploaded to: " + newPath);
                          fieldid = newPath;  });
                  }); 
                }); 
              };
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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
app.listen(80,'188.226.132.200');