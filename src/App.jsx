import React, { Component, Fragment } from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import { Layout, Menu } from "antd";
import { observer, inject } from "mobx-react";

import "./App.css";
import SetPassword from "./components/SetPassword.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Settings from "./components/Settings.jsx";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const { Item } = Menu;
const { Header, Sider, Content } = Layout;

@inject("myStore")
@observer
class App extends Component {
  componentDidMount() {
    ipcRenderer.send("userIsRegistered", null);
    ipcRenderer.on("response::userIsRegistered", (event, data) => {
      if (data.registered === true) {
        this.props.myStore.userIsRegistered = true;
      }
    });
    ipcRenderer.send("getQuality", null);
    ipcRenderer.on("response::getQuality", (event, data) => {
      this.props.myStore.quality = data.quality;
    });
  }
  render() {
    if (this.props.myStore.userIsRegistered === false) {
      return <SetPassword />;
    }
    if (
      this.props.myStore.userIsRegistered === true &&
      this.props.myStore.isLoggedIn === false
    ) {
      return <Login />;
    }
    let routes = (
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/settings" exact component={Settings} />
        <Redirect from="*" to="/" />
      </Switch>
    );
    let navLinks = (navLinks = (
      <Menu>
        <Item>
          <NavLink to="/" exact>
            Dashboard
          </NavLink>
        </Item>
        <Item>
          <NavLink to="/settings" exact>
            Settings
          </NavLink>
        </Item>
      </Menu>
    ));
    return (
      <Layout style={{ height: "100vh" }}>
        <Sider width={220} style={{ backgroundColor: "white" }}>
          {navLinks}
        </Sider>
        <Content
          style={{
            padding: "14px",
            borderLeftColor: "gray",
            borderLeftWidth: "2px",
            height: "100%"
          }}
        >
          {routes}
        </Content>
      </Layout>
    );
  }
}

export default App;
