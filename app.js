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
  ,posts = db.get('posts'),images = db.get('images'),objects = db.get('objects');misc = db.get('misc');
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
      if(done.length >0)
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
          res.render('emptyindex');
         }       
      }
    });
      }
      else
       {
        res.render('emptyindex');
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
     images.count({video:0},function(err,vimages){
      if (err)
      {
        res.send('Problems with IMAGES db');
      }
      else {
        var imgnum = vimages;
        misc.count({bit:'album'},function(err,albums){
          if (err)
          {
            res.send('Problems with MISC db');
          }
          else {
            var albumnum = albums;
            images.count({video:1},function(err,videos){
               if (err)
               {
                 res.send('Problems with IMAGES db');
               }
               else {
                    var videonum = videos;
                    posts.count({},function(err,postsnum){
                       if (err)
                       {
                         res.send('Problems with POSTS db');
                       }
                       else {
                  // WHY ASSIGN EACH A VARIABLE ? JUST PASS EM STRAIGHT
                 console.log('STATS FOR ADMIN ARE: IMAGES - '+imgnum+', ALBUMS - '+albumnum+', VIDEOS - '+videonum+',POSTS - '+postsnum);
                 res.render('admin',{'imgn':imgnum,'albumn':albumnum,'videon':videonum,'postsn':postsnum});
                  }
               });
               }     
            });
          }
        });
      }
     });
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
                    res.render('emptyposts');
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
  misc.findOne({bit:'about'},function(err,done){
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
        res.render('emptyabout');
      }
     }
  });
});

app.get('/contacts',function(req,res){
  misc.findOne({bit:'contacts'},function(err,done){
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
        res.render('emptycontacts');
      }
     }
  });
});

app.get('/gall',function(req,res){
  misc.find({bit:'album'},function(err,done){
    if(err){
     // CALL THE COPS 
    }
    else {
        console.log(done);
        if(done.length>0)
        {
           res.render('gallery',{'albums':done});
        }
        else {
           res.render('emptygallery');
        }
    }
  });
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

app.get('/dangerous/:key',function(req,res){
  var vkey = 'people';
  switch(req.params.key){
    case('people'):
  misc.remove({bit:'album'},function(err,done){
      if(err){
        res.send('error while dropping misc db');
      }
      else {
        res.send('albums dropped');
      }
    });
  break;
  case('animals'):
  images.remove({},function(err,done){
    if(err){
        res.send('error while dropping images db');
      }
      else {
        res.send('images dropped');
      }
  });
  break;
  }
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
                rmDir(__dirname + '/public/postimages',false);
                res.redirect('/ap');
              }
            });
      break;
      case('objects'):
        console.log('OBJECTS DB DROPPED FROM '+req.ip);
        objects.remove({},function(err,done){
              if(err)
              {
                //CALL THE COPS
              }
              else
              { 
        res.redirect('/redact');
              }
              });
      break;
      

             }
            }
  else
    {res.send('wrong p/l');}

});

