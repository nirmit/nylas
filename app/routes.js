userUtil = require("./utils/userUtil");
emailUtil = require("./utils/emailUtil");
mailboxUtil = require("./utils/mailboxUtil");
calendarUtil = require("./utils/calendarUtil");
var request = require("request");


module.exports = function(app,passport,appId) {

 
  app.get('/userlist',isAdmin,  function(req, res) {
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
                role : (global.olduser) ? global.olduser.role : req.user.role
            });
        });

  });


  app.get("/switchuser/:uuid", isLoggedIn, function(req, res) {
      userid = req.params.uuid;
      userUtil.switchUser(userid, (success, result) => {
           if(result){
            global.user = result;
            
            if(typeof global.olduser === 'undefined' || !global.olduser){
              global.olduser = req.user;
            }

            if(global.olduser.id == global.user.id){
              global.olduser = null; 
            }

            req.logIn(result,function(err){                
            req.flash('info', 'User Switched Successfully');  
            res.redirect('/userlist');
            });
          }
      });
  }); 
    

  app.get('/reports', isLoggedIn,  function(req, res) {
    mailboxUtil.getList(req.user.id,(success, userlist) => {
      if(success === false) {
          return res.json({error: userlist});
      }
      res.render('reports.ejs',{
        message : '',
        emails : '',
        userlist : userlist,
        role : (global.olduser) ? global.olduser.role : req.user.role,
        report_type : req.body.search_string,
        selected_email : req.body.selected_email,
        seltype : req.body.seltype,
        selmon : req.body.selmon,
        selyear : req.body.selyear

      });
    });
  });  


  app.post('/reports', isLoggedIn,  function(req, res) {
    emailUtil.getEmailListForReports(req.user.id,req.body.selected_email,req.body.seltype,req.body.selmon,req.body.selyear,req.body.search_string,(success, emails) => {
      mailboxUtil.getList(req.user.id,(success, userlist) => {

        var template = '';
        var email_list = emails;
        var email_arr = [];
        if(req.body.search_string == 'd3cloud'){
          template = 'word_cloud.ejs';
        }else if(req.body.search_string == 'bubblechart'){
          template = 'bubblechart.ejs';

          var super_main_array = {}
          super_main_array['name'] = "flare"
          super_main_array['children'] = {}
          
          var tmp_arr = []
          emails.forEach(function(email) {
            var tmp_hash = {}
            tmp_hash.name = (req.body.seltype == 'sent') ? email.to : email.from;
            tmp_hash.size = 1;
            var new_record = true;
            for (var i=0; i < tmp_arr.length; i++) {
              if(tmp_arr[i].name == tmp_hash.name){
                tmp_arr[i].size = tmp_arr[i].size + 1;
                new_record = false;
              }
            }

            if(new_record){
              tmp_arr.push(tmp_hash);  
            }
            
          });
          super_main_array['children'] = tmp_arr;
          email_list = JSON.stringify(super_main_array);
        }else if(req.body.search_string == 'stats'){
          template = 'stats.ejs';
          var sent_count = 0;
          var received_count = 0;
          emails.forEach(function(email) {
            if(req.body.selected_email == email.to){
              sent_count++;
            }else{
              received_count++;
            }
          });
          email_list = {};
          email_list.all_count = emails.length;
          email_list.sent_count = sent_count;
          email_list.received_count = received_count;
        }else if(req.body.search_string == 'wordfrequency'){
          template = 'word_frequency.ejs';
          var super_main_array = {}
          super_main_array['name'] = "flare"
          super_main_array['children'] = {}

          var tmp_arr = []
          emails.forEach(function(email) {
            var string = email.body
            var words = string.replace(/[.]/g, '').split(/\s/);
            var freq = {};
            words.forEach(function(word) {
               if (!freq[word]) {
                freq[word] = 0;
               }
                freq[word] += 1;
            
            var tmp_hash = {}
           
            tmp_hash.name = word
            
            tmp_hash.size = freq[word];
            var new_record = true;

            for (var i=0; i < tmp_arr.length; i++) {
              if(tmp_arr[i].name == tmp_hash.name){
                tmp_arr[i].size = tmp_arr[i].size + 1;
                new_record = false;
              }
            }

            if(new_record && tmp_hash.size > 1 && tmp_hash.name.length > 4){
              tmp_arr.push(tmp_hash);
            }
              
           });
            super_main_array['children'] = tmp_arr;
            email_list = JSON.stringify(super_main_array);
            
           });  

        }else if(req.body.search_string == 'timebubbleline'){
          template = 'timeline_bubble.ejs';

          var super_main_array = {}
          
          var tmp_arr = []
      
          emails.forEach(function(email) {
      
            var tmp_hash = {}
            tmp_hash.Type = email.email_type
            tmp_hash.Shift = (tmp_hash.Type == 'received') ? email.from : email.to;

            var date = new Date(email.date_timestamp)
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = date.getFullYear();
            var month = months[date.getMonth()];
            var datee = date.getDate();
            var hour = date.getHours();
            hour = ("0" + hour).slice(-2);
            
            // tmp_hash.Date = datee + ' ' + month + ' ' + year + ' ' + hour + ':' + min
            tmp_hash.Date = datee + ' ' + month + ' ' + year + ' ' + hour + ':' + '00'
            tmp_hash.Value = 1;
      
            var new_record = true;

            for(var i = 0; i < tmp_arr.length; ++i){
               if(tmp_arr[i].Date == tmp_hash.Date){
                 tmp_arr[i].Value = tmp_arr[i].Value + 1;
                 new_record = false;
               }

            }
            if(new_record){
              tmp_arr.push(tmp_hash);
            }
         
          });
          super_main_array = tmp_arr;
          // return res.json({result:super_main_array})
          email_list = JSON.stringify(super_main_array);
        
        }else if(req.body.search_string == 'circlepacking'){
          template = 'circlepacking.ejs';

          var array = {}
          array['name'] =  req.body.selected_email
          array['children'] = {}

          var main = []      
          
          emails.forEach(function(email) {

            // var mail_cc = email.cc
            // var ele = mail_cc.split(',');
            // console.log(ele.length)

            var one_hash = {}
            one_hash['name'] = (req.body.seltype == 'sent') ? email.to : email.from;
            one_hash['children'] = {}

            var sec_arr = []    
            var sec_hash1 = {}
                sec_hash1['name'] = 'cc'
                sec_hash1['size'] = 10

            var sec_hash2 = {}
                sec_hash2['name'] = 'bcc'
                sec_hash2['size'] = 15

            var sec_hash3 = {}
                sec_hash3['name'] = 'to'
                sec_hash3['size'] = 20

            var sec_hash4 = {}
                sec_hash4['name'] = 'from'
                sec_hash4['size'] = 25
          

            sec_arr.push(sec_hash1, sec_hash2, sec_hash3, sec_hash4 );
            one_hash['children'] = sec_arr

    
            var new_record = true ;

            for (var i=0; i < main.length; i++) {
                if(main[i].name == one_hash.name){
                  new_record = false;
                }
            }

            if(new_record){
               main.push(one_hash);
            }
          });
          array['children'] = main
          email_list = JSON.stringify(array);

        }

        res.render(template,{
          message : '',
          userlist: userlist,
          emails : email_list,
          role : (global.olduser) ? global.olduser.role : req.user.role,
          report_type : req.body.search_string,
          selected_email : req.body.selected_email,
          seltype : req.body.seltype,
          selmon : req.body.selmon,
          selyear : req.body.selyear
        });

      });
     

    });
    
  });
  
  app.get('/logout', (req, res) => {
    req.logout();
    global.olduser = null;
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
         role : (global.olduser) ? global.olduser.role : req.user.role,
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
             role : (global.olduser) ? global.olduser.role : req.user.role,
             mToken : mToken,
             email_type : 'all'
         });
    });    
  });

  app.get('/emailmessages/:mToken/:email_type', isLoggedIn,  function(req, res) {
    var mToken = req.params.mToken;
    var email_type = req.params.email_type
    emailUtil.getEmailTypeList(req.user.id, mToken, email_type, (success, emails) => {
         if(success === false) {
             return res.json({error: emails});
         }
         // return res.json({error : emails})
         sitelink = req.protocol + '://' + req.get('host');
         res.render('email.ejs', {
             emails : emails,
             sitelink : sitelink,
             message : req.flash('info'),
             role : (global.olduser) ? global.olduser.role : req.user.role,
             mToken : mToken,
             email_type : email_type
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
            req.flash('info', 'MailUser Deleted Successfully');
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
        req.flash('info', 'Calendar Deleted Successfully');          
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
          role : (global.olduser) ? global.olduser.role : req.user.role
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
          role : (global.olduser) ? global.olduser.role : req.user.role,
          mToken : mToken
      });
    });
  });


  app.get('/dashboard', isLoggedIn, function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.render('dashboard.ejs',{
      message : '',
      role : (global.olduser) ? global.olduser.role : req.user.role
    });

  });
  

  app.get('/syncuseremails',isLoggedIn,  function(req, res, next) {
      var token = 'DoYNkJaKsL6FBAWD8iwXZYbKKb4IKY';

      var options = { method: 'GET',
        url: 'https://api.nylas.com/messages',
        headers: { authorization: 'Base64 '+token } };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

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
                 role : (global.olduser) ? global.olduser.role : req.user.role,
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
              // return res.json({response: threads[i].cc});
          var id = threads[i].id ? threads[i].id : '';
          var email_type = 'sent';
          var from = threads[i].from[0] ? threads[i].from[0].email : '';
          var to = threads[i].to[0] ? threads[i].to[0].email : '';
          var cc = threads[i].cc ? threads[i].cc : [];
          var bcc = threads[i].bcc ? threads[i].bcc : [];
          var body = threads[i].snippet ? threads[i].snippet : '';
          var date = threads[i].date ? threads[i].date : '';

          var email_cc = '';
          var email_bcc = '';
          
          for(a = 0; a < cc.length; a++){
            if(email_cc == ''){
              email_cc += cc[a].email
            }else{
              email_cc += ', '+cc[a].email
            }
          }

          for(a = 0; a < bcc.length; a++){
            if(email_bcc == ''){
              email_bcc += bcc[a].email
            }else{
              email_bcc += ', '+bcc[a].email
            }
          }

          //(id,mailbox_token,from,to,subject,message,timestamp,user_id)
            emailUtil.addNewEmail(id,token,from,to,email_cc,email_bcc,threads[i].subject,body,date,email_type,req.user.id,(success, result) => {
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

          var cc = threads[i].cc ? threads[i].cc : []
          var bcc = threads[i].bcc ? threads[i].bcc : []
          var body = threads[i].snippet ? threads[i].snippet : ''
          var date = threads[i].date ? threads[i].date : ''


          var email_cc = '';
          var email_bcc = '';
          
          for(a = 0; a < cc.length; a++){
            if(email_cc == ''){
              email_cc += cc[a].email
            }else{
              email_cc += ', '+cc[a].email
            }
          }

          for(a = 0; a < bcc.length; a++){
            if(email_bcc == ''){
              email_bcc += bcc[a].email
            }else{
              email_bcc += ', '+bcc[a].email
            }
          }


          //(id,mailbox_token,from,to,subject,message,timestamp,user_id)
            emailUtil.addNewEmail(id,token,from,to,email_cc,email_bcc,threads[i].subject,body,date,email_type,req.user.id,(success, result) => {               
              if(success === false) {                
                 return res.json({error: result});            
             }
           });
          }
        }
       req.flash('info', 'Messages Fetched Successfully');        
       // res.redirect('/emailmessages/'+token);
       res.redirect('/mailbox');
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
      req.flash('info', 'Calendars Fetched Successfully');
      // res.redirect('/calendars/'+token);
      res.redirect('/mailbox');
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
      req.flash('info', 'Events Fetched Successfully');
      res.redirect('/calendars/'+mailbox_token);
    });

 });


   
  app.get("/removeuser/:uuid",isLoggedIn, function(req, res) {
        userid = req.params.uuid;
        userUtil.RemoveUserfromDB(userid, (success, result) => {
            req.flash('info', 'User Deleted Successfully');
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
                role : (global.olduser) ? global.olduser.role : req.user.role,
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
              req.flash('info', 'User Updated Successfully'); 
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
    app.get('/createuser',isAdmin, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('createuser.ejs', { message: '', firstname: '',lastname: '', email: '', role : (global.olduser) ? global.olduser.role : req.user.role });
    });

    // process the signup form
   // app.post('/createuser', isAdmin, passport.authenticate('local-signup', {
   //    successRedirect : '/createuser', // redirect to the secure profile section
   //    failureRedirect : '/createuser', // redirect back to the signup page if there is an error
   //    failureFlash : true // allow flash messages
   // }));

   //Update User Details
    app.post("/createuser", isAdmin, function(req, res) {
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

          if((req.user.role && req.user.role.toLowerCase() == 'admin') || (global.olduser && global.olduser.role.toLowerCase() == 'admin') ){
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
