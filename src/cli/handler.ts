import path from 'path';
import { promises as fs } from 'fs';
import { resolveTaskFilePairs } from '../lib/file';
import LogRenderer from '../renderers/Log';
import TaskProgressRenderer from '../renderers/TaskProgress';
import Suite from '../Suite';
import SuiteRunner from '../SuiteRunner';
import { RunOptions } from '../types';
import LogReporter from '../reporters/Log';
import JsonReporter from '../reporters/Json';
import DotReporter from '../reporters/Dot';

let exitRequested = false;
let activeSuiteRunner: SuiteRunner | null = null;

export const run = async (tasksPath: string, options: RunOptions): Promise<void> => {
  const suites = await resolveTaskFilePairs(tasksPath);

  // TODO: Fix these ternaries
  const renderer = !options.renderer
    ? undefined
    : options.renderer === 'log'
    ? new LogRenderer()
    : new TaskProgressRenderer();

  const reportFilePath = path.resolve(process.cwd(), options.output);

  await Object.entries(suites).reduce(async (acc, [name, { flow, actions, hash }]): Promise<any> => {
    await acc;
    if (exitRequested) return;

    if (!flow || !actions || !hash) {
      return console.error(`Missing .flow or .actions file for '${name}', skipping`);
    }

    const reportFileRoot = `${options.plan ? 'plan' : 'run'}_${hash}_${Date.now()}`

    const reporters = [
      new LogReporter(`${reportFilePath}/${reportFileRoot}.log`),
      new JsonReporter(`${reportFilePath}/${reportFileRoot}.json`),
      new DotReporter(`${reportFilePath}/${reportFileRoot}.dot`),
    ]

    const suite = new Suite(flow, actions);
    (global as any).task = (x: any) => {
      return suite.task(x);
    };
    const m = require(path.resolve(process.cwd(), flow));
    if (m instanceof Promise) await m;

    const runner = new SuiteRunner(suite, renderer, async (currentState) => {
      for (const reporter of reporters) {
        const report = await reporter.report(suite.getGraph(), currentState);
        await fs.writeFile(reporter.getOutputFilePath(), report, 'utf8');
      }
    });
    activeSuiteRunner = runner;

    await runner.run({ dryRun: options.plan });
  }, Promise.resolve());

  renderer?.onDestroy();
  activeSuiteRunner = null;
};

export const createExitHandler = (warn = false): (() => void) => {
  let hasWarned = false;

  return function handleExit() {
    if (warn && !hasWarned && activeSuiteRunner) {
      console.warn(`Tasks still running, interupting may have unexpect effects`);
      hasWarned = true;
    } else if (activeSuiteRunner) {
      exitRequested = true;
      console.warn(`Shutting down...`);
      activeSuiteRunner.abort();
    } else {
      process.exit(0);
    }
  };
};