// AN IMPORTANT NOTICE 
//
// IMAGES WHICH ARE UPLOADED TO BE USED IN POSTS GO TO ALBUM ID=0
//
//
app.get('/gallery/albums/:album',function(req,res){
  var valbum = parseInt(req.params.album);
  misc.findOne({bit:'album',id:valbum},function(err,done){
    if(err)
    {
      // CALL THE COPS
    }
    else
    {
      if(done.length>0)
      {
        images.find({albumid:valbum},function(err,donetwo){
          if(err)
          {
            //CALL THE COPS
          }
          else {
            if(donetwo.length>0){
              res.render('album',{'images':donetwo});
            }
            else {
              res.redirect('http://maleshin.com/')
            }
          }
        });
      }
      else
      {
        res.redirect('http://maleshin.com');
      }
    }
  });
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
        console.log(req.files.headimage.path+' - path, and name :'+req.files.headimage.name);
        if(req.files.headimage&&vtitle&&vpostbody)
         {function upload(filepath,imageid){
                            console.log(filepath);
                            console.log('hey im here !');
                            var oldPath = filepath;
                            console.log('UPLOAD 1 step, oldPath:'+ oldPath);
                            var newPath = __dirname +"/public/postimages/"+ imageid;
                            vheadimage = "/postimages/"+ imageid;
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
        //THIS WAS IMPLEMENTED UNDER '/dropp/:post', PROBABLY NEEDS TO BE TRANSFERED HERE
      break;
      case('addroute'):
      break;
      case('removeroute'):
      break;
      case('addphotobulk'):
        function uploadbulk(photofile,dbhandle){
                 var oldPath = photofile.path;
                 var imageid = photofile.name;
                 console.log('UPLOAD 1 step, oldPath:'+ oldPath);
                 var newPath = __dirname +"/public/images/"+ imageid;
                 console.log('UPLOAD 2 step, newPath:' + newPath );
                 fs.readFile(oldPath , function(err, data) {
                  if(err) throw err;
                   console.log('we read');
                   fs.writeFile(newPath, data, function(err) {
                      if(err) throw err;
                      console.log('we write');
                       fs.unlink(oldPath, function(err){
                           if(err) throw err;
                           console.log('UPLOAD '+imageid+"file uploaded to: " + newPath);
                           dbhandle;
                             });
                   }); 
                 }); 
               };
        var aid = parseInt(req.body.aid);
        var vcountry = req.body.country; 
        if(!aid||!vcountry||!req.files.photo)
        {
          //BREAK SHOULD BE HERE
          console.log(aid+' , '+vcountry+' , '+req.files.photo);
        }
        images.find({},{ limit:1,sort : { fid : -1 } },function(err,done){
          if(err)
          {
           //CALL THE COPS
          }
          else{
            if(done.length>0){
              for (yy=0;yy<req.files.photo.length;yy++) {
                   function dbfilereg(){
                    var newfid = done[0].fid+yy+1;
                    console.log(newfid);
                    var vfilename = req.files.photo[yy].name;
                    images.insert({fid:newfid,country:vcountry,comment:0,albumid:aid,filename:vfilename,video:0});}
                    uploadbulk(req.files.photo[yy],dbfilereg());
                  }
                    misc.findOne({bit:'album',id:aid},function(err,donetwo){
                      console.log('see if it has found something: '+JSON.stringify(donetwo));
                      if(err)
                      {
                        //CALL THE COPS
                      }
                      else {
                        var newimgqntt = donetwo.imgqntt + req.files.photo.length;
                        misc.update({bit:'album',id:aid},{$set:{imgqntt:newimgqntt}});
                        if(donetwo.pimgpath)
                            {
                              //REDIRECT TO ALBUM PAGE (WHICH DOESNT EXIST YET) NEEDED
                              res.redirect('http://maleshin.com/gall');
                            }
                            else{
                              var vpimgpath = '/images/'+req.files.photo[0].name;
                              misc.update({bit:'album',id:aid},{$set:{pimgpath:vpimgpath}});
                              misc.findOne({bit:'album',id:aid},function(err,donethree){
                               if(err){
                                res.send('db error');
                               }
                               else{
                                console.log('see it prints something: '+donethree);
                                res.redirect('http://maleshin.com/gall')
                               }
                              });
                            }
                      }
                  });
              }
            else {
              for (yy=0;yy<req.files.photo.length;yy++) {
                   function dbfilereg(){
                    var newfid =yy+1;
                    var vfilename = req.files.photo[yy].name;
                    images.insert({fid:newfid,country:vcountry,comment:0,albumid:aid,filename:vfilename,video:0});}
                    uploadbulk(req.files.photo[yy],dbfilereg());
                  }
                    misc.findOne({bit:'album',id:aid},function(err,donetwo){
                      if(err)
                      {
                        //CALL THE COPS
                      }
                      else {
                        var newimgqntt = donetwo.imgqntt + req.files.photo.length;
                        misc.update({bit:'album',id:aid},{$set:{imgqntt:newimgqntt}});
                        if(donetwo.pimgpath)
                        {
                          //REDIRECT TO ALBUM PAGE (WHICH DOESNT EXIST YET) NEEDED
                          res.redirect('http://maleshin.com/gall');
                        }
                        else{
                          var vpimgpath = '/images/'+req.files.photo[0].name;
                          misc.update({bit:'album',id:aid},{$set:{pimgpath:vpimgpath}});
                          res.redirect('http://maleshin.com/gall');
                        }
                      }
                  });
            }
          }
        });
      break;
      case('addphoto'):
        // ADD FS WIRTE
        var vcomment= req.body.vcomment;
        if(!vcommment)
        {
          vcomment = 0;
        }
        var aid = parseInt(req.body.aid);
        var vcountry = req.body.country; 
        var vfilename = req.files.photo.name;
        images.find({},{ limit:1,sort : { fid : -1 } },function(err,done){
          if(err)
          {

          }
          else{
            if(done.length>0){
             var newid = done.fid+1;
             images.insert({fid:newfid,country:vcountry,comment:vcomment,albumid:aid,filename:vfilename,video:0});
             misc.findOne({bit:'album',id:aid},function(err,done){
              if(err)
              {
                //CALL THE COPS
              }
              else {
                var newimgqntt = done.imgqntt + 1;
                misc.update({bit:'album',id:aid},{$set:{imgqntt:newimgqntt}});
              }
             });
            }
            else{
              images.insert({fid:1,country:vcountry,comment:vcomment,albumid:aid,filename:vfilename,video:0});
               misc.findOne({bit:'album',id:aid},function(err,done){
              if(err)
              {
                //CALL THE COPS
              }
              else {
                var newimgqntt = done.imgqntt + 1;
                misc.update({bit:'album',id:aid},{$set:{imgqntt:newimgqntt}});
                if(done.pimgpath)
                {
                  //REDIRECT TO ALBUM PAGE (WHICH DOESNT EXIST YET) NEEDED
                  res.redirect('http://maleshin.com/gall');
                }
                else{
                  var vpimgpath = '/images/'+vfilename;
                  misc.update({bit:'album',id:aid},{pimgpath:vpimgpath});
                }
              }
             });
            }
          }
        });
      break;
      case('updatephoto'):
        var vfid = parseInt(req.body.fid);
        var vcomment = req.body.comment;
        images.update({fid:vfid},{$set:{comment:vcomment}});
        //SUCCESS CONFIRMATION NEEDS TO BE ADDED
      case('addalbum'):
        misc.find({bit:'album'},{ limit:1,sort : { id : -1 } },function (err,done)
          {  var ms ={};
               ms.trouble=1;
               ms.mtext='db';
            if(err)
           {
            res.send(ms);
           }
           else 
            { var valbumname = req.body.albumname;
              if(done.length>0)
              {
              console.log('-----PREVIOUS ID IS: '+done[0].id+'---------')
               var newid = done[0].id+1;
               misc.insert({bit:'album',id:newid,albumname:valbumname,imgqntt:0});
               console.log('WRITTEN TO ALBUMS WITH CALCULATED ID');
               misc.find({bit:'album'},{limit:1,sort:{id:-1}},function (err,donetwo){
                 if (err)
                 {
                   //CALL THE COPS
                   res.send(ms);
                             }
                 else {
                   if(donetwo.length>0){
                     ms.trouble=0;
                     ms.mbody=donetwo;
                     res.send(ms);
                   }
                   else {
                     ms.mtext='empty';
                     res.send(ms);
                   }
                 }
               });
                                            }
              else{
                misc.insert({bit:'album',id:1,albumname:valbumname,imgqntt:0});
                console.log('WRITTEN TO ALBUMS WITH ID 1');
                var ms ={};
                ms.trouble=1;
                ms.mtext='db';
                misc.find({bit:'album'},{limit:1,sort:{id:-1}},function (err,donetwo){
                  if (err)
                  {
                    //CALL THE COPS
                    res.send(ms);
                              }
                  else {
                    if(donetwo.length>0){
                      ms.trouble=0;
                      ms.mbody=donetwo;
                      res.send(ms);
                    }
                    else {
                      ms.mtext='empty';
                      res.send(ms);
                    }
                  }
                });
              }
                              }
                  });
      break;
      case('addvideo'):
        images.find({video:1},{ limit:1,sort : { id : -1 } },function (err,done){
             if(err)
             {
              //CALL THE COPS
             }
             else {
              var dd = new Date();
              var vday = dd.getDate();
              var vmonth = dd.getMonth()+1;
              var vyear = dd.getUTCFullYear();
              var vtitle = req.body.vtitle;
              if(done.length>0)
              {var newid = done.vid+1;
               images.insert({video:1,id:newid,vbody:vidbody,filename:req.files.video.name,uploaddate:{day:vday,month:vmonth,year:vyear},title:vtitle});}
               else {
                images.insert({video:1,id:1,vbody:vidbody,filename:req.files.video.name,uploaddate:{day:vday,month:vmonth,year:vyear},title:vtitle});}
               }             
             });
      break;
      case('updatealbum'):
        misc.update
      break;
      case('albums'):
        var ms ={};
        ms.trouble=1;
        ms.mtext='db';
        misc.find({bit:'album'},{id:-1},function (err,done){
          if (err)
          {
            //CALL THE COPS
            res.send(ms);
                      }
          else {
            if(done.length>0){
              ms.trouble=0;
              ms.mbody=done;
              res.send(ms);
            }
            else {
              ms.mtext='empty';
              res.send(ms);
            }
          }
        });
      break;
      case('removealbum'):
        console.log('into albums remove');
        var aid = parseInt(req.body.albumid);      
        //FS REMOVE MUT BE ADDED TO ACTUALY DELETE THE IMAGES NOT JUST THEIR RECORDS
        var ms = {};
        ms.trouble = 0;
        ms.mtext = 'success';
        images.find({albumid:aid},function(err,twodone){
           if(err)
           {
            ms.trouble=1;
            ms.mtext='db';
            res.send(ms);
           }
           else
           {
            if(twodone.length>0)
            {
              for (var image in twodone) {
                           var filename = image.filename; 
                           if(!filename){
                            res.send(ms);
                            break;
                           }
                           var oldPath = __dirname + '/public/images/'+ filename;
                           fs.unlink(oldPath, function(err){
                              if(err) throw err;
                              console.log('REMOVING AN ALBUM ('+AID+') - IMAGE DELETED');
                           });
  
                   }
               images.remove({albumid:aid},function(err,done){
                    if(err)
                    {
                      ms.trouble=1;
                      ms.mtext='db';
                      res.send(ms);
                    }
                    else
                    {
                      misc.remove({bit:'album',id:aid},function(err,doneremove){
                        if(err)
                        {
                          ms.trouble=1;
                          ms.mtext='db';
                          res.send(ms);
                        }
                        else {
                         //INDICATE A SUCCESS
                         res.send(ms);
                        }
                      });
                    }
                  });    
            }
            else{
              console.log('SEARCH ON ALBUM '+aid+' RESULTED IN WHAT APPEARS TO BE AN EMPTYNESS')
              ms.trouble =1;
              ms.mtext = 'empty';
              res.send(ms)
            }
           }
        });
      break;
      case('removephoto'):
        var vpid = parseInt(req.body.pid);

        //FS REMOVE MUST BE ADDED
        images.findOne({pid:vpid},function(err,donethree){
          var aid = donethree.albumid;
          var filename = donethree.filename; 
          var oldPath = __dirname + '/public/images/'+ filename;
          fs.unlink(oldPath, function(){
             if(err) throw err;
             console.log('IMAGE DELETED');
              images.remove({pid:vpid},function(err,done){
                 if(err)
                 {
                   //CALL THE SOPS
                 }
                 else
                 {
                   misc.findOne({bit:'album',id:aid},function(err,donetwo){
                    if(err)
                    {
                      //CALL THE COPS
                    }
                    else {
                      var newimgqntt = donetwo.imgqntt - 1;
                      misc.update({bit:'album',id:aid},{$set:{imgqntt:newimgqntt}});
                      res.redirect('/redact');
                    }
                   });
                 }
              }); 
          });
        });
        
      break;
      case('removevideo'):
        var vvid =parseInt(req.body.vid);
        //FS REMOVE MUST BE ADDED
        images.remove({vid:vvid},function(err,done){
          if(err)
          {
            //SCREAM
          }
          else
          {
           res.redirect('/redact');
          }
        });
      break;
      case('setcontacts'):
       var cbody = req.body.cbody;
       misc.insert({bit:'contacts',bbody:cbody});
      break;
      case('setabout'):
       var abody = req.body.abody;
       misc.insert({bit:about,bbody:abody});
      break;
      case('updatecontacts'):
       var cbody = req.body.cbody;
       misc.findOne({bit:'contacts'},function(err,done){
        if(err){

        }
        else
        {
          if(done)
          {
            misc.update({bit:'contacts'},{$set:{bbody:cbody}});
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
       misc.findOne({bit:'about'},function(err,done){
        if(err){

        }
        else
        {
          if(done)
          {
            misc.update({bit:'about'},{$set:{bbody:abody}});
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

app.post('/misc',function(req,res){
  console.log('INTO MISC');
  var cause = req.body.cause;
  switch (cause)
    {case('albums'):
         var ms = {};
         ms.trouble = 1;
         ms.mtext = 'db'
         misc.find({bit:'album'},function(err,done){
          if(err)
          {
            //CALL THE COPS
            res.send(ms);
          }
          else
          {
            if(done.length>0)
            { 
              ms.trouble = 0;
              ms.results = done;
              res.send(ms);
            }
            else
            {
             ms.mtext='empty'; //send none, "EMPTY YET", SO ADDALBUM BUTTON CAN BE PUT IN PLACE 
             res.send(ms);
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