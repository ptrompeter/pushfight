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
// used for board generation, (and maybe win detection and push logic).
const borderTiles = ["a2", "a3", "a4", "a5", "a6", "b1", "b7",
                      "b8", "c0", "c9", "d0", "d9", "e1", "e2",
                      "e8", "f3", "f4", "f5", "f6", "f7"
                    ];

const columns = "abcdef";
let anchorSquare = "";

//Variables for drawing images on CANVAS

const arrowOptions = {}
arrowOptions.fillStyle = '#F9DC05';
arrowOptions.strokeStyle = 'black';
arrowOptions.fill = true;
arrowOptions.stroke = true;

const arrowUpCoords = [
                        [25, 5], [45, 25], [30, 25], [30, 45],
                        [20, 45], [20, 25], [5, 25], [25, 5]
                      ];

const arrowLeftCoords = [];
arrowUpCoords.forEach((pair) => arrowLeftCoords.push([pair[1], pair[0]]));

const arrowDownCoords = [];
arrowUpCoords.forEach((pair) => arrowDownCoords.push([50 - pair[0], 50 - pair[1]]));

const arrowRightCoords = [];
arrowUpCoords.forEach((pair) => arrowRightCoords.push([50 - pair[1], 50 - pair[0]]));

//generate Board object with nodes and edges.
const board = standardBoard();
// addDirectionsToSquares(board);
addSidesToBoard(board);
addSpecialSquares(board);


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
  target.piece = "";
}

//new clear function that takes a space instead of a name.
function clear(space) {
  const ctx = myGameArea.context;
  ctx.clearRect(space.x, space.y, space.width, space.height);
  makeBoardRegion(space.width, space.height, space.color, space.x, space.y);
  space.piece = "";
}

//draw a highlighted region around a selected square.
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

//draw a filled box with text.
function textBox(box, textColor, font, fontsize, text) {
  const {width, height, color, x, y} = box;
  const ctx = myGameArea.context;
  component(width, height, color, x, y);
  let defaultFont = ctx.font;
  let defaultColor = ctx.fillStyle;
  ctx.font = String(fontsize) + "px " + font;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.fillText(text, (x + width / 2), (y + height / 2 + fontsize / 3));
  ctx.font = defaultFont;
  ctx.fillStyle = defaultColor;
}


//FUNCTIONS THAT DRAW PIECES ON REGIONS

//Draw any piece, given a space and a piece-name.
function drawAnyPiece(space, piece = ""){
  component(48, 48, "#DDFAFD", space.x + 1, space.y +1);
  if (piece == "whiteSquare"){
    component(30, 30, "#FBD5AC", space.x + 10, space.y + 10);
    myGameArea.context.strokeRect(space.x + 10, space.y + 10, 30, 30);
  } else if (piece == "brownSquare"){
    component(30, 30, "#915C1E", space.x + 10, space.y + 10);
    myGameArea.context.strokeRect(space.x + 10, space.y + 10, 30, 30);
  } else if (piece == "whiteRound"){
    drawCircle(15, "#FBD5AC", space.x + 25, space.y + 25);
  } else if (piece == "brownRound"){
    drawCircle(15, "#915C1E", space.x + 25, space.y + 25);
  } else {
    clear(space);
  }
  space.piece = piece;
}

//draw a red highlight around a piece to indicate anchor.
function addAnchor(spaceName){
  let target = board[spaceName];
  const ctx = myGameArea.context;
  let defaultColor = ctx.strokeStyle;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#EF1B13";
  ctx.strokeRect(target.x + 5, target.y + 5, target.width - 10, target.height -10);
  ctx.lineWidth = 1;
  ctx.strokeStyle = defaultColor;
  if (anchorSquare) {
    board[anchorSquare].hasAnchor = false;
    drawPiece(board[anchorSquare].piece, anchorSquare);
  }
  anchorSquare = spaceName;
  target.hasAnchor = true;
}

//I need a better drawing function that just draws whatever is on the square
function updateSpace(space) {
  if (!space.drawable){
    return "invalid space";
  }
  drawAnyPiece(space, space.piece);
}

//FUNCTIONS TO MANIPULATE PIECES

//function to select a piece for movement
function choosePiece(spaceName){
  turn.movePieceAt = spaceName;
  turn.piece = board[spaceName].piece;
  highlightSquare(spaceName);
}

//function to move a selected space to a new square.
//TODO: make this function obsolete, the delete
function movePiece(spaceName){
  let moveTo = board[spaceName];
  let moveFrom = board[turn.movePieceAt];
  moveTo.piece = turn.piece;
  moveFrom.piece = "";
  clearSpace(moveFrom.name);
  drawPiece(turn.piece, spaceName);
}
//writing a superior move function that just takes spaces as arguments
function move(startSpace, targetSpace){
  if (targetSpace.piece || !targetSpace.placeable) {
    return "move failed.";
  }
  if (!startSpace.piece) {
    return "no piece on start tile.";
  }
  drawAnyPiece(targetSpace, startSpace.piece);
  clear(startSpace);
  return "move complete.";
}

