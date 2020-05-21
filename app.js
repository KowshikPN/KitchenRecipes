var path = require('path');
var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require('body-parser');
var session = require('express-session');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({ secret: 'kitcehenrecipes', resave: true, saveUninitialized: true}));

var home = require('./routes/controller');
var ProfileController = require('./routes/ProfileController');
app.use('/',home);
app.use('/', ProfileController.router);
app.all('/update*', ProfileController.router);
module.exports = app;
app.listen(8000);
console.log('Server is listening at port 8000');
