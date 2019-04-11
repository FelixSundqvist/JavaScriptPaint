import "./styles.css";

let view = (() => {
  let startDrawing = (event, domElements, cProperties) => {
    //DRAW
    if (!cProperties.erasing) {
      cProperties.ctx.lineWidth = cProperties.strokeSize;
      cProperties.cursorCtx.lineWidth = cProperties.strokeSize;

      if (cProperties.mouseDown === false && cProperties.moving === true) {
        cProperties.ctx.beginPath();
        cProperties.ctx.moveTo(event.x, event.y);

        cProperties.mouseDown = true;
      }

      cProperties.ctx.beginPath();
      cProperties.ctx.arc(
        event.x,
        event.y,
        cProperties.strokeSize / 4,
        0,
        2 * Math.PI
      );
      cProperties.ctx.fill();
      cProperties.ctx.stroke();
      cProperties.moving = false;
    } //ERASE
    else if (cProperties.erasing) {
      if (cProperties.mouseDown === false && cProperties.moving === true) {
        cProperties.mouseDown = true;
      }
      cProperties.ctx.clearRect(
        event.x,
        event.y,
        cProperties.strokeSize * 2,
        cProperties.strokeSize * 2
      );
    }
    //hide color palette if visible
    hideColorPicker(domElements, cProperties);
  };

  let stopDrawing = cProperties => {
    cProperties.mouseDown = false;
    cProperties.ctx.moveTo(0, 0);
  };
  //draw when cursor is moving
  let moveFunction = (event, cProperties) => {
    cProperties.moving = true;

    if (!cProperties.erasing) {
      if (cProperties.mouseDown === true) {
        cProperties.ctx.lineTo(event.x, event.y);
        cProperties.ctx.stroke();
      }
    } else if (cProperties.erasing === true && cProperties.mouseDown === true) {
      cProperties.ctx.clearRect(
        event.x,
        event.y,
        cProperties.strokeSize * 2,
        cProperties.strokeSize * 2
      );
    }

    movePointer(event, cProperties);
  };
  //move custom pointer
  let movePointer = (event, cProperties) => {
    cProperties.cursorCtx.clearRect(
      0,
      0,
      cProperties.width,
      cProperties.height
    );

    cProperties.cursorCtx.beginPath();
    cProperties.cursorCtx.arc(
      event.x,
      event.y,
      cProperties.strokeSize,
      0,
      2 * Math.PI
    );
    cProperties.cursorCtx.stroke();
    cProperties.cursorCtx.fill();
  };

  let removePointer = cProperties => {
    cProperties.cursorCtx.clearRect(
      0,
      0,
      cProperties.width,
      cProperties.height
    );
  };

  //change pencil size on scroll
  let changeSize = (event, cProperties) => {
    if (event.deltaY > 1 && cProperties.strokeSize >= 1) {
      cProperties.strokeSize--;
    } else if (event.deltaY <= 0 && cProperties.strokeSize < 10) {
      cProperties.strokeSize++;
    }
    cProperties.ctx.lineWidth = cProperties.strokeSize;
    cProperties.cursorCtx.lineWidth = cProperties.strokeSize;
  };
  let changeColor = (domElements, cProperties, color) => {
    cProperties.erasing = false;
    cProperties.ctx.strokeStyle = color;
    cProperties.ctx.fillStyle = color;
    cProperties.cursorCtx.fillStyle = color;
    cProperties.cursorCtx.fill();
    cProperties.cursorCtx.stroke();

    cProperties.currentColor = color;
    hideColorPicker(domElements, cProperties);
    setColorIcon(domElements, cProperties);
  };
  let changeBackground = (domElements, cProperties) => {
    cProperties.ctx.clearRect(0, 0, cProperties.width, cProperties.height);
    domElements.canvas.background.style.backgroundColor =
      cProperties.currentColor;
  };
  let eraser = (domElements, cProperties) => {
    domElements.eraser.focus();
    cProperties.cursorCtx.fillStyle = "white";
    cProperties.cursorCtx.strokeStyle = "black";
    cProperties.cursorCtx.fill();
    cProperties.cursorCtx.stroke();
    cProperties.currentColor = cProperties.colorPalette.white;
    cProperties.erasing = true;
    hideColorPicker(domElements);
  };
  let showColorPicker = (domElements, cProperties) => {
    domElements.colorPicker.classList.add("show");
    domElements.colorPicker.classList.remove("hide");
    cProperties.colorClicked = true;
  };
  let hideColorPicker = (domElements, cProperties) => {
    domElements.colorPicker.classList.add("hide");
    domElements.colorPicker.classList.remove("show");
    cProperties.colorClicked = false;
  };
  let setColorIcon = (domElements, cProperties) => {
    domElements.showColor.focus();
    domElements.showColor.style.backgroundColor = cProperties.currentColor;
  };

  let reset = (domElements, cProperties) => {
    cProperties.ctx.clearRect(0, 0, cProperties.width, cProperties.height);

    cProperties.currentColor = cProperties.colorPalette.white;
    changeBackground(domElements, cProperties);
  };

  let handleToolbar = (event, domElements, cProperties) => {
    let id = event.srcElement.id;
    //if any color in array call changecolor()
    for (let i = 0; i < cProperties.colorsArr.length; i++) {
      if (cProperties.colorsArr[i] === id) {
        changeColor(domElements, cProperties, cProperties.colorPalette[id]);
        break;
      }
    }
    if (id === "eraser") {
      eraser(domElements, cProperties);
    } else if (id === "background") {
      changeBackground(domElements, cProperties);
    }

    //todo add Zoom
  };
  let handleToolTip = domElements => {
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
  };

  let setCanvasSize = (canvasArr, cProperties) => {
    canvasArr.map(cur => {
      let currentCanvas = document.getElementById(cur + "-canvas");
      currentCanvas.height = cProperties.height;
      currentCanvas.width = cProperties.width;
    });
  };

  let createGrid = (domElements, cProperties) => {
    let columns = domElements.gridColInput.value;
    let rows = domElements.gridRowInput.value;

    let colAmount = cProperties.width / columns;
    let rowAmount = cProperties.height / rows;

    //clear canvas
    cProperties.gridCtx.clearRect(0, 0, cProperties.width, cProperties.height);

    cProperties.gridCtx.beginPath();

    cProperties.gridCtx.moveTo(0, 0);

    cProperties.gridCtx.lineTo(0, 200);
    cProperties.gridCtx.stroke();

    cProperties.gridClicked = true;

    for (let i = 0; i <= cProperties.width; i += colAmount) {
      cProperties.gridCtx.beginPath();
      cProperties.gridCtx.moveTo(0, i);
      cProperties.gridCtx.lineTo(cProperties.width, i);
      cProperties.gridCtx.stroke();

      for (let i = 0; i <= cProperties.height; i += rowAmount) {
        cProperties.gridCtx.beginPath();
        cProperties.gridCtx.moveTo(i, 0);
        cProperties.gridCtx.lineTo(i, cProperties.height);
        cProperties.gridCtx.stroke();
      }
    }
  };

  let clearGrid = cProperties => {
    cProperties.gridClicked = false;
    cProperties.gridCtx.clearRect(0, 0, cProperties.width, cProperties.height);
  };

  return {
    startDrawing,
    stopDrawing,
    moveFunction,
    movePointer,
    removePointer,
    changeSize,
    changeColor,
    changeBackground,
    eraser,
    showColorPicker,
    hideColorPicker,
    setColorIcon,
    reset,
    handleToolbar,
    handleToolTip,
    setCanvasSize,
    createGrid,
    clearGrid
  };
})();

