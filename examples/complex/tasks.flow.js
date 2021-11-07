/*global task */

const actions = require('./tasks.actions');

const numbers = [4, 8, 15, 16, 23, 42];

const start = task({ name: 'Pick num, max 10', action: actions.getRandom, params: { max: 10 } });
const secondary = task({ name: 'Pick another number', action: actions.getRandom, params: { max: 10 } });

const all = numbers.map((num, idx) => {
  const addParamValue = task({
    name: `Add ${num}`,
    input: [start, ...idx >= 4 ? [secondary] : []],
    action: idx === 2 ? actions.errorer : actions.addParamValue,
    params: { number: num },
  });

  const waitSomeTime = task({
    name: `Wait some time`,
    input: [addParamValue],
    action: actions.sleep,
    params: { time: num * 100 },
  });

  const multiplyBy10 = task({
    name: `Multiply by random`,
    input: [waitSomeTime],
    action: actions.multiplyBy10,
  });

  const subtasks =
    idx === 1
      ? [10, 20, 30].map((n) =>
          task({
            name: `Minus ${n} from number`,
            input: [multiplyBy10],
            action: actions.minusX,
            params: { number: n },
          }),
        )
      : [];

  return [multiplyBy10, ...subtasks];
});

task({
  name: `Find the highest`,
  input: [...all.flat()],
  action: actions.getMaxNumber,
});
