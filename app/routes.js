userUtil = require("./utils/userUtil");
emailUtil = require("./utils/emailUtil");
calendarUtil = require("./utils/calendarUtil");



module.exports = function(app,passport) {

 
  app.get('/userlist', function(req, res) {
        userUtil.getUserList((success, userllist) => {
            if(success === false) {
                return res.json({error: userllist});
            }
            // res.json({'result':userllist});
            console.log(userllist);
            sitelink = req.protocol + '://' + req.get('host');
            res.render('userlist.ejs', {
                userlist : userllist,
                sitelink : sitelink 
            });
        });
  });
  

  app.get('/home', function(req, res,next) {
     options = {
          redirectURI: 'http://localhost:4000/oauth/callback',                    
          trial: false
      }
      res.render('home.ejs', {
          url: Nylas.urlForAuthentication(options)          
      });

  });


  app.get('/mailbox', function(req, res) {
     res.render('mailbox.ejs');
    });


  app.get('/emailmessages', function(req, res) {
    emailUtil.getEmailList((success, emails) => {
        if(success === false) {
            return res.json({error: emails});
        }
        // res.json({'result':userllist});
        console.log(emails);
        res.render('email.ejs', {
            emails : emails,            
        });
    });    
  });

  
  app.get('/calendarevent', function(req, res) {
     res.render('calendarevent.ejs');
    });

  
  app.get('/reports', function(req, res) {
     res.render('reports.ejs');
    });


  app.get('/dashboard', function(req, res) {
     res.render('dashboard.ejs');
    });
  

  app.get('/syncuseremails', function(req, res, next) {
      var token = req.user.accessToken;
      console.log(token);
      var nylas = Nylas.with(token);
      nylas.threads.list({'in':'inbox'}).then(function(emails) {
        console.log(emails);
        res.json(emails);
      });
  });


  app.get('/calendar', function(req, res, next) {
      var token = req.user.accessToken;
      console.log(token);
      var nylas = Nylas.with(token);
      nylas.calendars.list().then(function(calendars) {
        console.log(calendars);
        res.json(calendars);
      });
    });


  app.get('/oauth/callback', function (req, res, next) {
      if (req.query.code) {
          Nylas.exchangeCodeForToken(req.query.code).then(function(token) {
              console.log(token);
              res.render('dashboard.ejs');
          });

      } else if (req.query.error) {
          res.render('error.ejs', {
              message: req.query.reason,
              error: {
                  status: 'Please try authenticating again or use a different email account.',
                  stack: ''
              }
          });
      }
  });


  app.get('/syncemails',  function(req, res) {
      var token = req.user.accessToken;
      console.log(token);
      var nylas = Nylas.with(token);
    nylas.threads.list({'in':'inbox'}).then(function(threads) {
      if(threads.length > 0){
         for(i = 0; i < threads.length; i++){
             //console.log(threads[i]);          
             //console.log(threads[i].subject);
             //console.log(threads);          
           emailUtil.addNewEmail(threads[i].id, threads[i].subject, threads[i].accountId, (success, result) => {               
             if(success === false) {
                 return res.json({error: result});                 
             }              
           });
         }
       }
       res.redirect('/email');
    });    
  });



  app.get('/emaillist',  function(req, res) {  
    emailUtil.getEmailList((success, emails) => {
        if(success === false) {
            return res.json({error: emails});
        }
        // res.json({'result':userllist});
        console.log(emails);
        res.render('emaillist.ejs', {
            emails : emails,            
        });
    });     
  });
  


 //delete emails
 app.get('/deleteemail/:nylas_id', function(req,res){
      nylas_id = req.params.nylas_id;      
      emailUtil.RemoveEmailfromDB(nylas_id, (success, result) => {          
          res.redirect('/emaillist');
      });
 });


 app.get('/synccalendars',  function(req, res) {
      var token = req.user.accessToken;
      console.log(token);
      var nylas = Nylas.with(token);
    nylas.calendars.list().then(function(calendars) {              
      if(calendars.length > 0){
        for(i = 0; i < calendars.length; i++){
          console.log(calendars[i].id);          
          console.log(calendars[i].name);
          console.log(calendars);          
          calendarUtil.addNewCalendar(calendars[i].id,calendars[i].name, (success, result) => {               
              if(success === false) {
                  return res.json({error: result});         
              }             
          });
        }
      }
      res.redirect('/calendarlist');               
    });      
  });



  app.get('/calendarlist',  function(req, res) {  
    calendarUtil.getCalendarList((success, calendar) => {
        if(success === false) {
            return res.json({error: calendar});
        }
        // res.json({'result':userllist});
        console.log(calendar);
        res.render('calendarlist.ejs', {
            calendar : calendar,            
        });
    });     
  });


  //delete calender
  app.get('/deletecalendar/:nylas_id', function(req,res){
      nylas_id = req.params.nylas_id;      
      calendarUtil.RemoveCalendarfromDB(nylas_id, (success, result) => {          
          res.redirect('/calendarlist');
      });
  }); 


   
  app.get("/removeuser/:uuid", function(req, res) {
        userid = req.params.uuid;
        userUtil.RemoveUserfromDB(userid, (success, result) => {
            res.redirect('/userlist');
        });
  });


  //updateuser   
  app.get("/edituser/:uuid", function(req, res) {
        userid = req.params.uuid;       
        userUtil.getUserDetails(userid, (success, result) => {
         console.log(success)
         console.log(result)          
            res.render('edituser.ejs', {
                userdetails : result,                
                message: '',
                lastname: result.lastname,
                email: result.email,
                phone: result.phone,
                accessToken: result.accessToken,
                firstname: result.firstname
            });
        });
  });


  app.post("/edituser/:uuid", function(req, res) {
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        email = req.body.email,                
        userid = req.body.userid;
        password = req.body.password;
        phone = req.body.phone;
        accessToken = req.body.accessToken;        
        userUtil.updateUserDetails(userid,firstname,lastname, email, password,phone,accessToken, (success, result) => {
            res.redirect('/userlist');
            //res.render('edituser.ejs', {
                //userdetails : result,
                //message : 'User Details Updated'
            //});
            
        });
  });


 app.get('/', function(req, res) {

        
       res.render('login.ejs', { message: req.flash('loginMessage') });

  });
    
 app.post('/', passport.authenticate('local-login', {        
        successRedirect : '/dashboard', 
        failureRedirect : '/', 
        failureFlash : true        
  }));



 // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/createuser', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('createuser.ejs', { message: '', firstname: '',lastname: '', email: '', role:'' });
    });

    // process the signup form
   // app.post('/createuser', isAdmin, passport.authenticate('local-signup', {
   //    successRedirect : '/createuser', // redirect to the secure profile section
   //    failureRedirect : '/createuser', // redirect back to the signup page if there is an error
   //    failureFlash : true // allow flash messages
   // }));

   //Update User Details
    app.post("/createuser", function(req, res) {
        firstname = req.body.firstname,
        lastname = req.body.lastname,   
        email = req.body.email,
        password = req.body.password,
        role = req.body.role;
        isValid = userUtil.isvalidEmail(email);
        if(isValid){
            userUtil.addNewUser(firstname,lastname,email,role, password, (success, result) => {
                res.render('createuser.ejs', {
                    message : result,
                    firstname: firstname,lastname: lastname, email: email, role:role
                });
                // res.json({'name':name, 'email':email, 'role': role, 'result': result});
            });
        }else{
            res.render('createuser.ejs', {
                message : 'Please enter a valid Email.',
                firstname: firstname,lastname: lastname, email: email, role:role
            });            
        }
        
    });



  function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated())
        return next();
    
    res.redirect('/login'); 
  }





}

















