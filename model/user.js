//user Object
class User{
  constructor(userId,firstName,lastName,emailAddress,address1Field,address2Field,city,state,zipCode,country,password){
    this._userId=userId;
    this._firstName=firstName;
    this._lastName=lastName;
    this._emailAddress=emailAddress;
    this._address1Field=address1Field;
    this._address2Field=address2Field;
    this._city=city;
    this._state=state;
    this._zipCode=zipCode;
    this._country=country;
    this._password = password;
  }

  get userId() {
      return this._userId;
  }

  set userId(value) {
    this._userId = value;
  }

  get password() {
      return this._password;
  }

  set password(value) {
    this._password = value;
  }


  get firstName() {
      return this._firstName;
  }

  set firstName(value) {
      this._firstName = value;
  }

  get lastName() {
      return this._lastName;
  }

  set lastName(value) {
      this._lastName = value;
  }

  get emailAddress() {
      return this._emailAddress;
  }

  set emailAddress(value) {
      this._emailAddress = value;
  }

  get address1Field() {
      return this._address1Field;
  }

  set address1Field(value) {
      this._address1Field = value;
  }

  get address2Field() {
      return this._address2Field;
  }

  set address2Field(value) {
      this._address2Field = value;
  }

  get city() {
      return this._city;
  }

  set city(value) {
      this._city = value;
  }

  get state() {
      return this._state;
  }

  set state(value) {
      this._state = value;
  }
  get zipCode() {
      return this._zipCode;
  }

  set zipCode(value) {
      this._zipCode = value;
  }

  get country() {
      return this._country;
  }

  set country(value) {
      this._country = value;
  }
}
module.exports = User;
