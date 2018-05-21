import React, { Component } from "react";
import { Select, Button, Row, Col, Card } from "antd";
import { observer, inject } from "mobx-react";

const electron = window.require("electron");
const { ipcRenderer, shell } = electron;

const { Option } = Select;

@inject("myStore")
@observer
class Download extends Component {
  componentDidMount() {
    ipcRenderer.send("getWatchList");
    ipcRenderer.on("response::getWatchList", (event, data) => {
      this.props.myStore.series = data;
    });
    ipcRenderer.on("response::getEpisode", (event, data) => {
      this.setState({ episode: data });
    });
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners("response::getWatchList");
    ipcRenderer.removeAllListeners("response::getEpisode");
  }
  state = {
    episode: null,
    selectedSerie: null,
    selectedEpisode: null
  };
  handleSerieChange = value => {
    this.setState({
      selectedSerie: JSON.parse(value),
      selectedEpisode: null,
      episode: null
    });
  };
  handleEpisodeChange = selectedEpisode => {
    this.setState({ selectedEpisode }, () => {
      const { title } = this.state.selectedSerie;
      const { selectedEpisode } = this.state;
      ipcRenderer.send("getEpisode", { title, selectedEpisode });
    });
  };
  render() {
    let selectEpisode = null;
    let showDownload = null;
    if (this.state.selectedSerie !== null) {
      selectEpisode = (
        <Col
          span="17"
          lg={{ span: 10 }}
          style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}
        >
          <Card title="Episode">
            <Select
              style={{ width: "100%" }}
              placeholder="Select Episode"
              onChange={this.handleEpisodeChange}
              value={this.state.selectedEpisode}
            >
              {Array(+this.state.selectedSerie.maxEpisodes)
                .fill()
                .map(
                  (elem, index) =>
                    index + +this.state.selectedSerie.startEpisode
                )
                .map(elem => (
                  <Option
                    value={elem - this.state.selectedSerie.startEpisode + 1}
                  >
                    {elem}
                  </Option>
                ))}
            </Select>
          </Card>
        </Col>
      );
    }
    if (this.state.episode !== null) {
      showDownload = (
        <Col
          span="17"
          lg={{ span: 10 }}
          style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}
        >
          <Card title="Download">
            <Row type="flex" justify="space-between">
              {Object.keys(this.state.episode).map(quality => (
                <Col>
                  <Button
                    onClick={() => {
                      shell.openExternal(this.state.episode[quality]);
                    }}
                  >
                    {quality}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      );
    }
    return (
      <Row type="flex" justify="space-around">
        <Col
          span="17"
          lg={{ span: 10 }}
          style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}
        >
          <Card title="Series">
            <Select
              style={{ width: "100%" }}
              placeholder="Select Series"
              onChange={this.handleSerieChange}
            >
              {this.props.myStore.series.map(serie => (
                <Option value={JSON.stringify(serie)}>{serie.title}</Option>
              ))}
            </Select>
          </Card>
        </Col>
        {selectEpisode}
        {showDownload}
      </Row>
    );
  }
}

export default Download;
