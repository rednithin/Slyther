import React, { Component } from "react";
import {
  List,
  Button,
  Popconfirm,
  Table,
  Modal,
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
    filteredResults: [],
    visible: false
  };

  // Life Cycle Hooks.
  async componentDidMount() {
    ipcRenderer.on("response::getSeries", (event, data) => {
      this.setState({ results: data });
    });
    ipcRenderer.send("getWatchList");
    ipcRenderer.on("response::getWatchList", (event, data) => {
      this.setState({ data });
    });
  }

  // Modal Form Hooks.
  showModal = () => {
    this.setState({
      visible: true
    });
  };
  handleOk = e => {
    console.log("Handle OK FUNCTION", this.state.filteredResults);
    this.setState({
      visible: false
    });
    const data = [...this.state.data, ...this.state.filteredResults];
    this.setState({ data }, () => {
      ipcRenderer.send("setWatchList", data);
      this.setState({ results: [], filteredResults: [] });
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
      results: [],
      filteredResults: []
    });
  };

  //Table Hooks
  columns = [
    {
      title: "Series Name",
      dataIndex: "seriesName",
      key: "seriesName"
    },
    {
      title: "Actions",
      dataIndex: "",
      key: "x",
      render: record => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => this.onDelete(record.id)}
        >
          <a>Delete</a>
        </Popconfirm>
      )
    }
  ];

  handleSearch = async query => {
    ipcRenderer.send("getSeries", { query });
  };

  handleSelect = selected => {
    const filteredResults = this.state.results.filter(result => {
      return selected.indexOf(result.id) > -1;
    });
    this.setState({ filteredResults });
  };
  onDelete = async id => {
    const data = [...this.state.data].filter(item => item.id !== id);
    this.setState({ data }, () => {
      ipcRenderer.send("setWatchList", data);
    });
  };

  // Final Render Function
  // TODO Remove id's while describing
  render() {
    return (
      <div>
        <div>
          <Button
            style={{ marginBottom: "20px" }}
            type="primary"
            onClick={this.showModal}
          >
            Add
          </Button>
          <Modal
            title="Basic Modal"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <Search
              placeholder="Searcg for Anime."
              onSearch={this.handleSearch}
              style={{ width: 200 }}
            />
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Anime to add to watchlist."
              onChange={this.handleSelect}
            >
              {this.state.results.map(result => (
                <Option key={result.id} value={result.id}>
                  {result.seriesName}
                </Option>
              ))}
            </Select>
          </Modal>
        </div>
        <Table
          bordered
          dataSource={this.state.data}
          columns={this.columns}
          // expandedRowRender={record => {
          // return (
          //     <List
          //       itemLayout="horizontal"
          //       dataSource={Object.keys(record)}
          //       renderItem={key => (
          //         <List.Item>
          //           <span style={{ width: "100px" }}>
          //             <strong>{key}</strong>
          //           </span>
          //           <span>{record[key]}</span>
          //         </List.Item>
          //       )}
          //     />
          //   );
          // }}
        />
      </div>
    );
  }
}
export default MyComponent;
