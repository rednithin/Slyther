import React, { Component } from "react";
import {
  List,
  Button,
  Popconfirm,
  Table,
  AutoComplete,
  notification,
  Select,
  Input
} from "antd";
import { observer, inject } from "mobx-react";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const { Search } = Input;
const { Option } = Select;

@inject("myStore")
@observer
class MyComponent extends Component {
  state = {
    data: [],
    results: [],
    visible: false
  };

  // Life Cycle Hooks.
  async componentDidMount() {
    ipcRenderer.send("getWatchList");
    ipcRenderer.on("response::getWatchList", (event, data) => {
      this.setState({ data }, () => {
        this.props.myStore.series = this.state.data;
      });
    });
    ipcRenderer.send("getSeries");
    ipcRenderer.on("response::getSeries", (event, data) => {
      this.setState({ results: data });
    });
  }

  //Table Hooks
  columns = [
    {
      title: "Series Name",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "Actions",
      dataIndex: "",
      key: "x",
      render: record => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => this.onDelete(record.link)}
        >
          <a>Delete</a>
        </Popconfirm>
      )
    }
  ];

  onSelect = title => {
    const element = this.state.results.filter(item => item.title === title);
    const data = [...this.state.data, element[0]];
    this.setState({ data }, () => {
      ipcRenderer.send("setWatchList", data);
      this.props.myStore.series = this.state.data;
    });
  };
  onDelete = link => {
    const data = [...this.state.data].filter(item => item.link !== link);
    this.setState({ data }, () => {
      ipcRenderer.send("setWatchList", data);
      this.props.myStore.series = this.state.data;
    });
  };

  // Final Render Function
  // TODO Remove id's while describing
  render() {
    let { results, data } = this.state;
    results = results.map(element => element.title);
    data = data.map(element => element.title);
    const remainingNames = results.filter(item => data.indexOf(item) < 0);

    return (
      <div>
        <AutoComplete
          style={{ width: 200 }}
          dataSource={remainingNames}
          placeholder="Add an Anime to the list."
          filterOption={(inputValue, option) =>
            option.props.children
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
          onSelect={this.onSelect}
        />
        <Table bordered dataSource={this.state.data} columns={this.columns} />
      </div>
    );
  }
}
export default MyComponent;
