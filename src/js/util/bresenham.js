//var tiles = require("./level").tiles;
var helpers = require("./../helpers.js");

function bline(x0, y0, x1, y1) {

  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  var err = (dx>dy ? dx : -dy)/2;

  while (true) {

    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }

    var tileX = Math.floor(x0 / 32);
    var tileY = Math.floor(y0 / 32);

    if (tileX > window.game.level.colTileCount || tileY > window.game.level.rowTileCount) return; // outside of map
    if (helpers.getTile(tileX,tileY) === 1) return {x: tileX, y: tileY}; // collision!
  }
}

module.exports = bline;
