import "./styles.css";

let init = (() => {
  const DOMELEMENTS = {
    canvas: document.getElementById("canvas"),
    cursorCanvas: document.getElementById("cursor-canvas"),
    backgroundCanvas: document.getElementById("background-canvas"),
    resetButton: document.getElementById("reset"),
    canvasTools: document.getElementById("canvas-tools"),
    showColor: document.getElementById("show-color"),
    colorPicker: document.getElementById("color-picker"),
    colors: document.getElementsByClassName("color-button"),
    eraser: document.getElementById("eraser"),
    tooltip: document.getElementById("tooltip")
  };

  const CANVASPROPERTIES = {
    mouseDown: false,
    strokeSize: 4,
    height: 500,
    width: 500,
    moving: false,
    ctx: DOMELEMENTS.canvas.getContext("2d"),
    cursorCtx: DOMELEMENTS.cursorCanvas.getContext("2d"),
    erasing: false,
    colorClicked: false,
    currentColor: "black",
    colorPalette: {
      purple: "purple",
      green: "rgb(9, 224, 9)",
      pink: "pink",
      blue: "rgb(50, 67, 255)",
      yellow: "rgb(255, 251, 17)",
      red: "rgb(255, 33, 17)",
      black: "#000000",
      white: "#ffffff"
    },
    colorsArr: []
  };

  DOMELEMENTS.canvas.height = DOMELEMENTS.cursorCanvas.height = DOMELEMENTS.backgroundCanvas.height =
    CANVASPROPERTIES.height;
  DOMELEMENTS.canvas.width = DOMELEMENTS.cursorCanvas.width = DOMELEMENTS.backgroundCanvas.width =
    CANVASPROPERTIES.width;

  addColorPalette(DOMELEMENTS, CANVASPROPERTIES);
  setColorIcon(DOMELEMENTS, CANVASPROPERTIES);
  eventListeners(DOMELEMENTS, CANVASPROPERTIES);
})();

function addColorPalette(domElements, canvasProperties) {
  for (let i = 0; i < domElements.colors.length; i++) {
    canvasProperties.colorsArr.push(domElements.colors[i].id);
  }
}

function eventListeners(domObj, canvasProperties) {
  domObj.canvas.addEventListener("mousedown", ev => {
    startDrawing(ev, domObj, canvasProperties);
  });

  domObj.canvas.addEventListener("mouseup", ev => {
    stopDrawing(canvasProperties);
  });

  domObj.canvas.addEventListener("mousemove", ev => {
    moveFunction(ev, canvasProperties);
  });
  domObj.canvas.addEventListener("mouseout", ev => {
    removePointer(canvasProperties);
    stopDrawing(canvasProperties);
  });

  //reset everything
  domObj.resetButton.addEventListener("click", ev => {
    reset(domObj, canvasProperties);
  });
  //show color palette

  domObj.showColor.addEventListener("click", ev => {
    if (canvasProperties.colorClicked) {
      showColorPicker(domObj, canvasProperties);
    } else if (!canvasProperties.colorClicked) {
      hideColorPicker(domObj, canvasProperties);
    }
  });

  domObj.canvasTools.addEventListener("click", ev => {
    //color palette
    handleTools(ev, domObj, canvasProperties);
  });

  //Make bigger pencil
  document.addEventListener("wheel", ev => {
    changeSize(ev, canvasProperties);
  });
  handleToolTip(domObj);
}

function handleToolTip(domObj) {
  domObj.canvasTools = Array.from(domObj.canvasTools.children);

  domObj.canvasTools.map(current => {
    if (current.id !== "color-picker") {
      current.addEventListener("mouseover", ev => {
        let topOffset = -50;
        let rightOffset = -20;

        domObj.tooltip.style.opacity = "0.8";

        domObj.tooltip.innerText = current.id;

        domObj.tooltip.style.top = ev.clientY + topOffset + "px";
        domObj.tooltip.style.left = ev.clientX + rightOffset + "px";
      });
      current.addEventListener("mouseout", ev => {
        domObj.tooltip.style.opacity = "0";
      });
    }
  });
}

function handleTools(event, domObj, canvasProperties) {
  let id = event.srcElement.id;

  for (let i = 0; i < canvasProperties.colorsArr.length; i++) {
    if (canvasProperties.colorsArr[i] === id) {
      changeColor(domObj, canvasProperties, canvasProperties.colorPalette[id]);
      break;
    }
  }
  if (id === "eraser") {
    eraser(canvasProperties);
  } else if (id === "background") {
    changeBackground(domObj, canvasProperties);
  }

  //todo add Zoom
}

