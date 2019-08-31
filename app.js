"use strict";

// Potential color scheme: Harbor
// Hex: 354649 / 6C7A89 / A3C6C4 / E0E7E9
//Added alternate color scheme options. changeScheme will change it.
const harbor = {
  "dark": "#354649",
  "lessDark": "#6C7A89",
  "lessLight": "#A3C5C4",
  "light": "#E0E7E9",
  "name": "harbor"
}

const compote = {
  "dark": "#934A5F",
  "lessDark": "#57648C",
  "lessLight": "#C2B4D6",
  "light": "#E5E5E5",
  "name": "compote"
}

const pebble = {
  "dark": "#433E49",
  "lessDark": "#928390",
  "lessLight": "#DBC1AD",
  "light": "#F3E8EB",
  "name": "pebble"
}

const brisk = {
  "dark": "#4C4556",
  "lessDark": "#872642",
  "lessLight": "#F6C026",
  "light": "#A0D3F9",
  "name": "brisk"
}

const scuba = {
  "dark": "#0C4A60",
  "lessDark": "#EF6C33",
  "lessLight": "#ABDFF1",
  "light": "#E1DDDB",
  "name": "scuba"
}

let colors = harbor;

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
  setup: true,
  player: "player_1",
  phase: "move1",
  winner: false
};

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
pushControl.trueStrings = ["push_ok", "endgame", "player_2 win", "player_1 win"]

