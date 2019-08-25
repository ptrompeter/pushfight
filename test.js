const myObj = {
  height: 8,
  width: 7
};

function blarg(params){
  const { height, width } = params;
  console.log(height);
}

function blarg2({ height, width }){
  console.log(height);
}


blarg(myObj);
blarg2(myObj);

function testTernary(){
  let myObj = {};
  let myArray = ["foo", "far", 2, {"a": "a code", b: "b code"}];
  (myArray[0] = "foo") ? myObj["foo"] = myArray[0] : false;
  return myObj
}
console.log(testTernary().foo)

let testObj = {"foo": "bar"}
testObj.testArrow = function(){
  return this.foo;
}

console.log("Hoping for bar!")
console.log(testObj.testArrow())
