import { promises as fs } from 'fs';
import path from 'path';
import Node from '../Node';
import { IReporter } from '../types';
import DotReporter from './Dot';
import JsonReporter from './Json';
import LogReporter from './Log';

export const getReporterForFilePath = async (filePath?: string): Promise<IReporter<Node> | undefined> => {
  if (!filePath) return undefined;
  const ext = path.extname(filePath);
  const fullFilePath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(fullFilePath);
  const dirState = await fs.stat(dir);

  if (!dirState || !dirState.isDirectory) {
    throw new Error(`Output directory not found '${dir}'`);
  }

  switch (ext) {
    case '.log':
      return new LogReporter(fullFilePath);
    case '.json':
      return new JsonReporter(fullFilePath);
    case '.dot':
      return new DotReporter(fullFilePath);
    default:
      throw new Error(`Output path '${filePath}', must be either .log, .json or .dot'`);
  }
};
