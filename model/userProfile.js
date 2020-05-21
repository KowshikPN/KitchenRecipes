var UserItem = require('./userItem');

//var userdb = require('../utility/UserDB');
//userProfile Object
class UserProfile
{
  constructor(userId){
  this._userId = userId;
  this._userItemlist = [];

}
get userId() {
    return this._userId;
}

set userId(value) {
    this._userId = value;
}

get userItemlist(){
  return this._userItemlist;
}

set userItemlist(value){
  this._userItemlist = value;
}

addItem(item){
  var items = this._userItemlist;
  var count=0;
  var n=0;
  n = items.length;
  if(n>0){
  for (let i = 0; i < n; i++) {
      if(items[i].itemName!=item.itemName){
        count++;
        if(count==n){
          items.push(item);
        }
      }
  }
}
else{
  items.push(item);
}
 this._userItemlist=items;
}
removeItem(userItem){
  if (userItem instanceof UserItem) {
      this._userItemlist.filter(function (item) {
          return item != userItem;
      });
  } else {
      console.log('Error in removing items !!!');
  }
};

updateItem(userItem){
  if (userItem instanceof UserItem) {
      var index = this._userItemlist.findIndex((e) => e.item.itemCode === userItem.item.itemCode);
      if (index === -1) {
          console.log('Cannot Find the item in the list');
      }
       else {
          this._userItemlist[index] = userItem;
      }
  } else {
      console.log('Error in updating the Item')
  }
};

getItems(){
return this._userItemlist;
};

emptyProfile(){
  this._userItemlist = [];
}
}
module.exports = UserProfile;
