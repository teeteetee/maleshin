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
  ,posts = db.get('posts'),objects = db.get('objects');misc = db.get('misc');
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
  {res.render('index',{'title':"yet empty",'headimage':'/bootstrap/images/1.jpg'});}
  else
  {
     posts.find({},{ limit:1,sort : { sd : -1 } },function (err,doc) { 
      if (err)
      {
        //CALL THE COPS
      }
      else {
        if(doc.length>0)
        {console.log('FOUND A POST, TITLE IS : '+doc[0].title);
                console.log('BODY IS : '+doc[0].postbody);
                console.log('-----------------------------');
                console.log(doc);
                res.render('index',{'title':doc[0].title,'postbody':doc[0].postbody,'headimage':doc[0].headimage});}
         else
         {
          res.render('index',{'title':"yet empty",'headimage':'/bootstrap/images/1.jpg'});
         }       
      }
    });
  }
    }
  })
});

app.get('/redact',function(req,res){
	res.render('login');
});

app.get('/posts/:id',function(req,res){
  var pid = parseInt(req.params.id);
  posts.findOne({id:pid},function(err,doc){
    if (err)
    {
      //SCREAM
    }
    else
    {
      if(doc)
      {
        res.render('post');
      }
      else {
        res.redirect('/');
      }
    }
  });
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

app.get('/posts',function(req,res){
  
  posts.find({},{ sort : { sd : -1 } },function (err,docs) { 
        if (err) {res.send('error');}
        else {
             if (docs.length>0)
                           {
                           console.log(docs);
                           res.render('posts',{'docs' : docs});
                            }
      
              else {
                    //NO EMPTY POSTS PAGE !!!!!
                    res.send('no posts');
                   }
              }
    });
});

app.get('/countries',function(req,res){
  res.render('countries');
});

app.get('/routes',function(req,res){
  res.render('routes');
});

app.get('/about',function(req,res){
  misc.findOne({bit:about},function(err,done){
     if(err)
     {

     }
     else
     {
      if(done)
      {
        res.render('about',{'body':done.bbody})
      }
      else {

      }
     }
  });
});

app.get('/contacts',function(req,res){
  misc.findOne({bit:contacts},function(err,done){
     if(err)
     {

     }
     else
     {
      if(done)
      {
        res.render('contacts',{'body':done.bbody})
      }
      else {

      }
     }
  });
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
             if (docs.length>0)
                           {
                           console.log(docs);
                           res.render('adminposts',{'docs' : docs});
                            }
      
              else {
                    res.render('emptyadminposts.jade');
                   }
              }
    });
});

app.post('/dropp/:id',function(req,res){
  var vid = parseInt(req.params.id);
  console.log('DELETING SINGLE POST ID: '+vid);
  var ms = {};
  ms.trouble = 1;
  posts.findOne({id:vid},function(err,doc){
    console.log('query just happened');
    if(err)
    {
      //CALL THE COPS
      res.send(ms);
      console.log('DB ERROR');
    }
    else 
    { if(doc) 
      { console.log('DOC IS PRESENT');
        var oldPath = __dirname + '/public'+doc.headimage;
            console.log('OLD PATH IS: '+oldPath);
            fs.unlink(oldPath, function(){
             if(err) throw err;
             console.log('IMAGE DELETED');
             posts.remove({id:vid},function(err,done){
               if (err) 
               {
                //CALL THE COPS
               }
               else {
                console.log('POST DELETED');
                ms.trouble=0;
                res.send(ms);
               }
             });
               });}
      else
      {res.send(ms);}
    }
  });

});


