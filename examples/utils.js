const rnd = (min = 20, max = 500) => Math.floor((Math.random() * (max - min)) + min);

const wait = async ({ params }) => new Promise((res) => {
  const timeout = params.time || rnd();
  setTimeout(() => res(`I waited ${timeout}ms, params = ${JSON.stringify(params)}`), timeout);
});

module.exports = { wait, rnd };