//FUNCTIONS TO EFFECT A PUSH

//Run a sequence of functions to control a push.

/* Adding a test optional parameter so I can check
for legal pushes without moving pieces.  (Having
no legal pushes after one's moves is a lose
condition.) */
function pushPiece(space, direction, test = false){
  if (space.hasAnchor || !space.pushable) {
    return "blocked";
  }
  if (space.placeable && !space.piece){
    return "push_ok";
  }
  if (space.endgame) {
    return "endgame";
  }
  //Call pushPiece on the next square in line to determine end condition
  let code = pushPiece(space[direction], direction, test);
  //Handle endgame and win responses from next square
  if (code == "endgame") {
    if (space.piece == "whiteRound" || space.piece == "whiteSquare"){
      return "brown win";
    }
    else {
      return "white win";
    }
  }
  if (code == "brown win") {
    return code;
  }
  if (code == "white win") {
    return code;
  }
  //Handle other responses
  if (code == "blocked") {
    return "blocked";
  }
  if (code == "push_ok") {
    if (!test) {
      move(space, space[direction])
      return code;
    } else {
      return code;
    }
  }
  return "something unexpected happened.";
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
//writing a single function to add up, down, left, and right properties to squares.
function addSides(square){
  let column = square.name[0];;
  let row = parseInt(square.name[1]);
  let newName = column + String(row - 1);
  square.up = (square.edges.includes(newName) ? board[newName] : false)
  newName = column + String(row + 1);
  square.down = (square.edges.includes(newName) ? board[newName] : false)
  if (column != "a"){
    newName = columns[columns.indexOf(column) - 1] + String(row);
    square.left = (square.edges.includes(newName) ? board[newName] : false)
  } else {
    square.left = false;
  }
  if (column != "f"){
    newName = columns[columns.indexOf(column) + 1] + String(row);
    square.right = (square.edges.includes(newName) ? board[newName] : false)
  } else {
    square.right = false;
  }
}

function addSidesToBoard(board){
  Object.values(board).forEach((square) => addSides(square));
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
      console.log(name);
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
        piece: "",
        drawable: true,
        pushable: true,
        placeable: true,
        endgame: false,
        hasAnchor: false
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
  for ( let item of borderTiles) {
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

//adding a function to create 1-off special squares
function addSpecialSquares(board){
  const pushButton1 = {
    width: 60,
    height: 50,
    color: "#EF1B13",
    x: 295,
    y: 100,
    name: "pushButton",
    edges: [],
    piece: "",
    drawable: false,
    pushable: false,
    placeable: false,
    endgame: false,
    hasAnchor: false
  }
  board.pushButton = pushButton1;
  const moveButton = {
    width: 60,
    height: 50,
    color: "#EF1B13",
    x: 295,
    y: 180,
    name: "moveButton",
    edges: [],
    piece: "",
    drawable: false,
    pushable: false,
    placeable: false,
    endgame: false,
    hasAnchor: false
  }
  board.moveButton = moveButton;
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
  //Draw side boxes (walls)
  component(25, 252, "black", 25, 149);
  component(25, 252, "black", 250, 199);

  //Add Special buttons (e.g. pushButton)
  component(60, 50, "#EF1B13", 295, 100);
  textBox(board.pushButton, "#FEFEFE", "Arial", 18, "PUSH");
  textBox(board.moveButton, "#FEFEFE", "Arial", 18, "MOVE");



  //Add tests for pieces
  drawAnyPiece(board["c4"], "whiteSquare");
  drawAnyPiece(board["d4"], "whiteRound");
  drawAnyPiece(board["c5"], "brownSquare");
  drawAnyPiece(board["d5"], "brownRound");
}


/* Draw any polygon given an object with x,y properties for offset,
array of coordinates, color, stroke, and fill options (with defaults).
*/

function drawPoly(offsetObj, coords, options = arrowOptions){
  const {x, y} = offsetObj;
  const ctx = myGameArea.context;
  ctx.fillStyle = options.fillStyle;
  ctx.strokeStyle = options.strokeStyle;
  ctx.beginPath();
  coords.forEach((pair) => ctx.lineTo(pair[0] + x, pair[1] + y));
  ctx.closePath();
  (options.fill) ? ctx.fill() : {};
  (options.stroke) ? ctx.stroke() : {};
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
  let name = "";
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
  if (name == "pushButton") {
    console.log("name: ", name);
    console.log("board[name]: ", board[name]);
    console.log("board[name].x: ", board[name].x);

    highlightSquare("pushButton");
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
//Adding some function tests
//
// console.log(pushPiece(board.c4, "right"));
// console.log(pushPiece(board.c5, "up"));
// console.log(pushPiece(board.e4, "right"));
// console.log(pushPiece(board.e4, "up"));
// console.log(pushPiece(board.e3, "up"));
drawPoly(board.b3, arrowUpCoords);
drawPoly(board.c3, arrowLeftCoords);
drawPoly(board.d3, arrowRightCoords);
drawPoly(board.e3, arrowDownCoords);
