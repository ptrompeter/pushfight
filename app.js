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

function startGame() {
  myGameArea.start();
  // let myGamePiece = new component(30, 30, "red", 10, 120);
}

function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  const ctx = myGameArea.context;
  ctx.strokeRect(110,10,100,100);
  ctx.strokeRect(210,10,100,100);
  ctx.strokeRect(10,110,100,100);
  ctx.strokeRect(110,110,100,100);
  ctx.strokeRect(210,110,100,100);
  ctx.strokeRect(10,210,100,100);
  ctx.strokeRect(110,210,100,100);
  ctx.strokeRect(210,210,100,100);
  ctx.strokeRect(310,210,100,100);
  ctx.strokeRect(10,310,100,100);
  ctx.strokeRect(110,310,100,100);
  ctx.strokeRect(210,310,100,100);
  ctx.strokeRect(310,310,100,100);
  ctx.strokeRect(10,410,100,100);
  ctx.strokeRect(110,410,100,100);
  ctx.strokeRect(210,410,100,100);
  ctx.strokeRect(310,410,100,100);
  ctx.strokeRect(10,510,100,100);
  ctx.strokeRect(110,510,100,100);
  ctx.strokeRect(210,510,100,100);
  ctx.strokeRect(310,510,100,100);
  ctx.strokeRect(110,610,100,100);
  ctx.strokeRect(210,610,100,100);
  ctx.strokeRect(310,610,100,100);
  ctx.strokeRect(110,710,100,100);
  ctx.strokeRect(210,710,100,100);

  ctx.fillStyle = color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
}

var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  }
}
startGame();
