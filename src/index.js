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

function eventListeners(domElements, canvasProperties) {
  domElements.canvas.addEventListener("mousedown", ev => {
    startDrawing(ev, domElements, canvasProperties);
  });

  domElements.canvas.addEventListener("mouseup", ev => {
    stopDrawing(canvasProperties);
  });

  domElements.canvas.addEventListener("mousemove", ev => {
    moveFunction(ev, canvasProperties);
  });
  domElements.canvas.addEventListener("mouseout", ev => {
    removePointer(canvasProperties);
    stopDrawing(canvasProperties);
  });

  //reset everything
  domElements.resetButton.addEventListener("click", ev => {
    reset(domElements, canvasProperties);
  });
  //show color palette

  domElements.showColor.addEventListener("click", ev => {
    handleColorPalette(domElements, canvasProperties);
  });

  domElements.canvasTools.addEventListener("click", ev => {
    //color palette
    handleToolbar(ev, domElements, canvasProperties);
  });

  //Make bigger pencil
  document.addEventListener("wheel", ev => {
    changeSize(ev, canvasProperties);
  });
  handleToolTip(domElements);
}

function handleToolTip(domElements) {
  domElements.canvasTools = Array.from(domElements.canvasTools.children);

  domElements.canvasTools.map(current => {
    //don´t show tooltip if color picker
    if (current.id !== "color-picker") {
      current.addEventListener("mouseover", ev => {
        let topOffset = -50;
        let rightOffset = -20;

        domElements.tooltip.style.display = "block";

        domElements.tooltip.innerText = current.id;
        //tooltip to mouse position
        domElements.tooltip.style.top = ev.clientY + topOffset + "px";
        domElements.tooltip.style.left = ev.clientX + rightOffset + "px";
      });
      current.addEventListener("mouseout", ev => {
        domElements.tooltip.style.display = "none";
      });
    }
  });
}

function handleToolbar(event, domElements, canvasProperties) {
  let id = event.srcElement.id;
  //if any color in array call changecolor()
  for (let i = 0; i < canvasProperties.colorsArr.length; i++) {
    if (canvasProperties.colorsArr[i] === id) {
      changeColor(
        domElements,
        canvasProperties,
        canvasProperties.colorPalette[id]
      );
      break;
    }
  }
  if (id === "eraser") {
    eraser(canvasProperties);
  } else if (id === "background") {
    changeBackground(domElements, canvasProperties);
  }

  //todo add Zoom
}

function startDrawing(event, domElements, canvasProperties) {
  hideColorPicker(domElements, canvasProperties);
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
function changeColor(domElements, canvasProperties, color) {
  canvasProperties.erasing = false;
  canvasProperties.ctx.strokeStyle = color;
  canvasProperties.ctx.fillStyle = color;
  // canvasProperties.cursorCtx.strokeStyle = color;
  canvasProperties.cursorCtx.fillStyle = color;
  canvasProperties.cursorCtx.fill();
  canvasProperties.cursorCtx.stroke();

  canvasProperties.currentColor = color;
  hideColorPicker(domElements);
  setColorIcon(domElements, canvasProperties);
}
function changeBackground(domElements, canvasProperties) {
  canvasProperties.ctx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );
  domElements.backgroundCanvas.style.backgroundColor =
    canvasProperties.currentColor;
}

function eraser(canvasProperties) {
  canvasProperties.cursorCtx.fillStyle = "white";
  canvasProperties.cursorCtx.strokeStyle = "black";
  canvasProperties.cursorCtx.fill();
  canvasProperties.cursorCtx.stroke();
  canvasProperties.currentColor = canvasProperties.colorPalette.white;
  canvasProperties.erasing = true;
}

function reset(domElements, canvasProperties) {
  canvasProperties.ctx.clearRect(
    0,
    0,
    canvasProperties.width,
    canvasProperties.height
  );

  canvasProperties.currentColor = canvasProperties.colorPalette.white;
  changeBackground(domElements, canvasProperties);
}
function handleColorPalette(domElements, canvasProperties) {
  if (canvasProperties.colorClicked === false) {
    showColorPicker(domElements, canvasProperties);
    canvasProperties.colorClicked = true;
  } else if (canvasProperties.colorClicked === true) {
    hideColorPicker(domElements, canvasProperties);
    canvasProperties.colorClicked = false;
  }
}

function showColorPicker(domElements, canvasProperties) {
  domElements.colorPicker.classList.add("show");
  domElements.colorPicker.classList.remove("hide");
}
function hideColorPicker(domElements, canvasProperties) {
  domElements.colorPicker.classList.add("hide");
  domElements.colorPicker.classList.remove("show");
}
function setColorIcon(domElements, canvasProperties) {
  domElements.showColor.style.backgroundColor = canvasProperties.currentColor;
}
window.onload = function() {
  init();
};
