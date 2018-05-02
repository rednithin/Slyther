import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";
import registerServiceWorker from "./registerServiceWorker";

import { Provider } from "mobx-react";
import Store from "./store/store";

import createBrowserHistory from "history/createBrowserHistory";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import { Router } from "react-router";

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const store = new Store();

const stores = {
  routingStore: routingStore,
  myStore: store
};

const history = syncHistoryWithStore(browserHistory, routingStore);

ReactDOM.render(
  <Provider {...stores}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
