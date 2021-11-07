/*global task */

const actions = require('./tasks.actions');

const first = task({
  name: 'Wait for some time',
  action: actions.wait,
  params: { some: 'input' }
});

const error = task({
  name: 'Fail because of error',
  action: actions.errorer,
  input: { 'first': first },
  params: { other: 'data' }
});

task({
  name: 'I dont run because all inputs failed',
  action: actions.wait,
  input: [error]
})

task({
  name: 'I run because some inputs succeeded',
  action: actions.wait,
  input: [error, first],
  params: { some: 'other input' },
})
