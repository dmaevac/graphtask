import path from 'path';
import { promises as fs } from 'fs';
import { crc32 } from '../utils/string';

type TaskPair = { flow?: string; actions?: string; hash?: string };

const createPairHash = async (flowPath: string, actionsPath: string) => {
  const [file1, file2] = await Promise.all([
    fs.readFile(flowPath, 'utf8'),
    fs.readFile(actionsPath, 'utf8'),
  ]);

  return String(crc32(file1 + file2, true));
}

export const resolveTaskFilePairs = async (
  folder: string,
): Promise<Record<string, TaskPair>> => {
  const fullPath = path.resolve(process.cwd(), folder);
  const stat = await fs.stat(fullPath);
  if (!stat.isDirectory()) {
    throw new Error('Tasks arg must be folder');
  }
  const files = (await fs.readdir(fullPath)) as string[];

  const sets = files.reduce<Record<string, TaskPair>>(
    (acc, filename: string) => {
      const [, set, type] = filename.match(/(\w+)\.(flow|actions)\.\w{2,3}/) || [];
      // TODO: Fix this ugliness
      if (set && type) {
        if (!acc[set]) acc[set] = {};
        if (type === 'flow') acc[set].flow = path.resolve(fullPath, filename);
        if (type === 'actions') acc[set].actions = path.resolve(fullPath, filename);
      }

      return acc;
    },
    {},
  );

  await Promise.all(Object.keys(sets).map(async key => {
    const { flow, actions }  = sets[key];
    if (flow && actions) {
      sets[key].hash = await createPairHash(flow, actions);
    }
  }));

  return sets;
};
