const assert = require('assert');
const { wait } = require('../utils');

module.exports = {
  async getRandom({ params }) {
    return { data: Math.floor(Math.random() * params.max || 100) };
  },

  async getMaxNumber({ input }) {
    const allVals = input.filter(i => i?.data).map((i) => i.data);

    return { calculation: allVals.join(), data: Math.max(...allVals) };
  },

  async addParamValue({ params: { number }, input }) {
    const vals = input.reduce((acc, i) => acc + i.data, 0);
    return { data: number + vals };
  },

  async minusX({ params: { number }, input: [{ data }] }) {
    return { data: data - number };
  },

  async multiplyBy10({ input: [{ data }] }) {
    return { data: data * 10 };
  },

  async sleep({ params: { time }, input: [a] }) {
    await wait({ params: { time } });
    return a;
  },

  async failer() {
    assert.ok(false, 'Ok is false');
  },

  async errorer() {
    throw new Error('Something bad happened');
  }
};
