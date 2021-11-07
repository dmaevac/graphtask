const assert = require('assert');
const { wait } = require('../utils');

module.exports = {
  wait,

  async errorer() {
    throw new Error('BANNNG');
  }
};