app.post('/drop/:cc',function(req,res){
  var cc = req.params.cc;
  var p = 'dropthatshit';
  if(req.body.p === p)
  {switch(cc) {
      case('posts'):
        console.log('Dropping images');
          rmDir = function(dirPath, removeSelf) {
            if (removeSelf === undefined)
            removeSelf = true;
            try { var files = fs.readdirSync(dirPath); }
            catch(e) { return; }
            if (files.length > 0)
              for (var i = 0; i < files.length; i++) {
               var filePath = dirPath + '/' + files[i];
               if (fs.statSync(filePath).isFile())
               fs.unlinkSync(filePath);
               else
               rmDir(filePath);
               }
            if (removeSelf)
            fs.rmdirSync(dirPath);
            };
            posts.remove({},function(err,done){
              if(err)
              {
                //CALL THE COPS
              }
              else
              { 
                console.log('POSTS DB DROPPED FROM '+req.ip);
                rmDir(__dirname + '/public/images',false);
                res.redirect('/ap');
              }
            });
      break;
      case('objects'):
        console.log('OBJECTS DB DROPPED FROM '+req.ip);
        objects.remove();
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
        if(req.files.headimage&&vtitle&&vpostbody)
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
                    posts.find({},{ limit:1,sort : { id : -1 } },function (err,doc) { 
                      if(err)
                      {
                        //CALL THE COPS
                      }
                      else

                    { if(doc.length>0)
                      {upload(req.files.headimage.path,req.files.headimage.name); 
                       console.log('headimage uploaded')
                       var dd = new Date();
                       var vday = dd.getDate();
                       var vmonth = dd.getMonth()+1;
                       var vyear = dd.getUTCFullYear();
                       var newid  = doc.id+1;
                       var vvday = vday.toString();
                       if(vvday.length === 1)
                         {vvday='0'+vvday;}
                       var vvmonth = vmonth.toString();
                       if(vvmonth.length === 1)
                         {vvday='0'+vvmonth;}
                       var vsd = vyear.toString()+vvmonth+vvday;
                       vsd = parseInt(vsd);
                       posts.insert({id:newid,title:vtitle,postbody:vpostbody,headimage:vheadimage,sd:vsd,date:{day:vday,month:vmonth,year:vyear}});
                       res.redirect('/');}
                        else{
                          console.log('NO POSTS ID IS GOING TO BE ONE');
                          upload(req.files.headimage.path,req.files.headimage.name); 
                       console.log('headimage uploaded')
                       var dd = new Date();
                       var vday = dd.getDate();
                       var vmonth = dd.getMonth()+1;
                       var vyear = dd.getUTCFullYear();
                       var vvday = vday.toString();
                       if(vvday.length === 1)
                         {vvday='0'+vvday;}
                       var vvmonth = vmonth.toString();
                       if(vvmonth.length === 1)
                         {vvday='0'+vvmonth;}
                       var vsd = vyear.toString()+vvmonth+vvday;
                       vsd = parseInt(vsd);
                       posts.insert({id:1,title:vtitle,postbody:vpostbody,headimage:vheadimage,sd:vsd,date:{day:vday,month:vmonth,year:vyear}});
                       res.redirect('/');
                        }                                      
                                      }

                       
                    });
                  }   
          else {
            res.send('wasnt able to find headimage/title/body')
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
      case('setcontacts'):
       var cbody = req.body.cbody;
       misc.insert({bit:contacts,bbody:cbody});
      break;
      case('setabout'):
       var abody = req.body.abody;
       misc.insert({bit:about,bbody:abody});
      break;
      case('updatecontacts'):
       var cbody = req.body.cbody;
       misc.findOne({bit:contacts},function(err,done){
        if(err){

        }
        else
        {
          if(done)
          {
            misc.update({bit:contacts},{$set:{bbody:cbody}});
            res.redirect('/contacts');
          }
          else{
            //GO AWAY
          }
        }
       });
      break;
      case('updateabout'):
        var cbody = req.body.abody;
       misc.findOne({bit:about},function(err,done){
        if(err){

        }
        else
        {
          if(done)
          {
            misc.update({bit:about},{$set:{bbody:abody}});
            res.redirect('/about');
          }
          else{
            //GO AWAY
          }
        }
       });
      break;
	}
});


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