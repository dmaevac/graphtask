import chalk from 'chalk';
import { TaskStatus } from '../TaskStateStore';

export const stateColorFn: Record<TaskStatus, chalk.Chalk> = {
  aborted: chalk.yellow,
  failed: chalk.bgRed,
  pending: chalk.gray,
  started: chalk.blue,
  succeeded: chalk.green,
};

export const stateColor: Record<TaskStatus, string> = {
  aborted: 'yellow',
  failed: 'red',
  pending: 'black',
  started: 'blue',
  succeeded: 'green',
};
