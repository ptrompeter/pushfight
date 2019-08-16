"use strict";

//Starting work on a canvas element to plug in here.  A re-org will be needed.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const board = standardBoard();

//return an object with a sub-object for each square on a standard board
function standardBoard(){
  const board = {}
  const columns = "abcd"
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
  function makeBoxesByColumn(column, topRow, bottomRow){
    for (let i = topRow; i < bottomRow; i++) {
      let name = column + i.toString();
      board[name] = {
        width: 50,
        height: 50,
        color: "black",
        x: (columns.indexOf(column) * 50 + 50),
        y: (i * 50 + 50),
        name: name,
        edges: []
      }
      makeEdges(column, i, name);

    }
  }
  makeBoxesByColumn("a", 1, 6);
  makeBoxesByColumn("b", 0, 8);
  makeBoxesByColumn("c", 0, 8);
  makeBoxesByColumn("d", 2, 7);
  console.log("board: ", board);
  return board;
}

function startGame() {
  myGameArea.start();

  //substituting fixed boxes for iterating over my list.

  for (var key of Object.keys(board)) {
    makeBoardRegion(board[key].width, board[key].height, board[key].color, board[key].x, board[key].y, board[key].name);
  }
  //Add tests for pieces
  drawWhiteSquarePiece("b3");
  drawBrownSquarePiece("b4");
  drawWhiteRoundPiece("c3");
  drawBrownRoundPiece("c4");
}

//Make a function to draw the outlines of empty rectangles.
function makeBoardRegion(width, height, color, x, y, hitId) {
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

//make a function to draw a white square piece on a space
function drawWhiteSquarePiece(spaceName) {
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  component(30, 30, "#FBD5AC", board[spaceName].x + 10, board[spaceName].y + 10);
  myGameArea.context.strokeRect(board[spaceName].x + 10, board[spaceName].y + 10, 30, 30);
}
//make a function to draw a brown square piece on a space
function drawBrownSquarePiece(spaceName) {
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  component(30, 30, "#915C1E", board[spaceName].x + 10, board[spaceName].y + 10);
  myGameArea.context.strokeRect(board[spaceName].x + 10, board[spaceName].y + 10, 30, 30);
}

//make a function to draw a white round piece on a space
function drawWhiteRoundPiece(spaceName){
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  drawCircle(15, "#FBD5AC", board[spaceName].x + 25, board[spaceName].y + 25);
}

function drawBrownRoundPiece(spaceName){
  component(48, 48, "#DDFAFD", board[spaceName].x + 1, board[spaceName].y +1);
  drawCircle(15, "#915C1E", board[spaceName].x + 25, board[spaceName].y + 25);
}

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

//adding a function to detect intersection between a click and my boxes
function isIntersect(point, box) {
  if (box.x <= point.x && point.x <= (box.x + box.width) && box.y <= point.y && point.y <= (box.y + box.height)){
    console.log(box.name);
    return box.name;
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
    name = isIntersect(point, box)
    if (name) {
      drawWhiteRoundPiece(name);
      break;
    };
  }
})

//Adding a standardBoard call here to test.
startGame();
