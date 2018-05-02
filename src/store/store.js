import { observable, action } from "mobx";

class Store {
  @observable userIsRegistered = false;
  @observable isLoggedIn = false;
  @observable quality = "480";
}

export default Store;
