const path = require('path');
const { Suite } = require('../lib/cjs/Suite');
const { SuiteRunner } = require('../lib/cjs/SuiteRunner');
const tests = require('./tests');

const runtimes = [
  { name: 'rt1', versions: [{ number: '1.1.1' }] },
  { name: 'rt2', versions: [{ number: '1.0' }, { number: '2.0' }] },
  { name: 'rt3', versions: [{ number: '5.6' }, { number: '7.8' }] },
];

(async () => {
  const suite = await Suite.create(path.resolve(__dirname, 'tests.js'), async ({ add }) => {
    const createProjectTest = add({ name: 'create project', action: tests.create_project });

    const x = add({ name: 'other thing project', action: tests.create_project });

    const y = add({ name: 'other thing project child', parents: [x], action: tests.test1 });

    const y2 = [1, 2, 3, 4, 5].map((n) =>
      add({
        name: `other thing project many child ${n}`,
        parents: [x],
        action: tests.test1,
      }),
    );

    const z = add({ name: 'other thing project child failer', parents: [y, ...y2], action: tests.failer });

    const z2 = add({ name: 'other thing project child', parents: [y], action: tests.test1 });

    add({ name: 'NEVER HAPPENDS', parents: [z, z2], action: tests.failer });

    const all = runtimes.map((rt, rti) => {
      const envTasks = rt.versions.map((rv, rvi) => {
        const nn = add({ name: `test rt ${rt.name} ${rv.number}`, parents: [createProjectTest], action: tests.test1 });

        const waited = add({
          name: `wait for project  ${rt.name} ${rv.number}`,
          parents: [nn],
          action: rti === 2 && rvi === 1 ? tests.errorer : tests.test1,
        });

        const updaedSettings = add({
          name: `update proj settings  ${rt.name} ${rv.number}`,
          parents: [waited],
          action: tests.update_settings,
        });

        const createEnv = add({
          name: `create env  ${rt.name} ${rv.number}`,
          parents: [updaedSettings],
          action: tests.test1,
        });

        return createEnv;
      });

      return add({ name: `after create envs ${rt.name}`, parents: envTasks, action: tests.test1 });
    });

    return add({ name: 'lastly', parents: all, action: tests.test1 });
  });

  const runner = new SuiteRunner(suite);

  await runner.run();
})();
