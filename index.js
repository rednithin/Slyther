const electron = require("electron");
const fse = require("fs-extra");
const fs = require("fs");
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:3000");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
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

const passPath = "./database/password.txt";
const qualityPath = "./database/quality.txt";

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
  fse.writeFileSync(passPath, data.password);
});

ipcMain.on("setQuality", (event, data) => {
  fse.removeSync(qualityPath);
  fse.writeFileSync(qualityPath, data.quality);
});

ipcMain.on("getQuality", () => {
  if (fse.pathExistsSync(qualityPath)) {
    const quality = fse.readFileSync(qualityPath).toString();
    mainWindow.webContents.send("response::getQuality", {
      quality
    });
  } else {
    mainWindow.webContents.send("response::getQuality", {
      quality: "480"
    });
  }
});

ipcMain.on("checkUserPassword", (event, data) => {
  const actualPassword = fse.readFileSync(passPath).toString();
  if (data.password === actualPassword) {
    mainWindow.webContents.send("response::checkUserPassword", {
      access: true
    });
  } else {
    mainWindow.webContents.send("response::checkUserPassword", {
      access: false
    });
  }
});