//Test pushing in each direction from selected space; set pushControl.targets[direction]
//property of square that can be legally pushed.
pushControl.testPush = function() {
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

const boardSpaces = {
                     "a": [2, 6],
                     "b": [1, 8],
                     "c": [0, 9],
                     "d": [0, 9],
                     "e": [1, 8],
                     "f": [3, 7]
                    };

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

const defaultSpace = {
        width: 50,
        height: 50,
        color: colors.lessLight,
        piece: false,
        drawable: true,
        pushable: true,
        placeable: true,
        endgame: false,
        hasAnchor: false
      }

const defaultControl = {
        width: 50,
        height: 50,
        color: colors.dark,
        drawable: true,
        placeable: false,
        font: "Arial",
        text: [],
        textSize: 18,
        textColor: "white",
      }


//generate Board object with nodes and edges.
const board = standardBoard();
addReserves();


/* Change color scheme.  Takes an object with a format similar to the color
objects above, or a string with a color scheme name if an object already exists.
Otherwise, cycles color scheme. */
function changeScheme(colorObj = false, colorStr = false) {
  const colorArray = [
                      [compote, "compote"], [pebble, "pebble"],
                      [brisk, "brisk"], [scuba, "scuba"], [harbor, "harbor"]
                    ];
  const objArray = colorArray.filter(item => item[0]);
  const strArray = colorArray.filter(item => item[1]);
  let idx;
  if (!colorObj && !colorStr) {
    if (colors == colorArray[objArray.length - 1][0]) {
      colors = colorArray[0][0];
    } else {
      idx = colorArray.findIndex(function(item){
        return item[0] == colors;
      });
      colors = colorArray[idx + 1][0];
    }
  }
  if (colorObj) {
      idx = objArray.findIndex(item => item == colorObj);
      colors = objArray[idx + 1];
  }
  if (colorStr) {
    idx = strArray.findIndex(item => item == colorStr);
    colors = objArray[idx + 1]
  }
  refreshBoard(board);
  populateReserves();
}

//BASIC FUNCTIONS FOR DRAWING AND ERASING SHAPES

//Make a function to draw the outlines of empty rectangles.
//TODO: Refactor to make this accept an object instead of 5 params
function makeBoardRegion(width, height, color, x, y) {
  const ctx = myGameArea.context;
  component(width, height, color, x, y);
  ctx.strokeRect(x, y, width, height);
  drawCenterLine();
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
//Added optional variable to allow wiping of  a space without changing
//space.piece for setup handling.
function clear(space, removePiece = true) {
  const ctx = myGameArea.context;
  ctx.clearRect(space.x, space.y, space.width, space.height);
  makeBoardRegion(space.width, space.height, space.color, space.x, space.y);
  if (removePiece) space.piece = "";
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
function textBox(box, textColor, font, fontsize, textArray, outline = true, textborder = false) {
  const {width, height, color, x, y} = box;
  const ctx = myGameArea.context;
  (outline) ? makeBoardRegion(width, height, color, x, y) : component(width, height, color, x, y);
  let defaultFont = ctx.font;
  let defaultColor = ctx.fillStyle;
  ctx.font = String(fontsize) + "px " + font;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  textArray.forEach(function(text, idx){
    ctx.fillText(text, (x + width / 2), (y + height / (textArray.length + 1) + fontsize / 3 + idx * fontsize * 2));
    if (textborder) ctx.strokeText(text, (x + width / 2), (y + height / 2 + fontsize / 3 + idx * fontsize));
  })
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
  makeBoardRegion(50, 50, colors.lessLight, space.x, space.y);
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
  drawCenterLine();
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

//I need a better drawing function that just draws whatever is on the square
function updateSpace(space) {
  if (!space.drawable){
    return "invalid space";
  }
  drawAnyPiece(space, space.piece);
}
//squares drawn on initial board seem to have fixed colors, rather than pointers
//to a color object.  Drafting a refreshColors function to try to reset the counter.
//TODO: It would be better if this function were unnecessary.
function refreshColors(board) {
  Object.values(board).forEach(function(value){console.log(value.color)});
}

//Redraw the board.
function refreshBoard(board) {
  // const ctx = myGameArea.context;
  console.log("colors", colors);
  console.log("window:", window);
  component(canvas.width, canvas.height, colors.lessDark, 0, 0);
  makeBoardRegion(15, 252, colors.dark, 35.5, 149.5);
  makeBoardRegion(15, 252, colors.dark, 250.5, 199.5);
  Object.values(board).forEach(function(space) {
    updateSpace(space);
    if (space.text) {
      // let defaultStyle = ctx.fillStyle;
      let textColor = (space.color == colors.dark || space.color == colors.lessDark) ? "white" : "black";
      textBox(space, textColor, "Arial", 18, space.text);
    }
  });
}

//Draw wider center line between row 4 and 5.  Probably redraw it all the time.
function drawCenterLine() {
  const ctx = myGameArea.context;
  const defaultLineWidth = ctx.lineWidth;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(49.5, 299.5);
  ctx.lineTo(249.5, 299.5);
  ctx.stroke();
  ctx.lineWidth = defaultLineWidth;
}

function drawBoard(board) {
  for (var key of Object.keys(board)) {
    if (board[key].drawable) {
      makeBoardRegion(board[key].width, board[key].height, board[key].color, board[key].x, board[key].y, board[key].name);
    }
  }
  //Draw side boxes (walls)
  makeBoardRegion(15, 252, colors.dark, 35.5, 149.5);
  makeBoardRegion(15, 252, colors.dark, 250.5, 199.5);

  //Add Special buttons (e.g. pushButton)
  textBox(board.done, colors.light, "Arial", 18, ["DONE"]);
  textBox(board.skip, colors.light, "Arial", 18, ["SKIP"]);
}

//FUNCTIONS TO MANIPULATE PIECES

//Move a piece from one square to another.
//added removePiece option to pass to clear.
function move(startSpace, targetSpace, removePiece = true) {
  if (targetSpace.piece || !targetSpace.placeable) {
    return "move failed.";
  }
  if (!startSpace.piece) {
    return "no piece on start tile.";
  }
  drawAnyPiece(targetSpace, startSpace.piece);
  clear(startSpace, removePiece);
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
  //Added conditional to actually set a winner on a winning non-test push.
  if (code == "endgame") {
    if (space.piece == "player_1Round" || space.piece == "player_1Square"){
      if (!test) turn.winner = "player_2";
      return "player_2 win";
    }
    else {
      if (!test) turn.winner = "player_1";
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
    if (turn.phase == "push"){
      const legalMove = checkNoLegalPush();
      if (!legalMove){
        changePlayer();
        turn.winner = turn.player;
        const message = "No legal pushes!"
        if (detectWin()) return handleEndGame(turn.winner, message);
        console.log("detectWin seems to have failed.")
        // handleEndGame(turn.winner, message);
      }
    pushControl.reset();
    }
  }
}

//Check for no legal pushes win condition - to be called at the end of
//advance turn to not require a click.
//TODO: This function is buggy.  Getting false losses.
function checkNoLegalPush() {
  const squaresArray = [];
  if (turn.phase == "push") {
    let player = turn.player;
    let legalPush = false;
    Object.values(board).forEach(function(value){
      if (value.piece == player + "Square") squaresArray.push(value);
    });
    squaresArray.forEach(function(value) {
      pushControl.space = value;
      pushControl.testPush();
      Object.values(pushControl.targets).forEach(function(value){
        if (value != false) legalPush = true;
      });
    });
    return legalPush;
  }

}

//Test whether a space is occupied
let hasPiece = space => (space.piece) ? true: false;
//Test whether a selected piece belongs to the current player
let matchPiece = space => (turn.player == space.piece.slice(0,8)) ? true: false
//detect a win
let detectWin = () => (turn.winner) ? true : false;
//Handle end game condition.
function handleEndGame(winner, message = "") {
  // component(canvas.width, canvas.height, colors.lessDark, 0, 0);
  board.winner = {}
  board.winner.color = colors.lessLight;
  board.winner.x = 225.5;
  board.winner.y = 100.5;
  board.winner.width = 150;
  board.winner.height = 80;
  board.winner.message = (turn.winner == "player_1")? ["Player 1 Wins!"] : ["Player 2 Wins!"];
  if (message) board.winner.message.push(message);
  component(200, 350, colors.lessDark, 275.5, 100);
  textBox(board.winner, "black", "Arial", 18, board.winner.message);

}
//Handle game logic during a Move phase
function handleMove(space) {
  if (space.name == "skip") return skip();
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
    testArray = [];
    if (testEmptyPath(moveControl.space, space)) {
      let message = move(moveControl.space, space);
      if (message == "move complete.") {
        advanceTurn();
        moveControl.space = ""
        return message;
      } else {
        return message;
      }
    } else {
      return "You can only move pieces along empty paths."
    }

  }
}
//Skip buttom advances turn to push phase.
function skip(){
  if (moveControl.space) {
    updateSpace(moveControl.space);
    moveControl.space = false;
  }
  while (turn.phase != "push"){
    advanceTurn();
  }
  return "Advancing turn to push phase."
}

//Test whether two spaces are connected by empty spaces.
//TODO: This is a hacky guess-and-check traversal.  Make it better.
let testArray = [];
function testEmptyPath(startSpace, endSpace) {
  testArray.push(startSpace);
  if (startSpace == endSpace) return true;
  let directions = ["up", "down", "left", "right"];
  let message = false;
  for (var i = 0; i < directions.length; i++) {
    let direction = directions[i];
    let target = startSpace[direction];
    if (target && !testArray.includes(target) &&
        !target.piece && target.placeable) {
      message = testEmptyPath(target, endSpace);
    }
    if (message) break;

  };
  return message;
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
    let direction = Object.keys(pushControl.targets).find(key => pushControl.targets[key] == space);
    let message = firstPush(pushControl.space, direction);
    //Cleanup commands to run on execution of legal push.
    if (pushControl.trueStrings.includes(message)) {
      pushControl.clearArrows();
      pushControl.reset();
      if (detectWin()) {
        // if message = "player_1 win"
        return handleEndGame(turn.winner, "Nice push!");
      }
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
  turn.phase = "Move1";
  changePlayer();
  return `${turn.player} player: begin turn!`
}
//Manage game.
function handleGame(space) {
  if (space.name == "reset") {
    turn.setup = true;
    turn.player = "player_1";
    turn.phase = "move_1";
    moveControl.space = false;
    Object.values(board).forEach(function(value){
      if (parseInt(value.name[1])) value.piece = false;
    })
    addReserves();
    startGame();
  }
  if (turn.setup) {
    handleSetup(space);
  } else if (turn.phase == "move1" || turn.phase == "move2") {
    handleMove(space);
  } else if (turn.phase == "push") {
    handlePush(space);
  } else {
    endTurn();
  }
}
//Setup phase functions.
//Manage setup.
function handleSetup(space){
  if (space.name == "done") return resolveDone();
  if (testReserve(space) && space.num < 1) return "No pieces left in that reserve.";
  if (!moveControl.space) {
    if (!space.piece) return "Select a tile with one of your pieces.";
    if (!matchPiece(space)) return "You can only move your own pieces during setup.";
    highlightSquare(space);
    moveControl.space = space;
    return("handleSetup finished.")
  };
  if (space == moveControl.space) {
    updateSpace(space);
    moveControl.space = false;
    populateReserves();
    return "Move cancelled.";
  };
  if (!testLegalStartSquare(space)) return "Wrong half of board.";
  if (space.piece) return "Cannot place on occupied space.";
  if (testReserve(moveControl.space)) {
    if (moveControl.space.num < 1) return "No pieces left in that reserve.";
    const message = setupPiece(moveControl.space, space);
    moveControl.space = false;
    return message;
  } else {
    return move(moveControl.space, space);
  }
  return "Something weird happened.";
}
//Handle click of done button during setup.
function resolveDone(){
  if (moveControl.space) return "Please finish your move or cancel it before ending your setup.";
  const player = turn.player;
  if (board[player + "SquareReserve"].num != 0) return "You must place all your pieces.";
  if (board[player + "RoundReserve"].num != 0) return "You must place all your pieces.";
  if (player == "player_1") {
    changePlayer();
    return "Player 2: Place your Pieces.";
  } else {
    turn.setup = false;
    //The next lines edit away the piece, width, and height attributes of the
    //reserve squares so they aren't redrawn. This is a terrible way to handle it.
    //TODO: Condense the following lines.  So far, delete is not a good option.
    board[turn.player + "SquareReserve"].piece = "";
    board[turn.player + "SquareReserve"].width = 0;
    board[turn.player + "SquareReserve"].height = 0;
    board[turn.player + "SquareReserve"].drawable = false;
    board[turn.player + "RoundReserve"].piece = "";
    board[turn.player + "RoundReserve"].width = 0;
    board[turn.player + "RoundReserve"].height = 0;
    board[turn.player + "RoundReserve"].drawable = false;
    changePlayer();
    board[turn.player + "SquareReserve"].drawable = false;
    board[turn.player + "SquareReserve"].piece = "";
    board[turn.player + "SquareReserve"].width = 0;
    board[turn.player + "SquareReserve"].height = 0;
    board[turn.player + "RoundReserve"].piece = "";
    board[turn.player + "RoundReserve"].width = 0;
    board[turn.player + "RoundReserve"].height = 0;
    board[turn.player + "RoundReserve"].drawable = false;
    console.log("resoving refreshBoard.");
    refreshBoard(board);
    return "Player 1: you move first.";
  }

}
//Test whether a space is a reserve square.
function testReserve(space){
  return (space.name.slice(-7) == "Reserve") ? true : false;
}
//Ensure that player_1 only places pieces on the top half of the board,
//player_2 on the bottom.
function testLegalStartSquare(space){
  let num = parseInt(space.name[1]);
  if (turn.player == "player_1"){
    return (num < 5) ? true: false;
  } else {
    return (num > 4) ? true: false;
  }
}
//Move piece from reserve to space; all error handling to be done in handleSetup.
//TODO: Consider moving to piece manipulation section.
function setupPiece(startSpace, targetSpace){
  drawAnyPiece(targetSpace, startSpace.piece);
  let piece = startSpace.piece.slice(8);
  piece = piece[0].toLowerCase() + piece.slice(1);
  --startSpace.num;
  populateReserves();
  return "setupPiece complete.";
}

//FUNCTIONS FOR BOARD generation

//generate space object, add it to the board, takes string with name, an object with params,
//and a second object (for modifying a template object).
function addSpaceToBoard(board, name, extras = false, options = defaultSpace) {
  let thisSpace = {};
  Object.entries(options).forEach(([key, value]) => thisSpace[key] = value);
  thisSpace["name"] = name;
  if (extras) Object.entries(extras).forEach(([key, value]) => thisSpace[key] = value);
  board[name] = thisSpace;
  return board[name];
}

//Supposed to make a square for every playable square on the board.
function addPlayableSpaces(board, spaceObject) {
  Object.entries(spaceObject).forEach(function([key, value]){
    for (var i = value[0]; i <= value[1]; i++){
      let name1 = key + i.toString();
      let extras1 = {
        x: (columns.indexOf(key) * 50) + .5,
        y: i * 50 + 50 + .5
      }
      addSpaceToBoard(board, name1, extras1);
    }
  });
  Object.values(board).forEach((value) => addFourSides(board, value));
  borderTiles.forEach(function(item){
    board[item].drawable = false;
    board[item].placeable = false;
    board[item].width = 0;
    board[item].height = 0;
    if (["a","f"].includes(item[0])) {
      board[item].pushable = false;
    } else {
      board[item].endgame = true;
    }
  });
  return board;
}

//Generate directional edges for a space without space.edges array.
function addFourSides(board, space){
  let column = space.name[0];
  let row = parseInt(space.name[1]);
  let newName = column + String(row - 1);
  space.up = (Object.keys(board).includes(newName) ? board[newName] : false)
  newName = column + String(row + 1);
  space.down = (Object.keys(board).includes(newName) ? board[newName] : false)
  if (column != "a"){
    newName = columns[columns.indexOf(column) - 1] + String(row);
    space.left = (Object.keys(board).includes(newName) ? board[newName] : false)
  } else {
    space.left = false;
  }
  if (column != "f"){
    newName = columns[columns.indexOf(column) + 1] + String(row);
    space.right = (Object.keys(board).includes(newName) ? board[newName] : false)
  } else {
    space.right = false;
  }
}


//return an object with a sub-object for each square on a standard board,
//plus skip and done boxes.  Piece reserves come from addReserves.
function standardBoard(){
  console.log("In standardBoard")
  let board = {};
  let doneExtras = {};
  let skipExtras = {};

  doneExtras.name = "done";
  doneExtras.text = ["DONE"];
  doneExtras.x = 295.5;
  doneExtras.y = 200.5;
  doneExtras.width = 60;
  skipExtras.name = "skip";
  skipExtras.text = ["SKIP"];
  skipExtras.x = 295.5;
  skipExtras.y = 280.5;
  skipExtras.width = 60;

  board = addPlayableSpaces(board, boardSpaces);
  addSpaceToBoard(board, doneExtras.name, doneExtras, defaultControl);
  addSpaceToBoard(board, skipExtras.name, skipExtras, defaultControl);

  return board;
}

//Generate reserve spaces in the board object.  Drawn with populateReserves().
function addReserves(){
  let space = {};
  space.width = 150;
  space.height = 50;
  space.color = colors.lessLight;
  space.x = 25.5;
  space.y = 25.5;
  space.piece = "player_1Square";
  space.name = space.piece + "Reserve";
  space.drawable = true;
  space.num = 3;
  board[space.name] = space;

  let space2 = {}
  Object.entries(space).forEach(([key, value]) => space2[key] = value)
  space2.x += 200;
  space2.piece = "player_1Round";
  space2.name = space2.piece + "Reserve";
  space2.num = 2;
  board[space2.name] = space2;

  let space3 = {}
  Object.entries(space2).forEach(([key, value]) => space3[key] = value)
  space3.y += 500;
  space3.piece = "player_2Round";
  space3.name = space3.piece + "Reserve";
  space3.num = 2;
  board[space3.name] = space3;

  let space4 = {}
  Object.entries(space3).forEach(([key, value]) => space4[key] = value)
  space4.x -= 200;
  space4.piece = "player_2Square";
  space4.name = space4.piece + "Reserve";
  space4.num = 3;
  board[space4.name] = space4;
}

/* Add Pieces to setup boxes. - Plan is to run on initial draw and after every piece is first placed.
TODO: Reorganize these functions in the file.  PopulateReserves is really a setup handler helper function.
the drawing functions should go with the other drawing functions, I imagine.
TODO: Maybe refactor other functions to use addSquare and addCircle...Hide obnoxious
component and strokeRect pattern.  */

function populateReserves(){
  for (let i = 1; i < 3; i++){
    let player = "player_" + i;
    let square1 = board[player + "SquareReserve"];
    let square2 = board[player + "RoundReserve"];
    generateSquares(square1, player, square1.num);
    generateCircles(square2, player, square2.num);
  }
}
//Draw a square on a region.  Centers on 50px / 50px box by default.
//Options will take x, y to give specific offset.
function addSquare(offsetObj, color, options = {}) {
  let {width, height, x, y} = offsetObj;
  if (options == {}) {
    component(30, 30, color, space.x + 10, space.y + 10);
    myGameArea.context.strokeRect(space.x + 10, space.y + 10, 30, 30);
  }  else {
    let {width, height, x, y} = options;
    component(width, height, color, x, y);
    myGameArea.context.strokeRect(x, y, width, height);
  }
}

function addReset(){
  let resetButton = {};
  resetButton.height = 125;
  resetButton.width = 100;
  resetButton.x = 299.5;
  resetButton.y = 299.5;
  resetButton.color = colors.dark;
  resetButton.text = ["RESET"];
  resetButton.name = "reset";
  resetButton.textColor = "white";
  resetButton.piece = false;
  resetButton.drawable = false;
  resetButton.pushable = false;
  resetButton.placeable = false;
  board[resetButton.name] = resetButton;
  let reset = board.reset;

  textBox(reset, reset.textColor, "Arial", 24, reset.text);
}

//Draw a circle on a region.  Centers on box by default.
//Options will take x, y, radius to give specific offset.
function addCircle(offsetObj, color, options = {}) {
  let {width, height, x, y} = offsetObj;
  if (options == {}) {
    drawCircle(15, color, x + (width / 2), y + (height / 2));
  } else {
    let {radius, x, y} = options;
    drawCircle(radius, color, x, y);
  }
}

//generate a number of standard squares in a row.
//Added an option to first clear the region (without removing region.piece).
function generateSquares(offsetObj, player, number, redraw = true) {
  if (redraw) {
    clear(offsetObj, false);
  }
  let {x, y} = offsetObj;
  for (var i = 0; i < number; i++) {
    let options = {}
    options.height = 30;
    options.width = 30;
    options.color = (player == "player_1") ? colors.light : colors.dark;
    options.x = x + 10 + (options.width + 10) * i;
    options.y = y + 10;
    addSquare(offsetObj, options.color, options);
  }
}

//generate a number of standard circles in a row
function generateCircles(offsetObj, player, number, redraw = true){
  if (redraw) {
    clear(offsetObj, false);
  }
  let {x, y} = offsetObj;
  for (var i = 0; i < number; i++) {
    let options = {}
    options.radius = 15;
    options.color = (player == "player_1") ? colors.light : colors.dark;
    options.x = x + 10 + options.radius + (options.radius * 2 + 10) * i;
    options.y = y + 10 + options.radius;
    addCircle(offsetObj, options.color, options);
  }
}

//generates a Sample board for testing.
function makeTestBoard(board){
  drawAnyPiece(board.c3, "player_1Square");
  drawAnyPiece(board.b4, "player_1Square");
  drawAnyPiece(board.c4, "player_1Round");
  drawAnyPiece(board.d4, "player_1Round");
  drawAnyPiece(board.e4, "player_1Square");
  drawAnyPiece(board.b5, "player_2Square");
  drawAnyPiece(board.c5, "player_2Round");
  drawAnyPiece(board.d5, "player_2Round");
  drawAnyPiece(board.d6, "player_2Square");
  drawAnyPiece(board.e5, "player_2Square");
  turn.setup = false;
}

//fake a player_1 win for testing.
function player_1Win(board){
  drawAnyPiece(board.c8, "player_1Square");
  drawAnyPiece(board.d8, "player_2Square");
  turn.setup = false;
  turn.player = "player_1";
  turn.phase = "push";
}

//fake a player_2 win for testing.
function player_2Win(board){
  drawAnyPiece(board.c8, "player_1Square");
  drawAnyPiece(board.d8, "player_2Square");
  turn.setup = false;
  turn.player = "player_2";
  turn.phase = "push";
}

//THIS FUNCTION DOES THE INITIAL CANVAS DRAWING OF THE BOARD
function startGame() {
  myGameArea.start();
  //Draw Background
  component(canvas.width, canvas.height, colors.lessDark, 0, 0);
  drawBoard(board);
  populateReserves();
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
  if (space) {
    console.log("space: ", space);
    handleGame(space);
    }
});

//Adding a call to start the game on page load.
startGame();
