var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var { check } = require('express-validator/check');
const { validationResult } = require('express-validator/check');


var User = require('../model/user');
var UserProfile = require('../model/userProfile');
var UserItem = require('../model/userItem');

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

var itemsdata1 = mongoose.model('itemsdata1',itemdataschema);
var usersdata1 = mongoose.model('usersdata1', userdataschema);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


router.get('/login', function (req, res) {
     if (req.session.theUser) {
         console.log('User already logged in');
         res.redirect('/');
     }
     else {
       userId = 1;
       getUser(userId).then(function(doc){
         req.session.theUser = doc;
         console.log('SignIn FirstTime');
         res.redirect('/myItems')
       });
    }
});

router.get('/logout', function (req, res) {
  if (req.session.theUser) {
      req.session.destroy();
      res.redirect('/');
    }
  });

router.get('/categories/item/saveIt/:itemCode',check('itemCode').isNumeric(), function (req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log("Invalid input Error");
    return res.redirect('/categories');
  }
    var itemcode = req.params.itemCode;
    if(itemcode > 6 || itemcode < 1){
      console.log("Enter valid itemcode");
      res.redirect('/categories');
    }
    if (req.session.theUser) {
      user = req.session.theUser;
      console.log("I am session data"+ JSON.stringify(user));
      console.log("I am session user"+ JSON.stringify(user[0].userItemList[0]));
      console.log("I am userId here :"+ user[0].userId);
      console.log("I am itemCode here "+ itemcode);

      // db.Users.findOne({'userItemList.itemCode':4});
      usersdata1.findOne({'userItemList.itemCode':itemcode}).then(function(doc){
        console.log(" i am doc here"+doc);
          if(doc == null){
  //db.Users.update({userId:1},
  //{$push:{'userItemList':{itemCode:5,itemName: "TomatoRice",catalogCategory:"Main Course",rating:3,madeIt: false}}});
  //let items = [];
            getItem(itemcode).then(function(docs){
              var madeIt = false;
                usersdata1.findOneAndUpdate({userId:user[0].userId},
                  {$push:{userItemList:{itemCode:docs[0].itemCode,
                    itemName: docs[0].itemName,
                    catalogCategory:docs[0].catalogCategory,
                    rating:docs[0].rating,madeIt: madeIt}}},{new:true})
                    .then(function(doc){
                      console.log("Data after update: "+doc);
                      var out = [];
                      out.push(doc);
                      req.session.theUser = out;
                      res.redirect('/myItems');
                    });
            });
          }
          else{
            console.log('Item Already present');
            res.redirect('/myItems');
          }
      });
    }
    else {
          res.render('login',{data:"",logVal:req.session.theUser});
            // userId = 1;
            // getUser(userId).then(function(doc){
            //   req.session.theUser = doc;
            //   user = req.session.theUser;
            //   });
            //   usersdata1.findOne({'userItemList.itemCode':itemcode}).then(function(doc){
            //     console.log(" i am else part doc here"+doc);
            //       if(doc == null){
            //         getItem(itemcode).then(function(docs){
            //           var madeIt = false;
            //             usersdata1.findOneAndUpdate({userId:user[0].userId},
            //               {$push:{userItemList:{itemCode:docs[0].itemCode,
            //                 itemName: docs[0].itemName,
            //                 catalogCategory:docs[0].catalogCategory,
            //                 rating:docs[0].rating,madeIt: madeIt}}},{new:true})
            //                 .then(function(doc){
            //                   console.log("Data after update in else part: "+doc);
            //                   var out = [];
            //                   out.push(doc);
            //                   req.session.theUser = out;
            //                   res.redirect('/myItems');
            //                 });
            //         });
            //       }
            //       else{
            //         console.log('already present');
            //         res.redirect('/myItems');
            //       }
            //   });
           }
});

//db.Users.findOneAndUpdate({userId:1,'userItemList.itemCode':1},{$set:{'userItemList.$.rating':5}});

