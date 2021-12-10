#!/usr/bin/env node
require('ts-node').register({ transpileOnly: true, preserveSymlinks: true });

import { Command } from 'commander';
import { run, createExitHandler } from './handler';

const program = new Command();

program
  .version('0.0.1')
  .description('GraphTask')

program
  .option('-p, --plan', 'Run the plan without executing actions')
  .option('-r, --renderer <renderer>', 'Renderer to use', 'taskprogress')
  .option('-o, --output <output>', 'Folder to write output', './')
  .argument('<tasksDir>')
  .action(run);

program.parse(process.argv);

process.on('SIGINT', createExitHandler(true));
process.on('SIGQUIT', createExitHandler(true));
process.on('SIGTERM', createExitHandler(false));
