import React, { Component } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  Row,
  Col,
  Card,
  notification
} from "antd";
import { inject, observer } from "mobx-react";

const FormItem = Form.Item;
const electron = window.require("electron");
const { ipcRenderer } = electron;

@inject("myStore")
@observer
class NormalLoginForm extends Component {
  componentDidMount() {
    ipcRenderer.on("response::checkUserPassword", (event, data) => {
      if (data.access) {
        this.props.myStore.isLoggedIn = true;
        notification.success({
          message: "Success"
        });
      } else {
        notification.error({
          message: "Wrong Password"
        });
      }
    });
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);

        ipcRenderer.send("checkUserPassword", values);
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row type="flex" justify="center">
        <Col span="24" lg={{ span: 8 }} md={{ span: 12 }}>
          <Card title="Login" style={{ marginTop: "50px" }}>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator("password", {
                  rules: [
                    { required: true, message: "Please input your Password!" }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    type="password"
                    placeholder="Password"
                  />
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  Login
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
