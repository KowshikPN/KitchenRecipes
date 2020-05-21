var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());
var { check } = require('express-validator/check');
const { validationResult } = require('express-validator/check');

var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var Item = require('../model/Item');
var User = require('../model/User');
var UserProfile = require('../model/userProfile');
var UserItem = require('../model/userItem');
var ProfileController = require('./ProfileController');


/* Database connection*/
mongoose.connect('mongodb://localhost:27017/kitchenrecipes', {useNewUrlParser: true});
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("I am Connected!");
});
var Schema = mongoose.Schema;
var itemdataschema = new Schema({
  itemCode: Number,
  itemName: String,
  catalogCategory: String,
  description: String,
  rating: Number,
  imgUrl: String
},{collection: 'Items'});

var userdataschema = new Schema({
  userId: Number,
  firstName: String,
  lastName: String,
  emailAddress: String,
  address1Field: String,
  address2Field: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  userItemList: [{itemName: String, itemCode: Number, rating: Number, catalogCategory: String, madeIt: Boolean}],
  password: String},
  {collection: 'Users'});

var itemsdata = mongoose.model('itemsdata',itemdataschema);
var usersdata = mongoose.model('usersdata', userdataschema);

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({
    extended: false
}));

var user = null;
var userProfile = null;

router.use(function getSession(req, res, next) {
    console.log("router.use");
    if (req.session.theUser) {
        var tmp = req.session.theUser;
        console.log("I am tmp here in router use"+ JSON.stringify(tmp));
        user = new User(tmp[0]._userId, tmp[0]._firstName, tmp[0]._lastName, tmp[0]._emailAddress, tmp[0]._address1Field,
            tmp[0]._address2Field, tmp[0]._city, tmp[0]._state,tmp[0]._zipCode, tmp[0]._country);
        userProfile = new UserProfile(tmp[0]._userId);
        for (var k = 0; k < tmp[0].userItemList.length; k++) {
            var userItem = new UserItem(tmp[0].userItemList[k].itemName,
                tmp[0].userItemList[k].itemCode,
                tmp[0].userItemList[k].rating,
                tmp[0].userItemList[k].madeIt,
                tmp[0].userItemList[k].catalogCategory);
            userProfile.addItem(userItem);
        }
    } else {
        user = null;
        userProfile = null;
    }
    next();
});

router.get('/',function(req,res){
  var user = req.session.theUser;
  var logVal = req.session.theUser;
  console.log("/ route session : "+req.session.theUser);
  res.render('index',{data: user, logVal:logVal});
});

router.get('/categories',function(req,res){
  var data = {};
  var logVal = req.session.theUser;
  console.log("session : "+req.session.theUser);
  var category = itemsdata.distinct('catalogCategory');
     category.then(function(doc){
       data.categories = doc;
       getAllItems.then(function(docs){
           data.items = docs;
           console.log("Data : "+data);
           res.render('categories',{data:data, logVal:logVal});
         });
     });
});

router.get('/about',function(req,res){
  res.render('about',{data: req.session.theUser,logVal: req.session.theUser});
});

router.get('/redirect',function(req,res){

res.render('login',{data:"",logVal: req.session.theUser});

});

router.post('/check',function(req,res){
  uname = req.body.username;
  pwd = req.body.password;
  console.log("I am username :"+ uname);
  console.log("I am password :"+ pwd);

  req.check('username','Enter a valid email address.').isEmail().normalizeEmail().trim();
  req.check('password','Enter a valid password.').isLength({min:3,max:8}).trim().escape();
  var errors = req.validationErrors();
  if(errors){
    console.log("The following are the errors: ");
    for(var i = 0; i < errors.length; i++){
    console.log(JSON.stringify(errors[i].msg));
    }
    var msg = "Either username or password are incorrect. Please try again.";
    res.render('login',{data:msg,logVal: req.session.theUser});
  }
  else{
    usersdata.find({emailAddress: uname,password: pwd})
    .then(function(doc){
      if(doc != ""){
        console.log("I am doc in check :"+doc);
      req.session.theUser = doc;
      res.redirect('/myItems');
    }
    else{
      var msg = "Either username or password are incorrect. Please try again."
      res.render('login',{data:msg,logVal: req.session.theUser})
    }
    });
  }
});