router.post('/update/feedback/:itemCode', function (req, res) {
  var itemcode = req.params.itemCode;
  var rating = req.body.rating;
  var madeIt = req.body.madeItRadio;
  var status = req.body.feedbackHidden;
  console.log("feedbackHidden: "+madeIt);
  console.log("Rating: "+rating);
  if(req.session.theUser){
    user = req.session.theUser;
    usersdata1.findOne({'userItemList.itemCode':itemcode}).then(function(doc){
      if(doc == null){
        console.log("Item not present in the userlist");
        res.redirect('/myItems')
      }
      else{
        if(status == "rating"){
          console.log("User ID: "+user[0].userId);
          addItemRating(user[0].userId,itemcode,rating)
          .then(function(docs){
            console.log("New rating "+docs.userItemList.length);
            var length = docs.userItemList.length;
            for(var i = 0;i < length; i++){
              code = docs.userItemList[i].itemCode;
              console.log("I am code here: "+ code);
              if(code == itemcode){
                itemsdata1.findOneAndUpdate({itemCode:itemcode},{$set:{'rating':docs.userItemList[i].rating}},{new:true})
                .then(function(val){
                  console.log("Sending Rating to Item database"+ val.rating);
                });
                break;
              }
            }

             var items = [];
            items.push(docs);
            req.session.theUser = items;
            res.redirect('/myItems');
          });
        }
        else if(status == "madeIt"){
          console.log("User ID: "+user[0].userId);
          addMadeIt(user[0].userId,itemcode,madeIt)
          .then(function(docs){
            var items = [];
            items.push(docs);
            req.session.theUser = items;
            res.redirect('/myItems');
          });
        }
        }
    });
  }
  else{
    userId = 1;
    getUser(userId).then(function(doc){
      req.session.theUser = doc;
      var user = req.session.theUser;
      console.log("I am at line 226"+user);
      usersdata1.findOne({'userItemList.itemCode':itemcode}).then(function(doc){
        if(doc == null){
          console.log("Item not present in the userlist");
          res.redirect('/myItems')
        }
        else{
          if(status == "rating"){
            console.log("User ID: "+user[0].userId);
            addItemRating(user[0].userId,itemcode,rating)
            .then(function(docs){
              console.log("New rating "+docs.userItemList.length);
              var length = docs.userItemList.length;
              for(var i = 0;i < length; i++){
                code = docs.userItemList[i].itemCode;
                console.log("I am code here: "+ code);
                if(code == itemcode){
                  itemsdata1.findOneAndUpdate({itemCode:itemcode},{$set:{'rating':docs.userItemList[i].rating}},{new:true})
                  .then(function(val){
                    console.log("Sending Rating to Item database"+ val.rating);
                  });
                  break;
                }
              }
               var items = [];
              items.push(docs);
              req.session.theUser = items;
              res.redirect('/myItems');
            });
          }
          else if(status == "madeIt"){
            console.log("User ID: "+user[0].userId);
            addMadeIt(user[0].userId,itemcode,madeIt)
            .then(function(docs){
              var items = [];
              items.push(docs);
              req.session.theUser = items;
              res.redirect('/myItems');
            });
          }
          }
    });

});

  }
});


router.get('/myItems/delete/:itemCode', function (req, res) {
    var itemcode = req.params.itemCode;
    if (req.session.theUser) {
      user = req.session.theUser;
      usersdata1.findOne({'userItemList.itemCode':itemcode}).then(function(doc){
        console.log(" i am doc here"+doc);
        //delete query using $pull
        //db.Users.findOneAndUpdate({'userId':1},{$pull:{'userItemList':{'itemCode':5}}});
            getItem(itemcode).then(function(docs){
                usersdata1.findOneAndUpdate({userId:user[0].userId},
                  {$pull:{userItemList:{itemCode:docs[0].itemCode}}},{new:true})
                    .then(function(doc){
                      console.log("Data after Deleting: "+doc);
                      var out = [];
                      out.push(doc);
                      req.session.theUser = out;
                      res.redirect('/myItems');
                    });
            });
        });
    }
    else
     {
        res.redirect('/');
    }
});

var getItem = function(itemCode){
return new Promise(function(resolve,reject){
  var items = [];
  itemsdata1.find({itemCode: itemCode})
    .then(function(doc){
      for(var i=0;i<doc.length;i++){
        var item = new UserItem(doc[i].itemCode,
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

var getUser = function(userId){
return new Promise(function(resolve,reject){
  var items = [];
  console.log("Inside getUser"+ userId);
  usersdata1.find({userId: userId})
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
      console.log("Inside ProfileController database"+ items);
      return items;
    }).catch(function(err){
      reject(err);
    });
});
}


var addItemRating = function(userId,itemCode,rating){
return new Promise(function(resolve,reject){
  var items = [];
  console.log("Inside getUser"+ userId);
  usersdata1.findOneAndUpdate({userId: userId,'userItemList.itemCode':itemCode},{$set:{'userItemList.$.rating':rating}},{new:true})
    .then(function(doc){
      resolve(doc);
      console.log("Inside addItemRating "+doc);
      return doc;
    }).catch(function(err){
      reject(err);
    });
});
}

var addMadeIt = function(userId,itemCode,madeIt){
return new Promise(function(resolve,reject){
  var items = [];
  console.log("Inside getUser"+ userId);
  usersdata1.findOneAndUpdate({userId: userId,'userItemList.itemCode':itemCode},{$set:{'userItemList.$.madeIt':madeIt}},{new:true})
    .then(function(doc){
      resolve(doc);
      console.log("Inside addMadeIt "+doc);
      return doc;
    }).catch(function(err){
      reject(err);
    });
});
}
module.exports.router = router;
