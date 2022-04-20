const { app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut } = require("electron");
const screenshotDesktop = require("screenshot-desktop");

app.on("ready", () => {
  console.log("Loaded.");
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });
  win.loadURL(`file://${__dirname}/index.html`);
  win.hide();

  ipcMain.on("quit", () => {
    win.hide();
  });

  let latestSS = "";
  ipcMain.on("request-ss", async (event) => {
    event.reply("load-ss", latestSS);
  });

  async function takeScreenshot() {
    latestSS =
      `data:image/png;base64,` + (await screenshotDesktop({ format: "png" })).toString("base64");
    win.show();
  }

  globalShortcut.register("Super+Shift+Z", () => {
    takeScreenshot();
  });

  const tray = new Tray(`${__dirname}/logo.png`);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Take Screenshot",
        type: "normal",
        click: () => {
          takeScreenshot();
        },
      },
      { label: "SEP", type: "separator" },
      {
        label: "Exit",
        type: "normal",
        click: () => {
          app.quit();
        },
      },
    ])
  );
  tray.on("double-click", (ev) => {
    takeScreenshot();
  });

  win.on("closed", function () {
    app.quit();
  });
});
