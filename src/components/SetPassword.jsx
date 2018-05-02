import React, { Component } from "react";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import { observer, inject } from "mobx-react";
const electron = window.require("electron");
const { ipcRenderer } = electron;

const FormItem = Form.Item;

@inject("myStore")
@observer
class NormalLoginForm extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);

        ipcRenderer.send("setUserPassword", values);
        this.props.myStore.userIsRegistered = true;
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your Password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            Set Password
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(NormalLoginForm);
