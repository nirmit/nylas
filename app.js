var dotenv = require('dotenv/config');
var express = require( 'express' );
var http = require( 'http' );
var app = express();
app.use(express.static(__dirname + '/public'));
var mongoose = require('mongoose');
var path = require('path');
app.set( 'port', process.env.PORT || 4000 );
var passport = require('passport');
var flash = require('connect-flash');
var url = process.env.MONGODB_URI;

mongoose.connect(url,function(err){
	if(err){
		console.log(err);

	} else{
		console.log("connected to mongodb");
	}
}); 

require('./config/passport')(passport);


var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');


app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());
global.Nylas = require('nylas').config({
   appId: process.env.API_ID,
   appSecret: process.env.API_SECRET
});

require('./app/routes.js')(app,passport,process.env.API_ID);

http.createServer( app ).listen( app.get( 'port' ), function (){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});
