"use strict";


//Canvas variables.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
//myGameArea is the variable that holds the context for the canvas element.
var myGameArea = {
  canvas : document.getElementById("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    // document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  }
}

//Game Controller Variables.
const turn = {
  player: "white",
  phase: "choosePiece1",
  movePieceAt: "",
  movePieceTo: "",
  piece: ""
};

//Create an array of turn phases (in order of normal progression).
const phaseArray = ["choosePiece1", "movePiece1", "choosePiece2",
                    "movePiece2", "push", "endTurn"
                    ];
// List of unplayable tile names
// used for board generation, win detection, and push logic.
const boarderTiles = ["a2", "a3", "a4", "a5", "a6", "b1", "b7",
                      "b8", "c0", "c9", "d0", "d9", "e1", "e2",
                      "e8", "f3", "f4", "f5", "f6", "f7"
                    ];

const columns = "abcde";

//generate Board object with nodes and edges.
const board = standardBoard();
addDirectionsToSquares(board);


//BASIC FUNCTIONS FOR DRAWING AND ERASING SHAPES

//Make a function to draw the outlines of empty rectangles.
function makeBoardRegion(width, height, color, x, y) {
  const ctx = myGameArea.context;
  ctx.strokeRect(x, y, width, height);
}

//this function draws filled rectangles.
function component(width, height, color, x, y) {
  const ctx = myGameArea.context;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

//this function draws a filled, outlined circle.
function drawCircle(radius, color, x, y){
  const ctx = myGameArea.context;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2*Math.PI);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

//make a function to clear a region and redraw it.
function clearSpace(spaceName){
  const target = board[spaceName];
  const ctx = myGameArea.context;
  ctx.clearRect(target.x, target.y, target.width, target.height);
  makeBoardRegion(target.width, target.height, "black", target.x, target.y);
  target.piece = "none";
}

//draw a highlighted region around a selected square
function highlightSquare(spaceName){
  let target = board[spaceName];
  const ctx = myGameArea.context;
  let defaultColor = ctx.strokeStyle;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#EEF11C";
  ctx.strokeRect(target.x + 3, target.y + 3, target.width - 6, target.height -6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = defaultColor;
}


//FUNCTIONS THAT DRAW PIECES ON REGIONS

//make a function to draw a white square piece on a space
function drawWhiteSquarePiece(spaceName) {
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  component(30, 30, "#FBD5AC", board[spaceName].x + 10, board[spaceName].y + 10);
  myGameArea.context.strokeRect(board[spaceName].x + 10, board[spaceName].y + 10, 30, 30);
  board[spaceName].piece = "whiteSquare";
}
//make a function to draw a brown square piece on a space
function drawBrownSquarePiece(spaceName) {
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  component(30, 30, "#915C1E", board[spaceName].x + 10, board[spaceName].y + 10);
  myGameArea.context.strokeRect(board[spaceName].x + 10, board[spaceName].y + 10, 30, 30);
  board[spaceName].piece = "brownSquare";
}

//make a function to draw a white round piece on a space
function drawWhiteRoundPiece(spaceName){
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  drawCircle(15, "#FBD5AC", board[spaceName].x + 25, board[spaceName].y + 25);
  board[spaceName].piece = "whiteRound";
}

//make a functino to draw a brown round piece on a space
function drawBrownRoundPiece(spaceName){
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  drawCircle(15, "#915C1E", board[spaceName].x + 25, board[spaceName].y + 25);
  board[spaceName].piece = "brownRound";
}

//Controller function to select a draw function based on a piece name and space
function drawPiece(piece, spaceName) {
  if (piece == "whiteRound") {
    drawWhiteRoundPiece(spaceName);
  } else if (piece == "whiteSquare") {
    drawWhiteSquarePiece(spaceName);
  } else if (piece == "brownRound") {
    drawBrownRoundPiece(spaceName);
  } else if (piece == "brownSquare") {
    drawBrownSquarePiece(spaceName);
  }
}

//FUNCTIONS TO MANIPULATE PIECES

//function to select a piece for movement
function choosePiece(spaceName){
  turn.movePieceAt = spaceName;
  turn.piece = board[spaceName].piece;
  highlightSquare(spaceName);
}

//function to move a selected space to a new square.
function movePiece(spaceName){
  let moveTo = board[spaceName];
  console.log("moveTo: ", moveTo);
  let moveFrom = board[turn.movePieceAt];
  console.log("moveFrom: ", moveFrom);
  moveTo.piece = turn.piece;
  console.log("turn.piece: ", turn.piece);
  moveFrom.piece = "none";
  clearSpace(moveFrom.name);
  console.log("moveFrom.name: ", moveFrom.name);
  drawPiece(turn.piece, spaceName);
  console.log("spaceName: ", spaceName);
}

//CONTROLLER FUNCTIONS FOR GAME

//Function to change active player
function changePlayer(){
  turn.player = (turn.player == "white") ? "brown" : "white";
}

//Move turn.phase forward
function advanceTurn(){
  if (turn.phase == "endTurn"){
    turn.phase = "choosePiece1";
    changePlayer();
  } else {
    turn.phase = phaseArray[phaseArray.indexOf(turn.phase) + 1];
  }
}

//Movement helper functions (returning adjacent nodes)
//Try to return a square one row up, given a square.
function nextUp(square) {
  let column = square.name[0];
  let row = parseInt(square.name[1]);
  const newName = column + String(row - 1);
  return (square.edges.includes(newName)? board[newName] : false)
}
//Try to return a square one row down, given a square.
function nextDown(square) {
  let column = square.name[0];
  let row = parseInt(square.name[1]);
  const newName = column + String(row + 1);
  return (square.edges.includes(newName)? board[newName] : false)
}
//Try to return a square one row left, given a square.
function nextLeft(square) {
  let column = square.name[0];
  let row = square.name[1];
  if( column == "a"){
    return false
  }
  const newName = columns[columns.indexOf(column) - 1] + row;
  return (square.edges.includes(newName)? board[newName] : false)
}
//Try to return a square one row right, given a square.
function nextRight(square) {
  let column = square.name[0];
  let row = square.name[1];
  if( column == "f"){
    return false
  }
  const newName = columns[columns.indexOf(column) + 1] + row;
  return (square.edges.includes(newName)? board[newName] : false)
}


//CODE BLOCK TO GENERATE A COMPLETE BOARD OBJECT.  CONSIDER REFACTOR?

//return an object with a sub-object for each square on a standard board
function standardBoard(){
  const board = {}

  //define function to generate board edges
  function makeEdges(column, iter, name) {
    try {
      let adjacentSquare = columns[columns.indexOf(column) - 1] + iter.toString();
      if (board[adjacentSquare]){
        board[name].edges.push(adjacentSquare);
        board[adjacentSquare].edges.push(name);
      }
    }
    catch(error) {
      console.log(error);
    }
    finally {
      try {
        let adjacentSquare = column + (iter - 1).toString();
        if (board[adjacentSquare]){
          board[name].edges.push(adjacentSquare);
          board[adjacentSquare].edges.push(name);
        }
      }
      catch(error) {
        console.log(error);
      }
    }

  }
  //define function to make a column of the board
  //Importantly, this function adds edges between adjacent squares.
  function makeBoxesByColumn(column, topRow, bottomRow){
    for (let i = topRow; i <= bottomRow; i++) {
      let name = column + i.toString();
      board[name] = {
        width: 50,
        height: 50,
        color: "black",
        x: (columns.indexOf(column) * 50),
        y: (i * 50 + 50),
        name: name,
        edges: [],
        piece: "none",
        drawable: true,
        pushable: true,
        placeable: true,
        endgame: false
      }
      makeEdges(column, i, name);

    }
  }
  /* I've added columns and rows to surround the playable area
  as part of the board creation process...mostly to simplify the
  creation of edges.  Below, I'm going to edit all the boarder times
  to set them to undrawable and unplacable, and to variously edit their pushable
  and endgame conditions. I'm also going to set their height and width to zero,
  to make them unclickable.  I'm doing all this to create end destinations
  for a push command.
  */
  makeBoxesByColumn("a", 2, 6);
  makeBoxesByColumn("b", 1, 8);
  makeBoxesByColumn("c", 0, 9);
  makeBoxesByColumn("d", 0, 9);
  makeBoxesByColumn("e", 1, 8);
  makeBoxesByColumn("f", 3, 7);

  //set details for boarder tiles.  Consider refactor into functions.
  for ( let item of boarderTiles) {
    board[item].height = 0;
    board[item].width = 0;
    board[item].drawable = false;
    board[item].placeable = false;
    if (item[0] == "a" || item[0] == "f") {
      board[item].pushable = false;
    } else {
      board[item].endgame = true;
    }
  }
  console.log("board: ", board);

  return board;
}

//Function to Add adjacent squares as directional properties to a board
function addDirectionsToSquares(board) {
  for (let square of Object.values(board)) {
    let up = nextUp(square);
    let down = nextDown(square);
    let right = nextRight(square);
    let left = nextLeft(square);
    if (up) {
      square.up = up;
    }
    if (down) {
      square.down = down;
    }
    if (left) {
      square.left = left;
    }
    if (right) {
      square.right = right;
    }
  }
}

//THIS FUNCTION DOES THE INITIAL CANVAS DRAWING OF THE BOARD
function startGame() {
  myGameArea.start();

  //Generate drawn squares for playable squares on the board.

  for (var key of Object.keys(board)) {
    if (board[key].drawable) {
      makeBoardRegion(board[key].width, board[key].height, board[key].color, board[key].x, board[key].y, board[key].name);
    }
  }
  //draw side boxes (walls)
  component(25, 252, "black", 25, 149);
  component(25, 252, "black", 250, 199);
  //Add tests for pieces
  drawWhiteSquarePiece("c4");
  drawBrownSquarePiece("c5");
  drawWhiteRoundPiece("d4");
  drawBrownRoundPiece("d5");
}





//EVENT LISTENERS AND EVENT LISTENER HELPER FUNCTIONS

//adding a function to detect intersection between a click and my boxes
function isIntersect(point, box) {
  if (box.x <= point.x && point.x <= (box.x + box.width) && box.y <= point.y && point.y <= (box.y + box.height)){
    console.log(box.name);
    console.log("x,y: ", point.x, point.y);
    console.log("box coords: ", box.x, box.y);
    return box.name;
  } else {
    console.log('outside clickable region.')
  }
}
//adding a canvas event listener that can respond to clicking on boxes
canvas.addEventListener('click', (e) => {
  let name = ""
  const point = {
    x: e.clientX,
    y: e.clientY
  };
  for (var box of Object.values(board)) {
    name = isIntersect(point, box);
    if (name) {
      break;
    };
  }
  if (name) {
    if (turn.phase == "choosePiece1"){
      choosePiece(name);
      advanceTurn();
    } else {
      movePiece(name);
      turn.phase = "choosePiece1";
    }
  }

})

//Adding a call to start the game on page load.
startGame();
