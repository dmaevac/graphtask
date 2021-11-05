const rnd = (min = 0, max = 50) => Math.floor((Math.random() * (max - min)) + min);

const wait = async (data = {}, timeout = rnd()) => new Promise((res) => {
  setTimeout(() => res(data), timeout);
});

module.exports = { wait, rnd };
