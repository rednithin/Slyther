const electron = require("electron");
const fse = require("fs-extra");
const fs = require("fs");
const passwordHash = require("password-hash");
const path = require("path");
const url = require("url");

const { ipcMain, Menu, app, BrowserWindow } = electron;

const HorribleSubs = require("horriblesubs-api");
const horribleSubs = new HorribleSubs();
// Module to control application life.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "Ctrl+Q",
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      {
        label: "Toggle Developer Tools",
        accelerator: "Ctrl+Shift+I",
        click: (item, focusedWindow) => {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
];

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 700,
    title: "Slyther - Anime Downloader"
  });

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:3000");

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const database = "./database/";
const passPath = "./database/password.txt";
const qualityPath = "./database/quality.txt";
const watchListPath = "./database/watchlist.txt";
const fixedLength = 3000;

const watchListKeys = ["link", "slug", "title", "maxEpisodes"];

ipcMain.on("userIsRegistered", (event, data) => {
  if (fse.pathExistsSync(passPath)) {
    mainWindow.webContents.send("response::userIsRegistered", {
      registered: true
    });
  } else {
    mainWindow.webContents.send("response::userIsRegistered", {
      registered: false
    });
  }
});

ipcMain.on("setUserPassword", (event, data) => {
  fse.removeSync(passPath);
  fse.writeFileSync(passPath, passwordHash.generate(data.password));
});

// ipcMain.on("setQuality", (event, data) => {
//   fse.removeSync(qualityPath);
//   fse.writeFileSync(qualityPath, data.quality);
// });

// ipcMain.on("getQuality", () => {
//   if (fse.pathExistsSync(qualityPath)) {
//     const quality = fse.readFileSync(qualityPath).toString();
//     mainWindow.webContents.send("response::getQuality", {
//       quality
//     });
//   } else {
//     mainWindow.webContents.send("response::getQuality", {
//       quality: "480"
//     });
//   }
// });

ipcMain.on("checkUserPassword", (event, data) => {
  const hashedPassword = fse.readFileSync(passPath).toString();
  if (passwordHash.verify(data.password, hashedPassword)) {
    mainWindow.webContents.send("response::checkUserPassword", {
      access: true
    });
  } else {
    mainWindow.webContents.send("response::checkUserPassword", {
      access: false
    });
  }
});

ipcMain.on("getSeries", async (event, data) => {
  try {
    const results = await horribleSubs.getAllAnime();
    mainWindow.webContents.send("response::getSeries", results);
  } catch (e) {
    mainWindow.webContents.send("response::getSeries", []);
    console.log(e);
  }
});

ipcMain.on("getWatchList", async (event, data) => {
  if (!fse.pathExistsSync(watchListPath)) {
    fse.writeFileSync(watchListPath, "");
  }
  const myString = fse.readFileSync(watchListPath).toString();
  if (myString === "") {
    mainWindow.webContents.send("response::getWatchList", []);
    return;
  }
  const content = myString.split("#").map(elem => {
    obj = {};
    elem
      .split("|")
      .forEach((value, index) => (obj[watchListKeys[index]] = value));
    return obj;
  });
  console.log(content);
  mainWindow.webContents.send("response::getWatchList", content);
});

ipcMain.on("setWatchList", async (event, data) => {
  try {
    console.log(data);
    // Convert Episodes Dictionary to Array of Arrays
    let episodesList = await Promise.all(
      data.map(
        async elem => (await horribleSubs.getAnimeData(elem)).episodes["1"]
      )
    );
    episodesList = episodesList.map(episodes => {
      let newEpisodes = [];
      Object.keys(episodes)
        .sort()
        .forEach(key => newEpisodes.push(episodes[key]));
      newEpisodes = newEpisodes.map(elem => {
        newElement = {};
        Object.keys(elem).forEach(key => {
          newElement[key] = elem[key].url;
        });
        return newElement;
      });
      return newEpisodes;
    });
    episodesList = episodesList.map(episodes =>
      episodes.map(episode => {
        tempStr = "";
        tempStr += Object.keys(episode)
          .sort()
          .join("|");
        tempStr += "||";
        tempStr += Object.keys(episode)
          .sort()
          .map(key => episode[key])
          .join("|");
        tempStr += "||";
        tempStr += "0".repeat(fixedLength - tempStr.length);
        return tempStr;
      })
    );
    // Append Max Episode To Data and also create a file
    data = data.map((value, index) => {
      value.maxEpisodes = episodesList[index].length;
      delete value.hs_showid;
      delete value.episodes;
      fse.writeFileSync(
        database + value.title + ".txt",
        episodesList[index].join("")
      );
      return value;
    });

    console.log(episodesList);
    console.log(data);

    // Change to FS Format.
    const str = data
      .map(elem => watchListKeys.map(key => elem[key]).join("|"))
      .join("#");

    fse.writeFileSync(watchListPath, str);
    mainWindow.webContents.send("response::setWatchList", data);
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on("getEpisode", (event, data) => {
  const filename = database + data.title + ".txt";
  const fd = fs.openSync(filename, "r");
  const buffer = new Buffer(fixedLength);
  fs.readSync(
    fd,
    buffer,
    0,
    fixedLength,
    (data.selectedEpisode - 1) * fixedLength
  );
  const myArray = buffer.toString().split("||");
  const qualities = myArray[0].split("|");
  const links = myArray[1].split("|");
  obj = {};
  qualities.forEach((quality, index) => {
    obj[quality] = links[index];
  });
  mainWindow.webContents.send("response::getEpisode", obj);
});