let controller = (view => {
  const DOMELEMENTS = {
    canvas: {
      main: document.getElementById("main-canvas"),
      cursor: document.getElementById("cursor-canvas"),
      background: document.getElementById("background-canvas"),
      grid: document.getElementById("grid-canvas")
    },
    canvasArr: ["main", "cursor", "background", "grid"],
    resetButton: document.getElementById("reset"),
    gridButton: document.getElementById("grid"),
    canvasTools: document.getElementById("canvas-tools"),
    showColor: document.getElementById("show-color"),
    colorPicker: document.getElementById("color-picker"),
    colors: document.getElementsByClassName("color-button"),
    eraser: document.getElementById("eraser"),
    tooltip: document.getElementById("tooltip"),
    gridRowInput: document.getElementById("grid-rows"),
    gridColInput: document.getElementById("grid-cols")
  };

  const CANVASPROPERTIES = {
    mouseDown: false,
    strokeSize: 4,
    height: 500,
    width: 500,
    moving: false,
    ctx: DOMELEMENTS.canvas.main.getContext("2d"),
    cursorCtx: DOMELEMENTS.canvas.cursor.getContext("2d"),
    gridCtx: DOMELEMENTS.canvas.grid.getContext("2d"),
    erasing: false,
    colorClicked: false,
    gridClicked: false,
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
    colorsArr: [],
    gridCols: 5,
    gridRows: 5
  };

  let eventListeners = (domElements, cProperties) => {
    domElements.canvas.main.addEventListener("mousedown", ev => {
      view.startDrawing(ev, domElements, cProperties);
    });
    domElements.canvas.main.addEventListener("mouseup", ev => {
      view.stopDrawing(cProperties);
    });
    domElements.canvas.main.addEventListener("mousemove", ev => {
      view.moveFunction(ev, cProperties);
    });
    domElements.canvas.main.addEventListener("mouseout", ev => {
      view.removePointer(cProperties);
      view.stopDrawing(cProperties);
    });
    //reset everything
    domElements.resetButton.addEventListener("click", ev => {
      view.reset(domElements, cProperties);
    });
    //show color palette
    domElements.showColor.addEventListener("click", ev => {
      doubleClickHandler(
        CANVASPROPERTIES.colorClicked,
        () => {
          view.hideColorPicker(domElements, cProperties);
        },
        () => {
          view.showColorPicker(domElements, cProperties);
        }
      );
    });
    domElements.canvasTools.addEventListener("click", ev => {
      //color palette
      view.handleToolbar(ev, domElements, cProperties);
    });
    //Make bigger pencil
    document.addEventListener("wheel", ev => {
      view.changeSize(ev, cProperties);
    });
    view.handleToolTip(domElements);

    domElements.gridButton.addEventListener("click", ev => {
      doubleClickHandler(
        CANVASPROPERTIES.gridClicked,
        () => {
          view.clearGrid(CANVASPROPERTIES);
        },
        () => {
          view.createGrid(DOMELEMENTS, CANVASPROPERTIES);
        }
      );
    });

    domElements.gridRowInput.addEventListener("change", ev => {
      view.createGrid(DOMELEMENTS, CANVASPROPERTIES);
    });

    domElements.gridColInput.addEventListener("change", ev => {
      view.createGrid(DOMELEMENTS, CANVASPROPERTIES);
    });
  };

  let addColorPalette = (domElements, cProperties) => {
    for (let i = 0; i < domElements.colors.length; i++) {
      cProperties.colorsArr.push(domElements.colors[i].id);
    }
  };
  let doubleClickHandler = (clickBoolean, trueFunction, falseFunction) => {
    if (clickBoolean === false) {
      falseFunction();
    } else if (clickBoolean === true) {
      trueFunction();
    }
  };

  return {
    init: () => {
      view.setCanvasSize(DOMELEMENTS.canvasArr, CANVASPROPERTIES);
      view.setColorIcon(DOMELEMENTS, CANVASPROPERTIES);

      addColorPalette(DOMELEMENTS, CANVASPROPERTIES);
      eventListeners(DOMELEMENTS, CANVASPROPERTIES);
    }
  };
})(view);
controller.init();