router.get('/myItems',function(req,res){
 if (req.session.theUser) {
    var data = {
        title: 'myItems',
        path: req.url,
        user: user,
        userProfile: userProfile
    };
    console.log("Inside myItems Controller "+ JSON.stringify(userProfile));
    res.render('myItems', {
        data: data,logVal: req.session.theUser
    });
}
else{
  res.render('login',{data:"",logVal: req.session.theUser});
}
});

router.get('/categories/item/:itemCode/feedback',check('itemCode').isNumeric(), function (req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log("Invalid input Error");
    return res.redirect('/categories');
  }
    var itemcode = req.params.itemCode;
    if(itemcode > 6 || itemcode < 1){
      res.redirect('/categories');
    }
    getItem(itemcode).then(function(doc){
      console.log("I am inside feedback"+doc);
      var data = {item: doc};
      console.log('path : ',data.item[0]);
      res.render('feedback', {
          data: data,logVal: req.session.theUser
      });
    });
});

router.get('/contact',function(req,res){
  res.render('contact',{data: req.session.theUser,logVal: req.session.theUser});
});

router.get('/categories/item/:itemCode',check('itemCode').isNumeric(),function(req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log("Invalid input Error");
    return res.redirect('/categories');
  }
    var itemCode = req.params.itemCode;
    console.log("Item Code: "+itemCode);
    if(itemCode == "undefined"){
      itemCode = 1
    }
    if(itemCode > 6 || itemCode < 1){
      data = {}
      var category = itemsdata.distinct('catalogCategory');
      category.then(function(doc){
        data.categories = doc;
        getAllItems.then(function(docs){
            data.items = docs;
            console.log("From category itemcode: "+data.items);
            res.render('categories',{data:data, logVal: req.session.theUser});
          });
      });
    }
    else{
        getItem(itemCode).then(function(docs){
            data = docs;
            res.render('item',{data: data,logVal: req.session.theUser});
          });
      }
});

router.get('/item',function(req,res){
  res.render('item',{logVal: req.session.theUser});
});


// router.get('/myItems/:itemCode',check('itemCode').isNumeric(),function(req,res){
//
//   var itemCode = req.params.itemCode;
//   // var item = itemDb.getItem(itemCode);
//   res.render('myItems', { data: item,logVal: req.session.theUser});
// });

var getItem = function(itemCode){
return new Promise(function(resolve,reject){
  var items = [];
  itemsdata.find({itemCode: itemCode})
    .then(function(doc){
      for(var i=0;i<doc.length;i++){
        var item = new Item(doc[i].itemCode,
                doc[i].itemName,
                doc[i].catalogCategory,
                doc[i].description,
                doc[i].rating,
                doc[i].getimageURL,
                doc[i].ingredients);

          items.push(item);
      }
      resolve(doc);
      return items;

    }).catch(function(err){
      reject(err);
    });

});
}

var getAllItems = new Promise(function(resolve,reject){
  var items = [];
  itemsdata.find()
    .then(function(doc){
      for(var i=0;i<doc.length;i++){
        var item = new Item(doc[i].itemCode,
                doc[i].itemName,
                doc[i].catalogCategory,
                doc[i].description,
                doc[i].rating,
                doc[i].getimageURL,
                doc[i].ingredients);

          items.push(item);

      }
      resolve(doc);
      return items;

    }).catch(function(err){
      reject(err);
    });

});

var getAllUsers = new Promise(function(resolve,reject){
  var items = [];
  usersdata.find()
    .then(function(doc){
      for(var i=0;i<doc.length;i++){
        var item = new User(doc[i].userId,
                doc[i].firstName,
                doc[i].lastName,
                doc[i].emailAddress,
                doc[i].address1Field,
                doc[i].address2Field,
                doc[i].city,
                doc[i].state,
                doc[i].zipCode,
                doc[i].country,
                doc[i].password);
          items.push(item);
      }
      resolve(doc);
      return items;
    }).catch(function(err){
      reject(err);
    });

});

var getUser = function(userId){
return new Promise(function(resolve,reject){
  var items = [];
  usersdata.find({userId: userId})
    .then(function(doc){
      for(var i=0;i<doc.length;i++){
        var item = new User(doc[i].userId,
                doc[i].firstName,
                doc[i].lastName,
                doc[i].emailAddress,
                doc[i].address1Field,
                doc[i].address2Field,
                doc[i].city,
                doc[i].state,
                doc[i].zipCode,
                doc[i].country,
                doc[i].password);
          items.push(item);
      }
      resolve(doc);
      return items;

    }).catch(function(err){
      reject(err);
    });
});
}
module.exports = router;
