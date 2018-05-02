import React, { Component, Fragment } from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import { Layout } from "antd";
import SetPassword from "./components/SetPassword.jsx";
import Login from "./components/Login.jsx";
import "./App.css";
const { Header, Sider, Content } = Layout;

class App extends Component {
  state = {
    userIsRegistered: false,
    isLoggedIn: false
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
    if (this.state.userIsRegistered === false) {
      return <SetPassword />;
    }
    if (
      this.state.userIsRegistered === true &&
      this.state.isLoggedIn === false
    ) {
      return <Login />;
    }
    let routes = (
      <Switch>
        <Route path="/" exact component={Login} />
        <Redirect from="/*" to="/" />
      </Switch>
    );
    let navLinks = null;
    return (
      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            backgroundColor: "white",
            paddingLeft: "30px"
          }}
        >
          <span>Slyther</span>
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
