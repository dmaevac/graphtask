import path from 'path';
import { promises as fs } from 'fs';

export const resolveTaskFilePairs = async (
  folder: string,
): Promise<Record<string, { flow?: string; actions?: string }>> => {
  const fullPath = path.resolve(process.cwd(), folder);
  const stat = await fs.stat(fullPath);
  if (!stat.isDirectory()) {
    throw new Error('Tasks arg must be folder');
  }
  const files = (await fs.readdir(fullPath)) as string[];
  return files.reduce<Record<string, { flow?: string; actions?: string }>>((acc, f: string) => {
    const [, set, type] = f.match(/(\w+)\.(flow|actions)\.\w{2,3}/) || [];
    // TODO: Fix this ugliness
    if (set && type) {
      if (!acc[set]) acc[set] = {};
      if (type === 'flow') acc[set].flow = path.resolve(fullPath, f);
      if (type === 'actions') acc[set].actions = path.resolve(fullPath, f);
    }

    return acc;
  }, {});
};
