"use strict";
//create a graph data structure
class Graph {
  constructor(numNodes) {
    this.numNodes = numNodes;
    //adjacentNodes is a list of all nodes and their edges
    this.adjacentNodes = new Map();
  }
  //add a new node to the list in adjacentNodes
  addNode(node){
    this.adjacentNodes.set(node, []);
  }
  //addEdge adds two nodes to each other's list of adjacencies
  addEdge(node1, node2){
    this.adjacentNodes.get(node1).push(node2);
    this.adjacentNodes.get(node2).push(node1);
  }
  //return the keys from the adjacentNodes map
  getNodes(){
    let keys = [];
    for (var key of this.adjacentNodes.keys()){
      keys.push(key);
    }
    return keys
  }
  //log getNodes
  printNodes(){
    console.log("Nodes:");
    console.log(this.getNodes());
  }
  //return the edges from the adjacentNodes map
  getEdges(){
    let edges = [];
    for (var [key, value] of this.adjacentNodes) {
      edges.push(value);
    }
    return edges
  }
  //log getEdges
  printEdges(){
    console.log("edges:");
    console.log(this.getEdges());
  }

}

const board = new Graph(8);
const nodes = ["a1","a2","b1","b2","c1","c2","d1","d2"];
for (var node of nodes){
  board.addNode(node);
}
board.printNodes();
board.addEdge("a1", "a2");
board.addEdge("a1", "b1");
board.addEdge("b1", "b2");
board.addEdge("b1", "c1");
board.addEdge("c1", "c2");
board.addEdge("c1", "d1");
board.addEdge("d1", "d2");
board.addEdge("a2", "b2");
board.addEdge("b2", "c2");
board.addEdge("c2", "d2");

board.printEdges();

//Starting work on a canvas element to plug in here.  A re-org will be needed.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d')

//working on making clickable boxes.  Step one seems like a list of boxes
const boxes = [
  {
    name: "boxOne",
    width: 50,
    height: 100,
    color: "black",
    x: 10,
    y: 10
  },
  {
    name: "boxTwo",
    width: 100,
    height: 50,
    color: "black",
    x: 210,
    y: 210
  }
];

function startGame() {
  myGameArea.start();
  // let myGamePiece = new component(30, 30, "red", 10, 120);
  // let boxOne = makeBoardRegion(50, 100, "black", 10, 10, "boxOne");
  // let boxTwo = makeBoardRegion(100, 50, "black", 210, 210, "boxTwo");

  //substituting fixed boxes for iterating over my list.
  for (var box of boxes){
    makeBoardRegion(box.width, box.height, box.color, box.x, box.y, box.name);
  }
}

//Make a function to draw the outlines of empty rectangles.
function makeBoardRegion(width, height, color, x, y, hitId) {
  const ctx = myGameArea.context;
  ctx.strokeRect(x, y, width, height);
}

//this function draws filled rectangles.
function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  const ctx = myGameArea.context;


  ctx.fillStyle = color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
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
    return box.name
  }
  else {
    return false
  }
}
//adding a canvas event listener that can respond to clicking on boxes
canvas.addEventListener('click', (e) => {
  const point = {
    x: e.clientX,
    y: e.clientY
  };
  for (var box of boxes) {
    console.log(isIntersect(point, box));
  }
})

startGame();