function startDrawing(event, domObj, canvasProperties) {
  hideColorPicker(domObj, canvasProperties);
  //DRAW
  if (!canvasProperties.erasing) {
    canvasProperties.ctx.lineWidth = canvasProperties.strokeSize;
    canvasProperties.cursorCtx.lineWidth = canvasProperties.strokeSize;

    if (
      canvasProperties.mouseDown === false &&
      canvasProperties.moving === true
    ) {
      canvasProperties.ctx.beginPath();
      canvasProperties.ctx.moveTo(event.x, event.y);

      canvasProperties.mouseDown = true;
    }

    canvasProperties.ctx.beginPath();
    canvasProperties.ctx.arc(
      event.x,
      event.y,
      canvasProperties.strokeSize / 4,
      0,
      2 * Math.PI
    );
    canvasProperties.ctx.fill();
    canvasProperties.ctx.stroke();
    canvasProperties.moving = false;
  } //ERASE
  else if (canvasProperties.erasing) {
    if (
      canvasProperties.mouseDown === false &&
      canvasProperties.moving === true
    ) {
      canvasProperties.mouseDown = true;
    }
    canvasProperties.ctx.clearRect(
      event.x,
      event.y,
      canvasProperties.strokeSize * 2,
      canvasProperties.strokeSize * 2
    );
  }
}

function stopDrawing(canvasProperties) {
  canvasProperties.mouseDown = false;
  canvasProperties.ctx.moveTo(0, 0);
}

function moveFunction(event, canvasProperties) {
  canvasProperties.moving = true;

  if (!canvasProperties.erasing) {
    if (canvasProperties.mouseDown === true) {
      canvasProperties.ctx.lineTo(event.x, event.y);
      canvasProperties.ctx.stroke();
    }
  } else if (
    canvasProperties.erasing === true &&
    canvasProperties.mouseDown === true
  ) {
    canvasProperties.ctx.clearRect(
      event.x,
      event.y,
      canvasProperties.strokeSize * 2,
      canvasProperties.strokeSize * 2
    );
  }

  movePointer(event, canvasProperties);
}

//move custom pointer
function movePointer(event, canvasProperties) {
  canvasProperties.cursorCtx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );

  canvasProperties.cursorCtx.beginPath();
  canvasProperties.cursorCtx.arc(
    event.x,
    event.y,
    canvasProperties.strokeSize,
    0,
    2 * Math.PI
  );
  canvasProperties.cursorCtx.stroke();
  canvasProperties.cursorCtx.fill();
}
function removePointer(canvasProperties) {
  canvasProperties.cursorCtx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );
}
//pencil size
function changeSize(event, canvasProperties) {
  if (event.deltaY > 1 && canvasProperties.strokeSize >= 1) {
    canvasProperties.strokeSize--;
  } else if (event.deltaY <= 0 && canvasProperties.strokeSize < 10) {
    canvasProperties.strokeSize++;
  }
  canvasProperties.ctx.lineWidth = canvasProperties.strokeSize;
  canvasProperties.cursorCtx.lineWidth = canvasProperties.strokeSize;
}
//change color
function changeColor(domObj, canvasProperties, color) {
  canvasProperties.erasing = false;
  canvasProperties.ctx.strokeStyle = color;
  canvasProperties.ctx.fillStyle = color;
  // canvasProperties.cursorCtx.strokeStyle = color;
  canvasProperties.cursorCtx.fillStyle = color;
  canvasProperties.cursorCtx.fill();
  canvasProperties.cursorCtx.stroke();

  canvasProperties.currentColor = color;
  hideColorPicker(domObj);
  setColorIcon(domObj, canvasProperties);
}
function changeBackground(domObj, canvasProperties) {
  canvasProperties.ctx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );
  domObj.backgroundCanvas.style.backgroundColor = canvasProperties.currentColor;
}

function eraser(canvasProperties) {
  canvasProperties.cursorCtx.fillStyle = "white";
  canvasProperties.cursorCtx.strokeStyle = "black";
  canvasProperties.cursorCtx.fill();
  canvasProperties.cursorCtx.stroke();
  canvasProperties.currentColor = canvasProperties.colorPalette.white;
  canvasProperties.erasing = true;
}

function reset(domObj, canvasProperties) {
  canvasProperties.ctx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );

  canvasProperties.currentColor = canvasProperties.colorPalette.white;
  changeBackground(domObj, canvasProperties);
}

function showColorPicker(domObj, canvasProperties) {
  domObj.colorPicker.classList.add("show");
  domObj.colorPicker.classList.remove("hide");
  canvasProperties.colorClicked = true;
}
function hideColorPicker(domObj, canvasProperties) {
  domObj.colorPicker.classList.add("hide");
  domObj.colorPicker.classList.remove("show");
  canvasProperties.colorClicked = false;
}
function setColorIcon(domObj, canvasProperties) {
  domObj.showColor.style.backgroundColor = canvasProperties.currentColor;
}
window.onload = function() {
  init();
};
