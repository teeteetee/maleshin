var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jade = require('jade');
var multer  = require('multer');

var mongo = require('mongodb');
var db = require('monk')('localhost/tav')
  ,posts = db.get('posts'),objects = db.get('objects');
// POSTS and OBJECTS BELONGS TO MALESHIN PROJECT DELETE WHEN PUSHING TOPANDVIEWS TO PRODUCTION
var fs = require('fs-extra');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(multer({ dest: __dirname + '/uploads/'}));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/',function(req,res){
  console.log('User-Agent: ' + req.headers['user-agent']);
  console.log(req.ip);
  posts.find({},function(err,done){
    if (err)
    {
     // CALL THE COPS
    }
    else {
      var pquant = done;
      if(pquant.length === 0)
  {res.render('index',{'title':done.title,'postbody':done.postbody,'headimage':done.headimage});}
  else
  {
    posts.findOne({last:1},function(err,doc){
      if (err)
      {
        //CALL THE COPS
      }
      else {
        res.render('emptyindex',{'insert':doc.postbody,'headimage':doc.headimage});
      }
    });
  }
    }
  })
});

app.get('/redact',function(req,res){
	res.render('login');
});

app.post('/redact',function(req,res){
  var pass= 'testtest';
  var log= 'testtest';
  var vp = req.body.p;
  var vl = req.body.l;
  if(pass === vp && log === vl)
  {
     res.render('admin')
  }
  else {
     res.send('wrong pass/user');
  }
});

app.get('/countries',function(req,res){
  res.render('countries');
});

app.get('/routes',function(req,res){
  res.render('routes');
});

app.get('/about',function(req,res){
  res.render('about');
});

app.get('/contacts',function(req,res){
  res.render('contacts');
});

app.get('/gall',function(req,res){
  res.render('gallery');
});

app.get('/books',function(req,res){
  res.render('books');
});
app.get('/ap',function(req,res){
  posts.find({},function(err,docs){
        if (err) {res.send('error');}
        else {
             if (docs != {})
                           {
                           console.log(docs);
                           res.render('adminposts',{'docs' : docs});
                            }
      
              else {
                    res.send('empty db');
                   }
              }
    });
});


app.post('/drop/:cc',function(req,res){
  var cc = req.params.cc;
  var p = 'dropthatshit';
  if(req.body.p === p)
  {switch(cc) {
      case('posts'):
        console.log('POSTS DB DROPPED FROM '+req.ip);
        posts.remove();
        res.redirect('/redact');
      break;
      case('objects'):
        console.log('OBJECTS DB DROPPED FROM '+req.ip);
        posts.remove();
        res.redirect('/redact');
      break;
    }
  }
  else
    {res.send('wrong p/l');}

});

app.post('/actions',function(req,res){
  console.log('IN /ACTIONS');
	var qq = req.body.actions;
  console.log('Q is:'+qq);
  console.log(req.body);
	switch (qq){
      case('newpost'):
      console.log('post comming through');
        var vpostbody = req.body.postbody;
        var vtitle = req.body.vtitle;
        console.log('post body is:'+vpostbody);
        var vheadimage;
        if(req.files.headimage)
         {function upload(filepath,imageid){
                            var oldPath = filepath;
                            console.log('UPLOAD 1 step, oldPath:'+ oldPath);
                            var newPath = __dirname +"/public/images/"+ imageid;
                            vheadimage = "/images/"+ imageid;
                            console.log('UPLOAD 2 step, newPath:' + newPath );
                            fs.readFile(oldPath , function(err, data) {
                              fs.writeFile(newPath, data, function(err) {
                                  fs.unlinkSync(oldPath, function(){
                                      if(err) throw err;
                                      console.log('UPLOAD '+imageid+"file uploaded to: " + newPath);
                                        });
                              }); 
                            }); 
                          };
            
                    upload(req.files.headimage.path,req.files.headimage.name); 
                    console.log('headimage uploaded')
                    var dd = new Date();
                    var vday = dd.getDay()+1;
                    var vmonth = dd.getMonth()+1;
                    var vyear = dd.getUTCFullYear();
                    posts.insert({last:1,title:vtitle,postbody:vpostbody,headimage:vheadimage,date:{day:vday,month:vmonth,year:vyear}});
                    res.redirect('/');
                  }   
          else {
            res.send('wasnt able to find headimage')
          }
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
app.listen(80,'188.166.56.89');