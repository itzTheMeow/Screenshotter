const screenshotCanvas = document.getElementById("ss-canvas");
const screenshotContainer = document.getElementById("ss-container");
const ctx = screenshotCanvas.getContext("2d");

let rendering = null;
let screenshotStart = null;

function updateRender() {
  if (!rendering) return;

  screenshotCanvas.width = window.innerWidth;
  screenshotCanvas.height = window.innerHeight;

  ctx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff0000";
  ctx.strokeRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);

  if (screenshotStart) {
    const x = [screenshotStart.x, screenshotStart.sx].sort((a, b) => a - b);
    const y = [screenshotStart.y, screenshotStart.sy].sort((a, b) => a - b);

    ctx.clearRect(x[0], y[0], x[1] - x[0], y[1] - y[0]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x[0], y[0], x[1] - x[0], y[1] - y[0]);
  }

  requestAnimationFrame(updateRender);
}
function quit() {
  rendering = null;
  ctx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
  ipc.send("quit");
}

screenshotCanvas.addEventListener("mousedown", (ev) => {
  screenshotStart = {
    x: ev.pageX,
    sx: ev.pageX,
    y: ev.pageY,
    sy: ev.pageY,
  };
});
screenshotCanvas.addEventListener("mousemove", (ev) => {
  if (screenshotStart) {
    screenshotStart.x = ev.pageX;
    screenshotStart.y = ev.pageY;
  }
});
screenshotCanvas.addEventListener("mouseup", (ev) => {
  const coords = {
    x: Math.min(screenshotStart.x, screenshotStart.sx),
    y: Math.min(screenshotStart.y, screenshotStart.sy),
    w: Math.abs(screenshotStart.x - screenshotStart.sx),
    h: Math.abs(screenshotStart.y - screenshotStart.sy),
  };
  if (coords.w >= 15 && coords.h >= 15) {
    const tempCanvas = document.createElement("canvas");
    const nctx = tempCanvas.getContext("2d");
    tempCanvas.width = rendering.width;
    tempCanvas.height = rendering.height;
    document.body.appendChild(tempCanvas);

    nctx.drawImage(rendering, 0, 0);
    const ss = nctx.getImageData(coords.x, coords.y, coords.w, coords.h);

    tempCanvas.width = coords.w;
    tempCanvas.height = coords.h;
    nctx.putImageData(ss, 0, 0);

    tempCanvas.toBlob((blob) => {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      tempCanvas.remove();
      quit();
    });
  }

  screenshotStart = null;
});

window.addEventListener("focus", () => {
  ipc.send("request-ss");
  rendering = null;
  screenshotContainer.src = "";
});
window.addEventListener("blur", () => {
  quit();
});
window.addEventListener("keydown", (ev) => {
  if (ev.key == "Escape") quit();
});

ipc.on("load-ss", (ss) => {
  rendering = new Image();
  rendering.onload = function () {
    requestAnimationFrame(updateRender);
  };
  rendering.src = ss;
  screenshotContainer.src = ss;
});
