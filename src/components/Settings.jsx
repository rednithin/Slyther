import React, { Component } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  Select,
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
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        const { password } = values;
        if (values.password) {
          ipcRenderer.send("setUserPassword", { password });
        }
        // ipcRenderer.send("setQuality", { quality });
        // this.props.myStore.quality = quality;
        notification.success({
          message: "Success"
        });
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
          {getFieldDecorator("password")(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Set New Password"
            />
          )}
        </FormItem>
        {/* <FormItem>
          {getFieldDecorator("quality", {
            initialValue: this.props.myStore.quality
          })(
            <Select>
              <Option value="480">480p</Option>
              <Option value="720">720p</Option>
              <Option value="1080">1080p</Option>
            </Select>
          )}
        </FormItem> */}
        <FormItem>
          <Button type="primary" htmlType="submit">
            Change Password
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(NormalLoginForm);
