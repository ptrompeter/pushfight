"use strict";

// const row1 = document.getElementById("row1");
// const row2 = document.getElementById("row2");
$( document ).ready(function() {
  const row1 = $('#row1');
  const row2 = $('#row2');
  const gameLink = document.getElementById("game-link");
  const rulesLink = document.getElementById("rules-link");
  const body = $("body");

  rulesLink.addEventListener('click', (e) => {
    row1.fadeOut(400, function(){
      row2.fadeIn(400);
    });
  });

  gameLink.addEventListener('click', (e) => {
    row2.fadeOut(400, function(){
      row1.fadeIn(400);
      refreshBoard(board);
    });
  });
  if (colors) {
    body.css({"background-color": colors.lessDark, "color": "white"})

  }
  row2.hide();
  // row2.css("opacity", 1);
});
