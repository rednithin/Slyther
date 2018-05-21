import { observable, action } from "mobx";

class Store {
  @observable userIsRegistered = false;
  @observable isLoggedIn = false;
  @observable series = [];
}

export default Store;
