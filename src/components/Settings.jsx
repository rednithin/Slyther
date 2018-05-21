import React, { Component } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  Select,
  Row,
  Col,
  Card,
  notification
} from "antd";
import { inject, observer } from "mobx-react";

const FormItem = Form.Item;
const electron = window.require("electron");
const { ipcRenderer } = electron;

const { Option } = Select;

@inject("myStore")
@observer
class NormalLoginForm extends Component {
  componentDidMount() {
    ipcRenderer.send("getWatchList");
    ipcRenderer.on("response::getWatchList", (event, data) => {
      this.props.myStore.series = data;
    });
    ipcRenderer.on("response::checkUserPassword", (event, data) => {
      if (data.access) this.props.myStore.isLoggedIn = true;
    });
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners("response::getWatchList");
    ipcRenderer.removeAllListeners("response::checkUserPassword");
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        const { password } = values;
        if (values.password) {
          ipcRenderer.send("setUserPassword", { password });
        }
        notification.success({
          message: "Success"
        });
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row type="flex" justify="center">
        <Col span="24" lg={{ span: 8 }} md={{ span: 12 }}>
          <Card title="Change Password">
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator("password")(
                  <Input
                    prefix={
                      <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    type="password"
                    placeholder="Type New Password"
                  />
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  Change Password
                </Button>
              </FormItem>
            </Form>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(NormalLoginForm);
