//UserItem Object
class UserItem{

constructor(itemName,itemCode,rating,madeit,catalogCategory){
    this._itemName = itemName;
  //  this._userId = userId;
    this._itemCode = itemCode;
    this._rating = rating;
    this._madeit = madeit;
    this._catalogCategory = catalogCategory;
  }

get catalogCategory(){
    return this._catalogCategory;
  }

set catalogCategory(value){
    this._catalogCategory = value;
  }

get itemName(){
    return this._itemName;
  }

set itemName(value){
    this._itemName = value;
  }

// get userId(){
//     return this._userId;
//   }
//
// set userId(value){
//     this._userId = value;
//   }

get itemCode(){
  return this._itemCode;
}

set itemCode(value){
  this._itemCode = value;
}

get rating() {
    return this._rating;
  }

set rating(value) {
      this._rating = value;
  }

get madeit() {
    return this._madeit;
  }

set madeit(value) {
      this._madeit = value;
  }
}
module.exports = UserItem;
