"use strict";

// Potential color scheme: Harbor
// Hex: 354649 / 6C7A89 / A3C6C4 / E0E7E9
const colors = {
  "dark": "#354649",
  "lessDark": "#6C7A89",
  "lessLight": "#A3C5C4",
  "light": "#E0E7E9"
}


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
  player: "player_1",
  phase: "move1",
};

//an object to manage setup phase
const setupTracker = {
  setup : true,
  player : "player_1",
  pieces : {
    "round" : 2,
    "square" : 3
  }
}
setupTracker.allPlaced = function() {
  return(this.pieces.round == 0 && this.pieces.round == 0) ? true : false;
}
setupTracker.placeRound = function() {
  if (this.pieces.round > 0) this.pieces.round --;
  return this.pieces.round
}
setupTracker.placeSquare = function() {
  if (this.pieces.square > 0) this.pieces.square --;
  return this.pieces.square
}
setupTracker.changePlayer = function() {
  this.player = "player_2";
}
setupTracker.setupToggle = function() {
  this.setup = (true) ? false : true;
}


/* Adding a control object for pushes.
Right now, I'm returning strings for all outcomes of pushPiece, successful or not.
This is mostly for error handling, so I can see what's wrong.  It also might be
useful to send instructive messages about what's happening when a player tries to make
an illegal move.  The unfortunate consequence is that pushPiece and firstPush always
return truthy values.  The testPush method converts those strings to the square to be
targeted for pushing, if legal, or false if not.  I'll use that data to draw and
remove arrows on the UI. Is there a better way to do this? I hope I think of one. */
const pushControl = {};
pushControl.space = false;
pushControl.targets = {}
pushControl.directions = ["up", "down", "left", "right"]
pushControl.trueStrings = ['push_ok', ['endgame'], ['player_2 win'], ['player_1 win']]

//Test pushing in each direction from selected space; set pushControl.targets[direction]
//property of square that can be legally pushed.
pushControl.testPush = function() {
  let trueStrings = ['push_ok', ['endgame'], ['player_2 win'], ['player_1 win']]
  if (!pushControl.space) return "pushControl.space has not been set";
  this.directions.forEach(function(direction){
    pushControl.targets[direction] = firstPush(pushControl.space, direction, true);
    pushControl.targets[direction] = (pushControl.trueStrings.includes(pushControl.targets[direction])) ? pushControl.space[direction] : false;
  })
}
//Draw arrows on valid push directions.
pushControl.drawArrows = function() {
  Object.entries(this.targets).forEach(([key, value]) => drawPoly(value, arrow[key], arrow.options));
}
//Clear arrows from valid push directions.
pushControl.clearArrows = function() {
  Object.values(this.targets).forEach((value) => updateSpace(value));
}
//Clear pushControl variable.
pushControl.reset = function() {
  this.space = false;
  this.targets = {};
}

const moveControl = {};
moveControl.space = false;

//Create an array of turn phases (in order of normal progression).
const phaseArray = ["move1", "move2", "push"];
// List of unplayable tile names
// used for board generation, setting non-standard tile properties.
const borderTiles = ["a2", "a3", "a4", "a5", "a6", "b1", "b7",
                      "b8", "c0", "c9", "d0", "d9", "e1", "e2",
                      "e8", "f3", "f4", "f5", "f6", "f7"
                    ];

const columns = "abcdef";
let anchorSquare = "";

//Variables for drawing images on CANVAS

//Add arrow variable with coordinates to draw arrows in various directions.
const arrow = {}
arrow.options = {}
arrow.options.fillStyle = colors.light;
arrow.options.strokeStyle = colors.dark;
arrow.options.fill = true;
arrow.options.stroke = true;

arrow.up = [
            [25, 5], [45, 25], [30, 25], [30, 45],
            [20, 45], [20, 25], [5, 25], [25, 5]
            ];

arrow.left = [];
arrow.up.forEach((pair) => arrow.left.push([pair[1], pair[0]]));

arrow.down = [];
arrow.up.forEach((pair) => arrow.down.push([50 - pair[0], 50 - pair[1]]));

arrow.right = [];
arrow.up.forEach((pair) => arrow.right.push([50 - pair[1], 50 - pair[0]]));


//generate Board object with nodes and edges.
const board = standardBoard();
// addDirectionsToSquares(board);
addSidesToBoard(board);
addSpecialSquares(board);



