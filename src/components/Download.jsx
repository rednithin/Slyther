import React, { Component } from "react";
import { Select, Button } from "antd";
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
        <Select
          style={{ width: 250 }}
          onChange={this.handleEpisodeChange}
          value={this.state.selectedEpisode}
        >
          {Array(+this.state.selectedSerie.maxEpisodes)
            .fill()
            .map((elem, index) => index + 1)
            .map(elem => <Option value={elem}>{elem}</Option>)}
        </Select>
      );
    }
    if (this.state.episode !== null) {
      showDownload = (
        <div>
          {Object.keys(this.state.episode).map(quality => (
            <Button
              onClick={() => {
                shell.openExternal(this.state.episode[quality].url);
              }}
            >
              {quality}
            </Button>
          ))}
        </div>
      );
    }
    return (
      <div>
        <Select style={{ width: 250 }} onChange={this.handleSerieChange}>
          {this.props.myStore.series.map(serie => (
            <Option value={JSON.stringify(serie)}>{serie.title}</Option>
          ))}
        </Select>
        {selectEpisode}
        <br />
        <br />
        {showDownload}
      </div>
    );
  }
}

export default Download;
