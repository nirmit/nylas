userUtil = require("./utils/userUtil");
emailUtil = require("./utils/emailUtil");
mailboxUtil = require("./utils/mailboxUtil");
calendarUtil = require("./utils/calendarUtil");
var request = require("request");


module.exports = function(app,passport,appId) {

 
  app.get('/userlist',  function(req, res) {
        userUtil.getUserList((success, userllist) => {
            if(success === false) {
                return res.json({error: userllist});
            }
            // res.json({'result':userllist});
            sitelink = req.protocol + '://' + req.get('host');
            res.render('userlist.ejs', {
                userlist : userllist,
                sitelink : sitelink,
                message : req.flash('info'),
                role : req.user.role
            });
        });

  });  
    

  app.get('/reports', isLoggedIn,  function(req, res) {
    mailboxUtil.getList(req.user.id,(success, userllist) => {
      if(success === false) {
          return res.json({error: userllist});
      }
      res.render('reports.ejs',{
        message : '',
        emails : '',
        userlist : userllist,
        role : req.user.role
      });
    });
  });  


  app.post('/reports', isLoggedIn,  function(req, res) {
    
    emailUtil.getEmailListForReports(req.user.id, req.body.selected_email, (success, emails) => {
      userUtil.getUserList((success, userlist) => {

        var template = '';
        var email_list = '';
        var email_arr = {};
        if(req.body.search_string == 'd3cloud'){
          template = 'word_cloud.ejs';
          email_list = emails;
        }else if(req.body.search_string == 'bubblechart'){
          template = 'bubblechart.ejs';

          var super_main_array = {}
          super_main_array['name'] = "flair"
          super_main_array['children'] = {}

          var tmp_arr = []
          emails.forEach(function(email) {
            var tmp_hash = {}
            tmp_hash.name = email.from;
            tmp_hash.size = 2;
            tmp_arr.push(tmp_hash);
          });
          super_main_array['children'] = tmp_arr;
          email_list = JSON.stringify(super_main_array);
        }else if(req.body.search_string == 'timebubbleline'){
          template = 'timeline_bubble.ejs';
          email_list = emails;
        }else if(req.body.search_string == 'wordfrequency'){
          template = 'wordfrequency.ejs';
          email_list = emails;
        }

        res.render(template,{
          message : '',
          userlist: userlist,
          emails : email_list,
          role : req.user.role
        });

      });
     

    });
    
  });
  
  app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.redirect('/');
  });

  // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
          successRedirect : '/dashboard',
          failureRedirect : '/', // redirect back to the signup page if there is an error
          failureFlash : true // allow flash messages
  }));

  app.get('/mailbox', isLoggedIn, function(req, res) {

    mailboxUtil.getList(req.user.id, (success, list) => {
        options = {
          redirectURI: process.env.REDIRECT_URI,                
          //redirectURI: 'http://localhost:4000/oauth/callback',
          trial: false
      }
      sitelink = req.protocol + '://' + req.get('host');
      res.render('mailbox.ejs',{
         url: Nylas.urlForAuthentication(options),
         message : req.flash('info'),
         role : req.user.role,
         sitelink : sitelink,
         user : req.user,
         list : list
      });

    })
  });

  app.get('/emailmessages/:mToken', isLoggedIn,  function(req, res) {
    var mToken = req.params.mToken;
    emailUtil.getEmailList(req.user.id, mToken, (success, emails) => {
         if(success === false) {
             return res.json({error: emails});
         }
         // return res.json({error : emails})
         sitelink = req.protocol + '://' + req.get('host');
         res.render('email.ejs', {
             emails : emails,
             sitelink : sitelink,
             message : req.flash('info'),
             role : req.user.role,
             mToken : mToken
         });
    });    
  });


  app.post("/deleteemail/:mToken",isLoggedIn, function(req, res) {
        var mToken = req.params.mToken;
        emailUtil.deleteEmails(mToken, (success, result) => {
            res.redirect('/mailbox');
        });
  });


  app.get("/deletemailbox/:mToken",isLoggedIn, function(req, res) {
        var mToken = req.params.mToken;
        mailboxUtil.deleteMailbox(mToken, (success, result) => {
            req.flash('info', 'Deleted MailUser Successfully');
            res.redirect('/mailbox');
        });
  });  




  //delete calendar
  app.get('/deletecalendar/:nylas_id',isLoggedIn, function(req,res){
      var nylas_id = req.params.nylas_id;
             
      calendarUtil.deletecalendar(nylas_id, (success, result) => {
        if(success === false) {
            return res.json({error: result});
        }
        req.flash('info', 'Deleted Calendar Successfully');          
        res.redirect('/mailbox');
      });
  });
  

  app.get('/calendarevents/:calendar_id', isLoggedIn, function(req, res) {
    var calendar_id = req.params.calendar_id;
    calendarUtil.getEventList(calendar_id,(success, events) => {
      if(success === false) {
          return res.json({error: calendar});
      }
      // res.json({'result':userllist});
      res.render('calendarevents.ejs', {
          events : events,
          message : '',
          role : req.user.role
      });
    });
  });

  
  app.get('/calendars/:mToken', isLoggedIn, function(req, res) {
    var mToken = req.params.mToken;
    calendarUtil.getCalendarList(mToken,(success, calendars) => {
      if(success === false) {
          return res.json({error: calendar});
      }
      // res.json({'result':userllist});
      sitelink = req.protocol + '://' + req.get('host');
      res.render('calendars.ejs', {
          calendars : calendars,
          sitelink : sitelink,
          message : req.flash('info'),
          role : req.user.role,
          mToken : mToken
      });
    });
  });


  app.get('/dashboard', isLoggedIn, function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.render('dashboard.ejs',{
      message : '',
      role : req.user.role
    });

  });
  

  app.get('/syncuseremails',isLoggedIn,  function(req, res, next) {
      var token = 'DoYNkJaKsL6FBAWD8iwXZYbKKb4IKY';

      console.log(token);

      var options = { method: 'GET',
        url: 'https://api.nylas.com/messages',
        headers: { authorization: 'Base64 '+token } };

      console.log(options);  
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
      });                 
  });


  app.get('/calendar', isLoggedIn,  function(req, res, next) {
      var token = req.user.token;
      var nylas = Nylas.with(token);
      nylas.calendars.list().then(function(calendars) {
        res.json(calendars);
      });
    });

  app.get('/oauth/callback', isLoggedIn, function (req, res, next) {
      if (req.query.code) {
          Nylas.exchangeCodeForToken(req.query.code).then(function(token) {
           var nylas = Nylas.with(token);
           nylas.account.get().then(function(model) {
            mailboxUtil.addNewRecord(req.user.id, model.accountId, model.emailAddress, model.name, token, (success, result) => {

              mailboxUtil.getList(req.user.id, (success, list) => {
                options = {
                  // redirectURI: process.env.REDIRECT_URI,
                  redirectURI: 'http://localhost:4000/oauth/callback',
                  trial: false
                }
               res.render('mailbox.ejs',{
                 url: Nylas.urlForAuthentication(options),
                 message : 'Email authorized successfully.',
                 role : req.user.role,
                 user : req.user,
                 list : list
              });

             })

            });
          });

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


  app.get('/fetch_emails/:mToken',isLoggedIn, function(req, res) {
      var token = req.params.mToken;
      var nylas = Nylas.with(token);

      nylas.messages.list({'in':'sent'}).then(function(threads) {
        if(threads.length > 0){
         for(i = 0; i < threads.length; i++){
             // return res.json({response: threads[0]});
              
          var id = threads[i].id ? threads[i].id : ''
          var email_type = 'sent'
          var from = threads[i].from[0] ? threads[i].from[0].email : ''
          var to = threads[i].to[0] ? threads[i].to[0].email : ''
          var cc = threads[i].cc[0] ? threads[i].cc[0].email : ''
          var bcc = threads[i].bcc[0] ? threads[i].bcc[0].email : ''
          var body = threads[i].snippet ? threads[i].snippet : ''
          var date = threads[i].date ? threads[i].date : ''
          //(id,mailbox_token,from,to,subject,message,timestamp,user_id)
            emailUtil.addNewEmail(id,token,from,to,cc,bcc,threads[i].subject,body,date,email_type,req.user.id,(success, result) => {               
              if(success === false) {                
                 return res.json({error: result});            
             }
           });
          }
        }
    });

    nylas.messages.list({'in':'inbox'}).then(function(threads) {
        if(threads.length > 0){
         for(i = 0; i < threads.length; i++){
             // return res.json({response: threads[0]});
              
          var id = threads[i].id ? threads[i].id : ''
          var email_type = 'received'
          var from = threads[i].from[0] ? threads[i].from[0].email : ''
          var to = threads[i].to[0] ? threads[i].to[0].email : ''
          var cc = threads[i].cc[0] ? threads[i].cc[0].email : ''
          var bcc = threads[i].bcc[0] ? threads[i].bcc[0].email : ''
          var body = threads[i].snippet ? threads[i].snippet : ''
          var date = threads[i].date ? threads[i].date : ''
          //(id,mailbox_token,from,to,subject,message,timestamp,user_id)
            emailUtil.addNewEmail(id,token,from,to,cc,bcc,threads[i].subject,body,date,email_type,req.user.id,(success, result) => {               
              if(success === false) {                
                 return res.json({error: result});            
             }
           });
          }
        }
       req.flash('info', 'Fetched Messages Successfully');        
       res.redirect('/emailmessages/'+token);
    });
  });



 app.get('/fetch_calendars/:mToken',isLoggedIn,  function(req, res) {
      var token = req.params.mToken;
      var nylas = Nylas.with(token);
    nylas.calendars.list().then(function(calendars) {      
      if(calendars.length > 0){
        for(i = 0; i < calendars.length; i++){                                
          calendarUtil.addNewCalendar(calendars[i].id,token,calendars[i].account_id,calendars[i].name,calendars[i].description, (success, result) => {            
            if(success === false) {
                return res.json({error: result});                
            }
          });

        }
      }
      req.flash('info', 'Fetched Calendars Successfully');
      res.redirect('/calendars/'+token);      
    });
  });


 app.get('/fetch_event_details/:calendar_id/:mailbox_token',isLoggedIn,  function(req, res) {

    var calendar_id = req.params.calendar_id;
    var mailbox_token = req.params.mailbox_token;
    var nylas = Nylas.with(mailbox_token);
    nylas.events.list({calendar_id:calendar_id}).then(function(events) {
      // return res.json({response: events});

      if(events.length > 0){
        for(i = 0; i < events.length; i++){          
          calendarUtil.addNewEvent(events[i],mailbox_token, (success, result) => {
            if(success === false) {
                return res.json({error: result});
            }
          });
        }
      }
      req.flash('info', 'Fetched Events Successfully');
      res.redirect('/calendars/'+mailbox_token);
    });

 });


   
  app.get("/removeuser/:uuid",isLoggedIn, function(req, res) {
        userid = req.params.uuid;
        userUtil.RemoveUserfromDB(userid, (success, result) => {
            req.flash('info', 'Deleted User Successfully');
            res.redirect('/userlist');
        });
  });

  //updateuser   
  app.get("/edituser/:uuid",isLoggedIn, function(req, res) {
        userid = req.params.uuid;       
        userUtil.getUserDetails(userid, (success, result) => {
            res.render('edituser.ejs', {
                userdetails : result,                
                message: '',
                firstname: result.firstname,
                lastname: result.lastname,
                email: result.email,
                role : req.user.role,
                user_role : result.role,          
            });   
        });
    });
  


  app.post("/edituser/:uuid",isLoggedIn, function(req, res) {    
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        email = req.body.email,                
        userid = req.body.userid;
        password = req.body.newPassword;
        confirmPassword = req.body.confirmPassword;
        role = req.body.role;
        // isValid = userUtil.isvalidEmail(email);
                      
          userUtil.updateUserDetails(userid,firstname,lastname, email, password,role, (success, result) => { 
              res.redirect('/userlist');       
          }); 
    
  });


  app.get('/', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');

    if(req.isAuthenticated()){
      res.redirect('/dashboard')
    }else{
      res.render('login.ejs', { message: req.flash('loginMessage') });  
    }
  });
    
  app.post('/', passport.authenticate('local-login', {        
        successRedirect : '/dashboard', 
        failureRedirect : '/', 
        failureFlash : true,

        role : 'User',
        user : global.user

  }));


 // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/createuser',isLoggedIn, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('createuser.ejs', { message: '', firstname: '',lastname: '', email: '', role : req.user.role });
    });

    // process the signup form
   // app.post('/createuser', isAdmin, passport.authenticate('local-signup', {
   //    successRedirect : '/createuser', // redirect to the secure profile section
   //    failureRedirect : '/createuser', // redirect back to the signup page if there is an error
   //    failureFlash : true // allow flash messages
   // }));

   //Update User Details
    app.post("/createuser",isAdmin, function(req, res) {
        firstname = req.body.firstname,
        lastname = req.body.lastname,   
        email = req.body.email,
        password = req.body.password,
        role = req.body.role;
        isValid = userUtil.isvalidEmail(email);
        if(isValid){
            userUtil.addNewUser(firstname,lastname,email,password, role, (success, result) => {
                res.render('createuser.ejs', {
                    message : result,
                    firstname: firstname,lastname: lastname, email: email, role: req.user.role
                });
                // res.json({'name':name, 'email':email, 'role': role, 'result': result});
            });
        }else{
            res.render('createuser.ejs', {
                message : 'Please enter a valid Email.',
                firstname: firstname,lastname: lastname, email: email, role: req.user.role
            });            
        }
        
    });



  function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated()){
      // return res.json({user: global.user});
      return next();
    }
    
    res.redirect('/'); 
  }

  // route middleware to make sure a user is logged in
  function isAdmin(req, res, next) {

      // if user is authenticated in the session, carry on 
      if (req.isAuthenticated()){

          if(req.user.role && req.user.role.toLowerCase() == 'admin'){
              return next();
          }else{
              // if they aren't redirect them to the restricted page
              res.render('dashboard.ejs',{
                message : 'You are not authorized to access this page.',
                role : req.user.role
              }); 
          }
      }else{
         // if they aren't redirect them to the home page
          res.redirect('/');  
      }    
  }

}
