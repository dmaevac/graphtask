import path from 'path';
import { promises as fs } from 'fs';
import { resolveTaskFilePairs } from '../lib/file';
import LogRenderer from '../renderers/Log';
import TaskProgressRenderer from '../renderers/TaskProgress';
import { getReporterForFilePath } from '../reporters';
import Suite from '../Suite';
import SuiteRunner from '../SuiteRunner';
import { RunOptions } from '../types';

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

  const reporter = await getReporterForFilePath(options.output);

  await Object.entries(suites).reduce(async (acc, [name, { flow, actions }]): Promise<any> => {
    await acc;
    if (exitRequested) return;

    if (!flow || !actions) {
      return console.error(`Missing .flow or .actions file for '${name}', skipping`);
    }

    const suite = new Suite(flow, actions);
    (global as any).task = (x: any) => {
      return suite.task(x);
    };
    const m = require(path.resolve(process.cwd(), flow));
    if (m instanceof Promise) await m;

    const runner = new SuiteRunner(suite, renderer);
    activeSuiteRunner = runner;
    const finalState = options.plan ? runner.getState() : await runner.run();

    if (reporter) {
      const report = await reporter.report(suite.getGraph(), finalState);
      await fs.writeFile(reporter.getOutputFilePath(), report, 'utf8');
    }
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