//BASIC FUNCTIONS FOR DRAWING AND ERASING SHAPES

//Make a function to draw the outlines of empty rectangles.
//TODO: Refactor to make this accept an object instead of 5 params
function makeBoardRegion(width, height, color, x, y) {
  const ctx = myGameArea.context;
  component(width, height, color, x, y);
  ctx.strokeRect(x, y, width, height);
}

//this function draws filled rectangles.
//TODO: Refactor to give this a better name
//TODO: Refactor to make this accept an object instead of 5 params
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
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();

}

//new clear function that takes a space instead of a name.
function clear(space) {
  const ctx = myGameArea.context;
  ctx.clearRect(space.x, space.y, space.width, space.height);
  makeBoardRegion(space.width, space.height, space.color, space.x, space.y);
  space.piece = "";
}

//draw a highlighted region around a selected square.
function highlightSquare(space){
  const ctx = myGameArea.context;
  let defaultColor = ctx.strokeStyle;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#EEF11C";
  ctx.strokeRect(space.x + 3, space.y + 3, space.width - 6, space.height -6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = defaultColor;
}

//draw a filled box with text.
function textBox(box, textColor, font, fontsize, text, outline = true, textborder = false) {
  const {width, height, color, x, y} = box;
  const ctx = myGameArea.context;
  (outline) ? makeBoardRegion(width, height, color, x, y) : component(width, height, color, x, y);
  let defaultFont = ctx.font;
  let defaultColor = ctx.fillStyle;
  ctx.font = String(fontsize) + "px " + font;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.fillText(text, (x + width / 2), (y + height / 2 + fontsize / 3));
  if (textborder) ctx.strokeText(text, (x + width / 2), (y + height / 2 + fontsize / 3));
  ctx.font = defaultFont;
  ctx.fillStyle = defaultColor;
}

/* Draw any polygon given an object with x,y properties for offset,
array of coordinates, color, stroke, and fill options (with defaults).
*/

function drawPoly(offsetObj, coords, options = arrow.options){
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

//FUNCTIONS THAT DRAW PIECES ON REGIONS

//Draw any piece, given a space and a piece-name.
function drawAnyPiece(space, piece = ""){
  component(48, 48, colors.lessLight, space.x + 1, space.y +1);
  if (piece == "player_1Square"){
    component(30, 30, colors.light, space.x + 10, space.y + 10);
    myGameArea.context.strokeRect(space.x + 10, space.y + 10, 30, 30);
  } else if (piece == "player_2Square"){
    component(30, 30, colors.dark, space.x + 10, space.y + 10);
    myGameArea.context.strokeRect(space.x + 10, space.y + 10, 30, 30);
  } else if (piece == "player_1Round"){
    drawCircle(15, colors.light, space.x + 25, space.y + 25);
  } else if (piece == "player_2Round"){
    drawCircle(15, colors.dark, space.x + 25, space.y + 25);
  } else {
    clear(space);
  }
  space.piece = piece;
}

//draw a red highlight around a piece to indicate anchor.
function addAnchor(space){
  const ctx = myGameArea.context;
  let defaultColor = ctx.strokeStyle;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";
  ctx.strokeRect(space.x + 5, space.y + 5, space.width - 10, space.height -10);
  ctx.lineWidth = 1;
  ctx.strokeStyle = defaultColor;
  if (anchorSquare) {
    anchorSquare.hasAnchor = false;
    updateSpace(anchorSquare);
  }
  anchorSquare = space;
  space.hasAnchor = true;
}
// draw setup spaces


//I need a better drawing function that just draws whatever is on the square
function updateSpace(space) {
  if (!space.drawable){
    return "invalid space";
  }
  drawAnyPiece(space, space.piece);
}

//FUNCTIONS TO MANIPULATE PIECES

//Move a piece from one square to another.
function move(startSpace, targetSpace) {
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
//This function handles special conditions for the beginning of a push,
//then calls pushPiece to handle most of the work.
function firstPush(space, direction, test = false) {
  if (!matchPiece(space)) return "wrong color";
  if (space.piece == "player_1Round" || space.piece == "player_2Round") return "wrong shape";
  if (!space[direction]) return "push must target an adjacent square";
  if (!space[direction].piece) return "push must target an adjacent piece";
  return pushPiece(space, direction, test);
}
//Run a sequence of functions to control a push.

/* Adding a test optional parameter so I can check
for legal pushes without moving pieces.  (Having
no legal pushes after one's moves is a lose
condition.) */
function pushPiece(space, direction, test = false) {
  if (space == anchorSquare || !space.pushable) {
    return "blocked";
  }
  if (space.placeable && !space.piece) {
    return "push_ok";
  }
  if (space.endgame) {
    return "endgame";
  }
  //Call pushPiece on the next square in line to determine end condition
  let code = pushPiece(space[direction], direction, test);
  //Handle endgame and win responses from next square
  if (code == "endgame") {
    if (space.piece == "player_1Round" || space.piece == "player_1Square"){
      return "player_2 win";
    }
    else {
      return "player_1 win";
    }
  }
  if (code == "player_2 win") {
    return code;
  }
  if (code == "player_1 win") {
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
function changePlayer() {
  turn.player = (turn.player == "player_1") ? "player_2" : "player_1";
}

//Move turn.phase forward
function advanceTurn() {
  if (turn.phase == "push"){
    turn.phase = "move1";
    changePlayer();
  } else {
    turn.phase = phaseArray[phaseArray.indexOf(turn.phase) + 1];
  }
}

//Test whether a space is occupied
let hasPiece = space => (space.piece) ? true: false;
//Test whether a selected piece belongs to the current player
let matchPiece = space => (turn.player == space.piece.slice(0,8)) ? true: false;

//Handle game logic during a Move phase
function handleMove(space) {
  if (!moveControl.space) {
    if (!matchPiece(space) || (!hasPiece(space))) return `Choose a tile with one of your pieces, ${turn.player}.`;
    highlightSquare(space);
    moveControl.space = space;
    return "Click on an empty square to move, or on the highlighted square to cancel."
  } else if (space == moveControl.space){
    updateSpace(space);
    moveControl.space = "";
    return "Move cancelled."
  } else {
    if (hasPiece(space)) return "You cannot move onto an occupied space.";
    let message = move(moveControl.space, space);
    if (message == "move complete.") {
      advanceTurn();
      moveControl.space = ""
      return message;
    } else {
      return message;
    }
  }
}

//Handle game logic during a Push phase
function handlePush(space) {
  //Handle selection of piece to be pushed
  if (!pushControl.space) {
    //Handle illegal piece choices: wrong color, wrong shape, empty square
    if (!matchPiece(space) || !hasPiece(space) || space.piece.slice(8, 14) != "Square") {
      return `Choose a tile with one of your square pieces, ${turn.player}.`;
    }
    //Handle valid piece selection
    highlightSquare(space);
    pushControl.space = space;
    //Test a space's directions for legal pushes.
    pushControl.testPush();
    //Draw arrows on legal push spaces
    pushControl.drawArrows();
    return "Click on an arrow to push, or on the highlighted square to cancel."
    //Handle push cancellation.
  } else if (space == pushControl.space) {
    updateSpace(space);
    pushControl.clearArrows();
    pushControl.reset();
    return "Push cancelled."
    //Handle push attempt.
  } else {
    let direction = Object.keys(pushControl.targets).find(key => pushControl.targets[key] === space);
    let message = firstPush(pushControl.space, direction);
    //Cleanup commands to run on execution of legal push.
    if (pushControl.trueStrings.includes(message)) {
      pushControl.clearArrows();
      pushControl.reset();
      addAnchor(space);
      advanceTurn();
      return message;
      //return message on illegal push.
    } else {
      return message;
    }
  }
}

//Handle game logic during endturn phase...maybe unnecessary?
function endTurn() {
  console.log("hitting endTurn");
  console.log("turn before endTurn:", turn);
  turn.phase = "Move1";
  changePlayer();
  console.log("turn after endTurn:", turn);
  return `${turn.player} player: begin turn!`
}
//Manage game.
function handleGame(space) {
  if (turn.phase == "move1" || turn.phase == "move2") {
    console.log(handleMove(space));
  } else if (turn.phase == "push") {
    console.log(handlePush(space));
  } else {
    console.log(endTurn());
  }
}
//Setup phase functions.
//Place light pieces
function setupPiece(player, Space){

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
        color: colors.lessLight,
        x: (columns.indexOf(column) * 50) + .5,
        y: (i * 50 + 50) + .5,
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
    color: colors.dark,
    x: 295.5,
    y: 100.5,
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
    color: colors.dark,
    x: 295.5,
    y: 180.5,
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
//
function makePieceReserve(player, piece, number){
  try {
    let name = `${player} ${piece}`;
    console.log("try name:", name);
    if (!board[name]) throw new Error("must generate reserve regions.");
  } catch(error){
    console.log(error);
    //generate reserve spaces if none exist. Refactor?
    let space = {};
    space.width = 100;
    space.height = 50;
    space.color = colors.lessLight;
    space.x = 50.5;
    space.y = 50.5;
    space.name = "player_1 square";
    space.piece = "square";
    space.drawable = true;
    board[space.name] = space;
    console.log(`${space.name}`, board[space.name])

    space.x += 150;
    space.name = "player_1 round";
    space.piece = "round";
    board[space.name] = space;
    console.log(`${space.name}`, board[space.name])


    space.y += 500;
    space.name = "player_2 round";
    board[space.name] = space;
    console.log(`${space.name}`, board[space.name])


    space.x -= 150;
    space.name = "player_2 square";
    space.piece = "square";
    board[space.name] = space;
    console.log(`${space.name}`, board[space.name])

    console.log("reserves generated.");
  } finally {
    let space = board[`${player} ${piece}`];
    console.log(`${player} ${piece}`);
    console.log(space);
    makeBoardRegion(space.width, space.height, space.color, space.x, space.y);

  }
}

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

//Run addSides on all board spaces.
function addSidesToBoard(board){
  Object.values(board).forEach((square) => addSides(square));
}


//THIS FUNCTION DOES THE INITIAL CANVAS DRAWING OF THE BOARD
function startGame() {
  myGameArea.start();
  //Draw Background
  component(canvas.width, canvas.height, colors.lessDark, 0, 0);

  //Generate drawn squares for playable squares on the board.
  for (var key of Object.keys(board)) {
    if (board[key].drawable) {
      makeBoardRegion(board[key].width, board[key].height, board[key].color, board[key].x, board[key].y, board[key].name);
    }
  }
  //Draw side boxes (walls)
  makeBoardRegion(15, 252, colors.dark, 35.5, 149.5);
  makeBoardRegion(15, 252, colors.dark, 250.5, 199.5);

  //Add Special buttons (e.g. pushButton)
  textBox(board.pushButton, "#FEFEFE", "Arial", 18, "PUSH");
  textBox(board.moveButton, "#FEFEFE", "Arial", 18, "MOVE");
  //Add setup regions
  makePieceReserve("player_1", "square", setupTracker.pieces.square);
  makePieceReserve("player_2", "square", setupTracker.pieces.square);
  makePieceReserve("player_1", "round", setupTracker.pieces.round);
  makePieceReserve("player_2", "round", setupTracker.pieces.round);




  //Add tests for pieces
  drawAnyPiece(board["c4"], "player_1Square");
  drawAnyPiece(board["d4"], "player_1Round");
  drawAnyPiece(board["c5"], "player_2Square");
  drawAnyPiece(board["d5"], "player_2Round");
}




//EVENT LISTENERS AND EVENT LISTENER HELPER FUNCTIONS

//adding a function to detect intersection between a click and my boxes
function isIntersect(point, box) {
  if (box.x <= point.x && point.x <= (box.x + box.width) && box.y <= point.y && point.y <= (box.y + box.height)){
    console.log(box.name);
    console.log("x,y: ", point.x, point.y);
    console.log("box coords: ", box.x, box.y);
    return box;
  }
}
//adding a canvas event listener that can respond to clicking on boxes
canvas.addEventListener('click', (e) => {
  let space = "";
  const point = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop
  };
  for (var box of Object.values(board)) {
    space = isIntersect(point, box);
    if (space) {
      break;
    };
  }
  if (!space) console.log("outside clickable region");
  if (space.name == "pushButton") {
    console.log("name: ", name);
    console.log("board[name]: ", board[name]);
    console.log("board[name].x: ", board[name].x);

    highlightSquare(board.pushButton);
  }
  console.log("space: ", space);
  if (space) {
    console.log("starting handleGame");
    handleGame(space);
    } else {
      console.log("did not click on space");

    }
})

//Adding a call to start the game on page load.
startGame();
