const assert = require("assert");
const { wait } = require("./utils");

async function update_settings(arg) {
  return wait({ data: "update", ...arg });
}

async function test1(...args) {
  return wait({ data: Math.random() * 10000, ...args[0] });
}

async function failer() {
  assert.ok(false, "Ok is false");
}

async function errorer() {
  throw new Error("BANNNG");
}

async function create_project(arg) {
  return wait({ data: "create", ...arg });
}

module.exports = {
  update_settings,
  test1,
  failer,
  create_project,
  errorer,
};
