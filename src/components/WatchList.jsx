import React, { Component } from "react";
import {
  List,
  Button,
  Popconfirm,
  Table,
  AutoComplete,
  notification,
  Select,
  Card,
  Row,
  Col,
  Input
} from "antd";
import { observer, inject } from "mobx-react";
import Column from "antd/lib/table/Column";

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
    ipcRenderer.on("response::setWatchList", (event, data) => {
      this.props.myStore.series = data;
    });
    ipcRenderer.send("getSeries");
    ipcRenderer.on("response::getSeries", (event, data) => {
      this.setState({ results: data });
    });
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners("response::getWatchList");
    ipcRenderer.removeAllListeners("response::setWatchList");
    ipcRenderer.removeAllListeners("response::getSeries");
  }
  //Table Hooks
  columns = [
    {
      title: "Series Name",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.length - b.title.length
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
    });
  };
  onDelete = link => {
    const data = [...this.state.data].filter(item => item.link !== link);
    this.setState({ data }, () => {
      ipcRenderer.send("setWatchList", data);
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
      <Row type="flex" justify="center">
        <Col span="17" lg={{ span: 10 }}>
          <Card title="Add Anime To WatchList">
            <AutoComplete
              style={{ width: "100%" }}
              dataSource={remainingNames}
              placeholder="Search By Anime Name"
              filterOption={(inputValue, option) =>
                option.props.children
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={this.onSelect}
            />
          </Card>
        </Col>
        <Col span="24" style={{ paddingTop: 20 }}>
          <Table
            pagination={{ pageSize: 4 }}
            bordered
            dataSource={this.state.data}
            columns={this.columns}
          />
        </Col>
      </Row>
    );
  }
}
export default MyComponent;
