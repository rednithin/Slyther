import React, { Component, Fragment } from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import { Layout, Menu, Row, Col, Button } from "antd";
import { observer, inject } from "mobx-react";

import "./App.css";
import SetPassword from "./components/SetPassword.jsx";
import Login from "./components/Login.jsx";
import WatchList from "./components/WatchList.jsx";
import Settings from "./components/Settings.jsx";
import Download from "./components/Download";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const { Item } = Menu;
const { Header, Sider, Content, Footer } = Layout;

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
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners("response::userIsRegistered");
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
        <Route path="/" exact component={WatchList} />
        <Route path="/settings" exact component={Settings} />
        <Route path="/download" exact component={Download} />
        <Redirect from="*" to="/" />
      </Switch>
    );
    let navLinks = (navLinks = (
      <Menu mode="horizontal">
        <Item>
          <NavLink to="/" exact>
            WatchList
          </NavLink>
        </Item>
        <Item>
          <NavLink to="/download" exact>
            Download
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
        <Header style={{ backgroundColor: "white" }}>{navLinks}</Header>
        <Content>
          <Row type="flex" justify="center">
            <Col span="20" style={{ marginTop: 15 }}>
              {routes}
            </Col>
          </Row>
        </Content>
        <Footer>
          <Row type="flex" justify="space-between">
            <Col>Disclaimer: For Educational Purposes only.</Col>
            <Col>
              <Button
                onClick={() => {
                  this.props.myStore.isLoggedIn = false;
                }}
              >
                Logout
              </Button>
            </Col>
          </Row>
        </Footer>
      </Layout>
    );
  }
}

export default App;
