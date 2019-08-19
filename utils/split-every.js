'use strict';

const splitEvery = (n, xs, y=[]) =>
  xs.length===0 ? y : splitEvery(n, xs.slice(n), y.concat([xs.slice(0, n)]))


module.exports = splitEvery;