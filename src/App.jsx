import React, { Component, Fragment } from "react";
import { Route, Switch, NavLink } from "react-router-dom";
import { Layout } from "antd";

import SetPassword from "./components/SetPassword.jsx";
import Login from "./components/Login.jsx";

const { Header, Sider, Content } = Layout;

class App extends Component {
  state = {
    userIsRegistered: false
  };
  componentDidMount() {
    const electron = window.require("electron");
    const { ipcRenderer } = electron;
    ipcRenderer.send("userIsRegistered", null);
    ipcRenderer.on("response::userIsRegistered", (event, data) => {
      console.log(data.registered);
      if (data.registered === true) {
        this.setState({ userIsRegistered: true });
      }
    });
  }
  render() {
    let navLinks = null;
    let routes = <Route path="/" component={SetPassword} />;
    if (this.state.userIsRegistered === true) {
      routes = <Route path="/" component={Login} />;
    }
    return (
      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            backgroundColor: "white",
            paddingLeft: "30px"
          }}
        >
          Slyther
        </Header>
        <Layout>
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
      </Layout>
    );
  }
}

export default App;
