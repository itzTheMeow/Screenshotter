const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  send: (ev, ...data) => {
    ipcRenderer.send(ev, ...data);
  },
  on: (ev, callback) => {
    ipcRenderer.on(ev, (_, ...data) => {
      callback(...data);
    });
  },
});
